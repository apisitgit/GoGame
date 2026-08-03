package runner

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

type Status string

const (
	StatusPassed       Status = "passed"
	StatusCompileError Status = "compile_error"
	StatusRuntimeError Status = "runtime_error"
	StatusTimeout      Status = "timeout"
	StatusRejected     Status = "rejected"
	StatusInternal     Status = "internal_error"
)

type RunRequest struct {
	Language   string `json:"language"`
	SourceCode string `json:"sourceCode"`
}

type RunResult struct {
	Status          Status `json:"status"`
	Stdout          string `json:"stdout"`
	Stderr          string `json:"stderr"`
	Message         string `json:"message"`
	ExecutionTimeMS int64  `json:"executionTimeMs"`
	OutputTruncated bool   `json:"outputTruncated"`
}

type Client struct {
	baseURL    string
	httpClient *http.Client
}

func NewClient(baseURL string) Client {
	return Client{
		baseURL: strings.TrimRight(baseURL, "/"),
		httpClient: &http.Client{
			Timeout: 6 * time.Second,
		},
	}
}

func (client Client) RunCode(ctx context.Context, request RunRequest) (RunResult, error) {
	payload, err := json.Marshal(request)
	if err != nil {
		return RunResult{}, fmt.Errorf("marshal runner request: %w", err)
	}

	httpRequest, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		client.baseURL+"/run",
		bytes.NewReader(payload),
	)
	if err != nil {
		return RunResult{}, fmt.Errorf("create runner request: %w", err)
	}
	httpRequest.Header.Set("Content-Type", "application/json")

	response, err := client.httpClient.Do(httpRequest)
	if err != nil {
		return RunResult{}, fmt.Errorf("call runner: %w", err)
	}
	defer response.Body.Close()

	var result RunResult
	if err := json.NewDecoder(response.Body).Decode(&result); err != nil {
		return RunResult{}, fmt.Errorf("decode runner response: %w", err)
	}

	if response.StatusCode >= http.StatusInternalServerError {
		return RunResult{}, fmt.Errorf("runner returned %d", response.StatusCode)
	}

	return result, nil
}
