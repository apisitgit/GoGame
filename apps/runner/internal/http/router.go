package http

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/socket9companylimited/go-quest/apps/runner/internal/execution"
)

type Router struct {
	logger *slog.Logger
	runner execution.Runner
}

type healthResponse struct {
	Status  string `json:"status"`
	Service string `json:"service"`
	Version string `json:"version"`
}

type errorResponse struct {
	Error apiError `json:"error"`
}

type apiError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func NewRouter(logger *slog.Logger, runner execution.Runner) http.Handler {
	router := Router{logger: logger, runner: runner}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", router.health)
	mux.HandleFunc("POST /run", router.run)

	return securityHeaders(requestLogger(logger, mux))
}

func (router Router) health(writer http.ResponseWriter, request *http.Request) {
	writeJSON(writer, http.StatusOK, healthResponse{
		Status:  "ok",
		Service: "go-quest-runner",
		Version: "dev",
	})
}

func (router Router) run(writer http.ResponseWriter, request *http.Request) {
	defer request.Body.Close()

	var runRequest execution.Request
	decoder := json.NewDecoder(request.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&runRequest); err != nil {
		writeError(writer, http.StatusBadRequest, "invalid_request", "ข้อมูล source code ไม่ถูกต้อง")
		return
	}

	result := router.runner.Run(request.Context(), runRequest)
	status := http.StatusOK
	if result.Status == execution.StatusRejected {
		status = http.StatusBadRequest
	}

	writeJSON(writer, status, result)
}

func requestLogger(logger *slog.Logger, next http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		next.ServeHTTP(writer, request)

		logger.Info(
			"runner request",
			"method", request.Method,
			"path", request.URL.Path,
		)
	})
}

func securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		writer.Header().Set("X-Content-Type-Options", "nosniff")
		writer.Header().Set("X-Frame-Options", "DENY")
		writer.Header().Set("Referrer-Policy", "no-referrer")
		next.ServeHTTP(writer, request)
	})
}

func writeJSON(writer http.ResponseWriter, status int, payload any) {
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(status)
	_ = json.NewEncoder(writer).Encode(payload)
}

func writeError(writer http.ResponseWriter, status int, code string, message string) {
	writeJSON(writer, status, errorResponse{
		Error: apiError{
			Code:    code,
			Message: message,
		},
	})
}
