package http

import (
	"bytes"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/socket9companylimited/go-quest/apps/runner/internal/execution"
)

func TestHealthEndpoint(t *testing.T) {
	router := NewRouter(slog.Default(), execution.NewRunner(time.Second, 20_000, 20_000))
	request := httptest.NewRequest(http.MethodGet, "/health", nil)
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", response.Code)
	}
	if response.Header().Get("X-Content-Type-Options") != "nosniff" {
		t.Fatal("expected security header")
	}
}

func TestRunEndpointRejectsInvalidJSON(t *testing.T) {
	router := NewRouter(slog.Default(), execution.NewRunner(time.Second, 20_000, 20_000))
	request := httptest.NewRequest(http.MethodPost, "/run", bytes.NewBufferString(`{`))
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	if response.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", response.Code)
	}
	if !strings.Contains(response.Body.String(), "invalid_request") {
		t.Fatal("expected invalid request error")
	}
}
