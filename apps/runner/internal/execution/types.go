package execution

type Status string

const (
	StatusPassed       Status = "passed"
	StatusCompileError Status = "compile_error"
	StatusRuntimeError Status = "runtime_error"
	StatusTimeout      Status = "timeout"
	StatusRejected     Status = "rejected"
	StatusInternal     Status = "internal_error"
)

type Request struct {
	Language   string `json:"language"`
	SourceCode string `json:"sourceCode"`
}

type Result struct {
	Status          Status `json:"status"`
	Stdout          string `json:"stdout"`
	Stderr          string `json:"stderr"`
	Message         string `json:"message"`
	ExecutionTimeMS int64  `json:"executionTimeMs"`
	OutputTruncated bool   `json:"outputTruncated"`
}
