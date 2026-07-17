package http

import (
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/socket9companylimited/go-quest/apps/api/internal/config"
)

func TestHealthEndpoint(t *testing.T) {
	router := NewRouter(config.Config{
		AllowedOrigin: "http://localhost:5173",
		Environment:   "test",
	}, slog.Default())

	request := httptest.NewRequest(http.MethodGet, "/health", nil)
	request.Header.Set("Origin", "http://localhost:5173")
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", response.Code)
	}

	if response.Header().Get("Access-Control-Allow-Origin") != "http://localhost:5173" {
		t.Fatal("expected configured CORS origin")
	}

	if response.Header().Get("X-Content-Type-Options") != "nosniff" {
		t.Fatal("expected security headers")
	}
}

func TestCORSRejectsUnknownOrigin(t *testing.T) {
	router := NewRouter(config.Config{
		AllowedOrigin: "http://localhost:5173",
		Environment:   "test",
	}, slog.Default())

	request := httptest.NewRequest(http.MethodGet, "/health", nil)
	request.Header.Set("Origin", "https://evil.example")
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	if response.Header().Get("Access-Control-Allow-Origin") != "" {
		t.Fatal("expected unknown origin to be rejected")
	}
}
