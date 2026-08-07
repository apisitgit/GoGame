package execution

type Status string

const (
	StatusPassed       Status = "passed"
	StatusFailed       Status = "failed"
	StatusCompileError Status = "compile_error"
	StatusRuntimeError Status = "runtime_error"
	StatusTimeout      Status = "timeout"
	StatusRejected     Status = "rejected"
	StatusInternal     Status = "internal_error"
)

type Command string

const (
	CommandRun  Command = "run"
	CommandTest Command = "test"
)

type Request struct {
	Language   string  `json:"language"`
	SourceCode string  `json:"sourceCode"`
	TestSource string  `json:"testSource,omitempty"`
	Command    Command `json:"command,omitempty"`
}

type TestSummary struct {
	Passed int `json:"passed"`
	Failed int `json:"failed"`
	Total  int `json:"total"`
	Score  int `json:"score"`
}

type Result struct {
	Status          Status       `json:"status"`
	Stdout          string       `json:"stdout"`
	Stderr          string       `json:"stderr"`
	Message         string       `json:"message"`
	ExecutionTimeMS int64        `json:"executionTimeMs"`
	OutputTruncated bool         `json:"outputTruncated"`
	Tests           *TestSummary `json:"tests,omitempty"`
}
