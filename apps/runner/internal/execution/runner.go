package execution

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"syscall"
	"time"
)

type Runner struct {
	timeout        time.Duration
	maxSourceBytes int
	maxOutputBytes int
}

func NewRunner(timeout time.Duration, maxSourceBytes int, maxOutputBytes int) Runner {
	return Runner{
		timeout:        timeout,
		maxSourceBytes: maxSourceBytes,
		maxOutputBytes: maxOutputBytes,
	}
}

func (runner Runner) Run(ctx context.Context, request Request) Result {
	startedAt := time.Now()

	if err := validateRequest(request, runner.maxSourceBytes); err != nil {
		return Result{
			Status:          StatusRejected,
			Message:         err.Error(),
			ExecutionTimeMS: time.Since(startedAt).Milliseconds(),
		}
	}

	workspace, err := os.MkdirTemp("", "go-quest-run-*")
	if err != nil {
		return Result{
			Status:          StatusInternal,
			Message:         "runner สร้างพื้นที่ชั่วคราวไม่สำเร็จ",
			ExecutionTimeMS: time.Since(startedAt).Milliseconds(),
		}
	}
	defer os.RemoveAll(workspace)

	if err := writeWorkspace(workspace, request.SourceCode, request.TestSource); err != nil {
		return Result{
			Status:          StatusInternal,
			Message:         "runner เตรียม source code ไม่สำเร็จ",
			ExecutionTimeMS: time.Since(startedAt).Milliseconds(),
		}
	}

	runCtx, cancel := context.WithTimeout(ctx, runner.timeout)
	defer cancel()

	stdout := newCappedBuffer(runner.maxOutputBytes)
	stderr := newCappedBuffer(runner.maxOutputBytes)
	command := exec.Command("go", commandArgs(request.Command)...)
	command.Dir = workspace
	command.Env = safeCommandEnv(workspace)
	command.Stdout = stdout
	command.Stderr = stderr
	command.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}

	err = runProcess(runCtx, command)
	elapsed := time.Since(startedAt).Milliseconds()

	if errors.Is(err, context.DeadlineExceeded) {
		return Result{
			Status:          StatusTimeout,
			Stdout:          stdout.String(),
			Stderr:          stderr.String(),
			Message:         "โปรแกรมใช้เวลานานเกิน limit ของ runner",
			ExecutionTimeMS: elapsed,
			OutputTruncated: stdout.Truncated() || stderr.Truncated(),
		}
	}

	if err != nil {
		if request.Command == CommandTest {
			testOutput := extractGoTestOutput(stdout.String())
			tests := parseGoTestSummary(stdout.String())
			status := classifyGoTestError(testOutput, stderr.String(), tests)
			return Result{
				Status:          status,
				Stdout:          "",
				Stderr:          testOutput + stderr.String(),
				Message:         buildGoTestMessage(status),
				ExecutionTimeMS: elapsed,
				OutputTruncated: stdout.Truncated() || stderr.Truncated(),
				Tests:           tests,
			}
		}

		return Result{
			Status:          classifyExecutionError(stderr.String()),
			Stdout:          stdout.String(),
			Stderr:          stderr.String(),
			Message:         "โปรแกรมยังรันไม่ผ่าน ลองอ่าน error แล้วแก้ทีละจุด",
			ExecutionTimeMS: elapsed,
			OutputTruncated: stdout.Truncated() || stderr.Truncated(),
		}
	}

	if request.Command == CommandTest {
		tests := parseGoTestSummary(stdout.String())
		return Result{
			Status:          StatusPassed,
			Stdout:          "",
			Stderr:          "",
			Message:         "ผ่าน test cases แล้ว",
			ExecutionTimeMS: elapsed,
			OutputTruncated: stdout.Truncated() || stderr.Truncated(),
			Tests:           tests,
		}
	}

	return Result{
		Status:          StatusPassed,
		Stdout:          stdout.String(),
		Stderr:          stderr.String(),
		Message:         "โปรแกรมรันสำเร็จ",
		ExecutionTimeMS: elapsed,
		OutputTruncated: stdout.Truncated() || stderr.Truncated(),
	}
}

func commandArgs(command Command) []string {
	if command == CommandTest {
		return []string{"test", "-json", "-count=1", "."}
	}

	return []string{"run", "."}
}

func runProcess(ctx context.Context, command *exec.Cmd) error {
	if err := command.Start(); err != nil {
		return err
	}

	done := make(chan error, 1)
	go func() {
		done <- command.Wait()
	}()

	select {
	case err := <-done:
		return err
	case <-ctx.Done():
		if command.Process != nil {
			_ = syscall.Kill(-command.Process.Pid, syscall.SIGKILL)
		}
		<-done
		return ctx.Err()
	}
}

func writeWorkspace(workspace string, sourceCode string, testSource string) error {
	if err := os.WriteFile(filepath.Join(workspace, "go.mod"), []byte("module goquestsubmission\n\ngo 1.23.0\n"), 0o600); err != nil {
		return fmt.Errorf("write go.mod: %w", err)
	}

	if err := os.WriteFile(filepath.Join(workspace, "main.go"), []byte(sourceCode), 0o600); err != nil {
		return fmt.Errorf("write main.go: %w", err)
	}

	if testSource != "" {
		if err := os.WriteFile(filepath.Join(workspace, "main_test.go"), []byte(testSource), 0o600); err != nil {
			return fmt.Errorf("write main_test.go: %w", err)
		}
	}

	return nil
}

func safeCommandEnv(workspace string) []string {
	return []string{
		"PATH=" + os.Getenv("PATH"),
		"HOME=" + workspace,
		"GOCACHE=" + filepath.Join(os.TempDir(), "go-quest-gocache"),
		"GOMODCACHE=" + filepath.Join(os.TempDir(), "go-quest-gomodcache"),
		"GOFLAGS=-mod=readonly -buildvcs=false",
		"GOWORK=off",
		"CGO_ENABLED=0",
	}
}

func classifyExecutionError(stderr string) Status {
	lowerStderr := strings.ToLower(stderr)
	if strings.Contains(lowerStderr, "panic:") {
		return StatusRuntimeError
	}

	return StatusCompileError
}

type goTestEvent struct {
	Action string `json:"Action"`
	Test   string `json:"Test"`
	Output string `json:"Output"`
}

func parseGoTestSummary(rawOutput string) *TestSummary {
	summary := &TestSummary{}
	seen := make(map[string]Status)

	for _, line := range strings.Split(rawOutput, "\n") {
		var event goTestEvent
		if err := json.Unmarshal([]byte(line), &event); err != nil {
			continue
		}
		if event.Test == "" {
			continue
		}
		switch event.Action {
		case "pass":
			seen[event.Test] = StatusPassed
		case "fail":
			seen[event.Test] = StatusFailed
		}
	}

	for _, status := range seen {
		summary.Total++
		if status == StatusPassed {
			summary.Passed++
		}
		if status == StatusFailed {
			summary.Failed++
		}
	}

	if summary.Total > 0 {
		summary.Score = (summary.Passed * 100) / summary.Total
	}

	return summary
}

func extractGoTestOutput(rawOutput string) string {
	var builder strings.Builder
	for _, line := range strings.Split(rawOutput, "\n") {
		var event goTestEvent
		if err := json.Unmarshal([]byte(line), &event); err != nil {
			continue
		}
		if event.Output != "" {
			builder.WriteString(event.Output)
		}
	}

	return builder.String()
}

func classifyGoTestError(testOutput string, stderr string, tests *TestSummary) Status {
	lowerOutput := strings.ToLower(testOutput + stderr)
	if strings.Contains(lowerOutput, "panic:") {
		return StatusRuntimeError
	}
	if tests != nil && tests.Failed > 0 {
		return StatusFailed
	}

	return StatusCompileError
}

func buildGoTestMessage(status Status) string {
	switch status {
	case StatusFailed:
		return "ยังไม่ผ่าน test cases ของภารกิจ"
	case StatusRuntimeError:
		return "โปรแกรมเกิด runtime error ระหว่างตรวจด้วย test cases"
	default:
		return "ยัง compile หรือ test ไม่ผ่าน"
	}
}
