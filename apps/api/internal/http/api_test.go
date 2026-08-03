package http

import (
	"bytes"
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/socket9companylimited/go-quest/apps/api/internal/config"
	"github.com/socket9companylimited/go-quest/apps/api/internal/domain"
	"github.com/socket9companylimited/go-quest/apps/api/internal/progress"
	"github.com/socket9companylimited/go-quest/apps/api/internal/runner"
)

const testPlayerID = "11111111-1111-4111-8111-111111111111"

func TestAPIRoutesReturnServiceUnavailableWithoutStore(t *testing.T) {
	router := NewRouter(config.Config{
		AllowedOrigin:  "http://localhost:5173",
		Environment:    "test",
		MaxSourceBytes: 20_000,
	}, slog.Default(), nil, nil)

	request := httptest.NewRequest(http.MethodGet, "/api/v1/lessons", nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	if response.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d", response.Code)
	}

	if !strings.Contains(response.Body.String(), "service_unavailable") {
		t.Fatal("expected standard service unavailable error")
	}
}

func TestGetProgressValidatesPlayerID(t *testing.T) {
	router := NewRouter(config.Config{
		AllowedOrigin:  "http://localhost:5173",
		Environment:    "test",
		MaxSourceBytes: 20_000,
	}, slog.Default(), fakeStore{}, nil)

	request := httptest.NewRequest(http.MethodGet, "/api/v1/progress/not-a-uuid", nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	if response.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", response.Code)
	}
}

func TestCreateSubmissionReturnsCreatedSubmission(t *testing.T) {
	router := NewRouter(config.Config{
		AllowedOrigin:  "http://localhost:5173",
		Environment:    "test",
		MaxSourceBytes: 20_000,
	}, slog.Default(), fakeStore{}, nil)
	body := bytes.NewBufferString(`{
		"playerId":"11111111-1111-4111-8111-111111111111",
		"questId":"hello-gopher",
		"lessonId":"hello-world-001",
		"sourceSize":82,
		"status":"passed",
		"stdoutPreview":"สวัสดี Gopher",
		"feedback":"ผ่านแล้ว"
	}`)
	request := httptest.NewRequest(http.MethodPost, "/api/v1/submissions", body)
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	if response.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d with %s", response.Code, response.Body.String())
	}

	var submission domain.Submission
	if err := json.Unmarshal(response.Body.Bytes(), &submission); err != nil {
		t.Fatalf("decode submission: %v", err)
	}

	if submission.Status != domain.SubmissionStatusPassed {
		t.Fatalf("expected passed submission, got %s", submission.Status)
	}
}

func TestCreateSubmissionRejectsSourcePayloadField(t *testing.T) {
	router := NewRouter(config.Config{
		AllowedOrigin:  "http://localhost:5173",
		Environment:    "test",
		MaxSourceBytes: 20_000,
	}, slog.Default(), fakeStore{}, nil)
	body := bytes.NewBufferString(`{
		"playerId":"11111111-1111-4111-8111-111111111111",
		"questId":"hello-gopher",
		"lessonId":"hello-world-001",
		"sourceSize":82,
		"status":"wat"
	}`)
	request := httptest.NewRequest(http.MethodPost, "/api/v1/submissions", body)
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	if response.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", response.Code)
	}

	if !strings.Contains(response.Body.String(), "invalid_request") {
		t.Fatal("expected invalid request error")
	}
}

func TestCreateSubmissionRejectsOversizedSourceMetadata(t *testing.T) {
	router := NewRouter(config.Config{
		AllowedOrigin:  "http://localhost:5173",
		Environment:    "test",
		MaxSourceBytes: 20_000,
	}, slog.Default(), fakeStore{}, nil)
	body := bytes.NewBufferString(`{
		"playerId":"11111111-1111-4111-8111-111111111111",
		"questId":"hello-gopher",
		"lessonId":"hello-world-001",
		"sourceSize":20001,
		"status":"passed"
	}`)
	request := httptest.NewRequest(http.MethodPost, "/api/v1/submissions", body)
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	if response.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", response.Code)
	}

	if !strings.Contains(response.Body.String(), "sourceSize") {
		t.Fatal("expected sourceSize validation error")
	}
}

func TestRunCodeReturnsServiceUnavailableWithoutRunner(t *testing.T) {
	router := NewRouter(config.Config{
		AllowedOrigin:  "http://localhost:5173",
		Environment:    "test",
		MaxSourceBytes: 20_000,
	}, slog.Default(), fakeStore{}, nil)
	body := bytes.NewBufferString(`{
		"questId":"hello-gopher",
		"lessonId":"hello-world-001",
		"sourceCode":"package main\n\nfunc main() {}"
	}`)
	request := httptest.NewRequest(http.MethodPost, "/api/v1/code/run", body)
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	if response.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d", response.Code)
	}
}

func TestRunCodeForwardsSourceToRunner(t *testing.T) {
	fakeRunner := fakeCodeRunner{
		result: runner.RunResult{
			Status:  runner.StatusPassed,
			Stdout:  "สวัสดี Gopher\n",
			Message: "โปรแกรมรันสำเร็จ",
		},
	}
	router := NewRouter(config.Config{
		AllowedOrigin:  "http://localhost:5173",
		Environment:    "test",
		MaxSourceBytes: 20_000,
	}, slog.Default(), fakeStore{}, &fakeRunner)
	body := bytes.NewBufferString(`{
		"questId":"hello-gopher",
		"lessonId":"hello-world-001",
		"sourceCode":"package main\n\nfunc main() {}"
	}`)
	request := httptest.NewRequest(http.MethodPost, "/api/v1/code/run", body)
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d with %s", response.Code, response.Body.String())
	}
	if fakeRunner.seenSource == "" {
		t.Fatal("expected API to forward source code to runner")
	}
	if !strings.Contains(response.Body.String(), "passed") {
		t.Fatal("expected runner result")
	}
}

func TestRunCodeRejectsOversizedSource(t *testing.T) {
	router := NewRouter(config.Config{
		AllowedOrigin:  "http://localhost:5173",
		Environment:    "test",
		MaxSourceBytes: 10,
	}, slog.Default(), fakeStore{}, &fakeCodeRunner{})
	body := bytes.NewBufferString(`{
		"questId":"hello-gopher",
		"lessonId":"hello-world-001",
		"sourceCode":"package main\n\nfunc main() {}"
	}`)
	request := httptest.NewRequest(http.MethodPost, "/api/v1/code/run", body)
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	if response.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", response.Code)
	}
	if !strings.Contains(response.Body.String(), "sourceCode") {
		t.Fatal("expected sourceCode validation error")
	}
}

type fakeStore struct{}

type fakeCodeRunner struct {
	result     runner.RunResult
	err        error
	seenSource string
}

func (fakeRunner *fakeCodeRunner) RunCode(_ context.Context, request runner.RunRequest) (runner.RunResult, error) {
	fakeRunner.seenSource = request.SourceCode
	return fakeRunner.result, fakeRunner.err
}

func (fakeStore) ListLessons(context.Context) ([]domain.Lesson, error) {
	return []domain.Lesson{
		{
			ID:       "hello-world-001",
			QuestID:  "hello-gopher",
			Title:    "คำทักทายจาก Gopher",
			World:    "beginner-village",
			Concepts: []string{"package-main"},
			Content:  json.RawMessage(`{}`),
		},
	}, nil
}

func (fakeStore) GetLesson(context.Context, string) (domain.Lesson, error) {
	return domain.Lesson{ID: "hello-world-001"}, nil
}

func (fakeStore) GetProgress(context.Context, string) (domain.PlayerProgress, error) {
	return domain.PlayerProgress{
		PlayerID: testPlayerID,
		TotalEXP: 0,
		Quests: []domain.QuestProgress{
			{
				QuestID:   "hello-gopher",
				Status:    domain.QuestStatusAvailable,
				EarnedEXP: 0,
				UpdatedAt: time.Now(),
			},
		},
	}, nil
}

func (fakeStore) UpsertQuestProgress(context.Context, progress.UpsertQuestProgressInput) (domain.PlayerProgress, error) {
	return domain.PlayerProgress{PlayerID: testPlayerID}, nil
}

func (fakeStore) CreateSubmission(_ context.Context, input progress.CreateSubmissionInput) (domain.Submission, error) {
	return domain.Submission{
		ID:            "22222222-2222-4222-8222-222222222222",
		PlayerID:      input.PlayerID,
		QuestID:       input.QuestID,
		LessonID:      input.LessonID,
		SourceSize:    input.SourceSize,
		Status:        input.Status,
		StdoutPreview: input.StdoutPreview,
		Feedback:      input.Feedback,
		CreatedAt:     time.Now(),
	}, nil
}

func (fakeStore) GetSubmission(context.Context, string) (domain.Submission, error) {
	return domain.Submission{
		ID:        "22222222-2222-4222-8222-222222222222",
		PlayerID:  testPlayerID,
		QuestID:   "hello-gopher",
		LessonID:  "hello-world-001",
		Status:    domain.SubmissionStatusPassed,
		CreatedAt: time.Now(),
	}, nil
}
