package execution

import (
	"context"
	"strings"
	"testing"
	"time"
)

func TestRunnerExecutesSimpleGoProgram(t *testing.T) {
	runner := NewRunner(10*time.Second, 20_000, 20_000)

	result := runner.Run(context.Background(), Request{
		Language: "go",
		SourceCode: `package main

import "fmt"

func main() {
	fmt.Println("สวัสดี Gopher")
}
`,
	})

	if result.Status != StatusPassed {
		t.Fatalf("expected passed, got %s with stderr %s", result.Status, result.Stderr)
	}
	if !strings.Contains(result.Stdout, "สวัสดี Gopher") {
		t.Fatalf("expected stdout to contain greeting, got %q", result.Stdout)
	}
}

func TestRunnerReturnsCompileError(t *testing.T) {
	runner := NewRunner(10*time.Second, 20_000, 20_000)

	result := runner.Run(context.Background(), Request{
		Language: "go",
		SourceCode: `package main

func main() {
	fmt.Println("missing import")
}
`,
	})

	if result.Status != StatusCompileError {
		t.Fatalf("expected compile_error, got %s", result.Status)
	}
}

func TestRunnerReturnsRuntimeErrorForPanic(t *testing.T) {
	runner := NewRunner(10*time.Second, 20_000, 20_000)

	result := runner.Run(context.Background(), Request{
		Language: "go",
		SourceCode: `package main

func main() {
	panic("boom")
}
`,
	})

	if result.Status != StatusRuntimeError {
		t.Fatalf("expected runtime_error, got %s", result.Status)
	}
}

func TestRunnerTimesOutInfiniteLoop(t *testing.T) {
	runner := NewRunner(200*time.Millisecond, 20_000, 20_000)

	result := runner.Run(context.Background(), Request{
		Language: "go",
		SourceCode: `package main

func main() {
	for {
	}
}
`,
	})

	if result.Status != StatusTimeout {
		t.Fatalf("expected timeout, got %s", result.Status)
	}
}

func TestRunnerRejectsDeniedImport(t *testing.T) {
	runner := NewRunner(10*time.Second, 20_000, 20_000)

	result := runner.Run(context.Background(), Request{
		Language: "go",
		SourceCode: `package main

import "os"

func main() {
	_, _ = os.ReadFile("/etc/passwd")
}
`,
	})

	if result.Status != StatusRejected {
		t.Fatalf("expected rejected, got %s", result.Status)
	}
	if !strings.Contains(result.Message, "os") {
		t.Fatalf("expected rejection message to mention os, got %q", result.Message)
	}
}

func TestRunnerCapsOutput(t *testing.T) {
	runner := NewRunner(10*time.Second, 20_000, 5)

	result := runner.Run(context.Background(), Request{
		Language: "go",
		SourceCode: `package main

import "fmt"

func main() {
	fmt.Print("1234567890")
}
`,
	})

	if result.Status != StatusPassed {
		t.Fatalf("expected passed, got %s", result.Status)
	}
	if result.Stdout != "12345" {
		t.Fatalf("expected capped stdout, got %q", result.Stdout)
	}
	if !result.OutputTruncated {
		t.Fatal("expected output to be marked as truncated")
	}
}

func TestRunnerRunsGoTests(t *testing.T) {
	runner := NewRunner(10*time.Second, 20_000, 20_000)

	result := runner.Run(context.Background(), Request{
		Language: "go",
		Command:  CommandTest,
		SourceCode: `package main

func Add(a int, b int) int {
	return a + b
}
`,
		TestSource: `package main

import "testing"

func TestAdd(t *testing.T) {
	if Add(2, 3) != 5 {
		t.Fatal("expected Add to return 5")
	}
}
`,
	})

	if result.Status != StatusPassed {
		t.Fatalf("expected passed, got %s with stderr %s", result.Status, result.Stderr)
	}
	if result.Tests == nil || result.Tests.Passed != 1 || result.Tests.Score != 100 {
		t.Fatalf("expected one passed test, got %#v", result.Tests)
	}
}

func TestRunnerReturnsFailedGoTests(t *testing.T) {
	runner := NewRunner(10*time.Second, 20_000, 20_000)

	result := runner.Run(context.Background(), Request{
		Language: "go",
		Command:  CommandTest,
		SourceCode: `package main

func Add(a int, b int) int {
	return a - b
}
`,
		TestSource: `package main

import "testing"

func TestAdd(t *testing.T) {
	if Add(2, 3) != 5 {
		t.Fatal("expected Add to return 5")
	}
}
`,
	})

	if result.Status != StatusFailed {
		t.Fatalf("expected failed, got %s", result.Status)
	}
	if result.Tests == nil || result.Tests.Failed != 1 || result.Tests.Score != 0 {
		t.Fatalf("expected one failed test, got %#v", result.Tests)
	}
}

func TestRunnerRejectsTestCommandWithoutTestSource(t *testing.T) {
	runner := NewRunner(10*time.Second, 20_000, 20_000)

	result := runner.Run(context.Background(), Request{
		Language: "go",
		Command:  CommandTest,
		SourceCode: `package main

func main() {}
`,
	})

	if result.Status != StatusRejected {
		t.Fatalf("expected rejected, got %s", result.Status)
	}
}
