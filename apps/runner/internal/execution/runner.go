package execution

import (
	"context"
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

	if err := writeWorkspace(workspace, request.SourceCode); err != nil {
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
	command := exec.Command("go", "run", ".")
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
		return Result{
			Status:          classifyExecutionError(stderr.String()),
			Stdout:          stdout.String(),
			Stderr:          stderr.String(),
			Message:         "โปรแกรมยังรันไม่ผ่าน ลองอ่าน error แล้วแก้ทีละจุด",
			ExecutionTimeMS: elapsed,
			OutputTruncated: stdout.Truncated() || stderr.Truncated(),
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

func writeWorkspace(workspace string, sourceCode string) error {
	if err := os.WriteFile(filepath.Join(workspace, "go.mod"), []byte("module goquestsubmission\n\ngo 1.23.0\n"), 0o600); err != nil {
		return fmt.Errorf("write go.mod: %w", err)
	}

	if err := os.WriteFile(filepath.Join(workspace, "main.go"), []byte(sourceCode), 0o600); err != nil {
		return fmt.Errorf("write main.go: %w", err)
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
