package http

import (
	"context"
	"errors"
	"net/http"
	"regexp"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/socket9companylimited/go-quest/apps/api/internal/domain"
	"github.com/socket9companylimited/go-quest/apps/api/internal/progress"
	"github.com/socket9companylimited/go-quest/apps/api/internal/runner"
)

const maxPreviewLength = 2000
const maxSubmissionSourceSize = 20_000
const maxCodeRunRequestsPerMinute = 20

var uuidPattern = regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`)

type LearningStore interface {
	ListLessons(ctx context.Context) ([]domain.Lesson, error)
	GetLesson(ctx context.Context, lessonID string) (domain.Lesson, error)
	GetProgress(ctx context.Context, playerID string) (domain.PlayerProgress, error)
	UpsertQuestProgress(ctx context.Context, input progress.UpsertQuestProgressInput) (domain.PlayerProgress, error)
	CreateSubmission(ctx context.Context, input progress.CreateSubmissionInput) (domain.Submission, error)
	GetSubmission(ctx context.Context, submissionID string) (domain.Submission, error)
}

type CodeRunner interface {
	RunCode(ctx context.Context, request runner.RunRequest) (runner.RunResult, error)
}

type apiHandler struct {
	store          LearningStore
	codeRunner     CodeRunner
	maxSourceBytes int
	runLimiter     *codeRunRateLimiter
}

type errorResponse struct {
	Error apiError `json:"error"`
}

type apiError struct {
	Code    string         `json:"code"`
	Message string         `json:"message"`
	Details map[string]any `json:"details,omitempty"`
}

type updateProgressRequest struct {
	QuestID string             `json:"questId"`
	Status  domain.QuestStatus `json:"status"`
}

type createSubmissionRequest struct {
	PlayerID      string                  `json:"playerId"`
	QuestID       string                  `json:"questId"`
	LessonID      string                  `json:"lessonId"`
	SourceSize    int                     `json:"sourceSize"`
	Status        domain.SubmissionStatus `json:"status"`
	StdoutPreview string                  `json:"stdoutPreview"`
	Feedback      string                  `json:"feedback"`
}

type runCodeRequest struct {
	QuestID    string `json:"questId"`
	LessonID   string `json:"lessonId"`
	SourceCode string `json:"sourceCode"`
}

func registerAPIRoutes(router *gin.Engine, store LearningStore, codeRunner CodeRunner, maxSourceBytes int) {
	handler := apiHandler{
		store:          store,
		codeRunner:     codeRunner,
		maxSourceBytes: maxSourceBytes,
		runLimiter:     newCodeRunRateLimiter(maxCodeRunRequestsPerMinute, time.Minute),
	}

	api := router.Group("/api/v1")
	api.GET("/lessons", handler.listLessons)
	api.GET("/lessons/:id", handler.getLesson)
	api.GET("/progress/:playerId", handler.getProgress)
	api.PUT("/progress/:playerId", handler.updateProgress)
	api.POST("/code/run", handler.runCode)
	api.POST("/submissions", handler.createSubmission)
	api.GET("/submissions/:id", handler.getSubmission)
}

func (handler apiHandler) runCode(ctx *gin.Context) {
	if handler.codeRunner == nil {
		writeError(ctx, http.StatusServiceUnavailable, "service_unavailable", "development runner ยังไม่พร้อมใช้งาน", nil)
		return
	}

	if !handler.runLimiter.Allow(ctx.ClientIP()) {
		writeError(ctx, http.StatusTooManyRequests, "rate_limited", "ส่งโค้ดถี่เกินไป กรุณารอสักครู่", nil)
		return
	}

	var request runCodeRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		writeError(ctx, http.StatusBadRequest, "invalid_request", "ข้อมูล source code ไม่ถูกต้อง", nil)
		return
	}

	if validationErrors := validateRunCodeRequest(request, handler.maxSourceBytes); len(validationErrors) > 0 {
		writeError(ctx, http.StatusBadRequest, "invalid_request", "ข้อมูล source code ไม่ถูกต้อง", validationErrors)
		return
	}

	result, err := handler.codeRunner.RunCode(ctx.Request.Context(), runner.RunRequest{
		Language:   "go",
		SourceCode: request.SourceCode,
	})
	if err != nil {
		writeError(ctx, http.StatusBadGateway, "runner_unavailable", "runner ยังไม่ตอบสนอง กรุณาลองใหม่อีกครั้ง", nil)
		return
	}

	ctx.JSON(http.StatusOK, result)
}

func (handler apiHandler) listLessons(ctx *gin.Context) {
	if handler.store == nil {
		writeError(ctx, http.StatusServiceUnavailable, "service_unavailable", "ฐานข้อมูลยังไม่พร้อมใช้งาน", nil)
		return
	}

	lessons, err := handler.store.ListLessons(ctx.Request.Context())
	if err != nil {
		writeInternalError(ctx)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"lessons": lessons})
}

func (handler apiHandler) getLesson(ctx *gin.Context) {
	if handler.store == nil {
		writeError(ctx, http.StatusServiceUnavailable, "service_unavailable", "ฐานข้อมูลยังไม่พร้อมใช้งาน", nil)
		return
	}

	lesson, err := handler.store.GetLesson(ctx.Request.Context(), ctx.Param("id"))
	if errors.Is(err, progress.ErrNotFound) {
		writeError(ctx, http.StatusNotFound, "not_found", "ไม่พบบทเรียนที่ระบุ", nil)
		return
	}
	if err != nil {
		writeInternalError(ctx)
		return
	}

	ctx.JSON(http.StatusOK, lesson)
}

func (handler apiHandler) getProgress(ctx *gin.Context) {
	if handler.store == nil {
		writeError(ctx, http.StatusServiceUnavailable, "service_unavailable", "ฐานข้อมูลยังไม่พร้อมใช้งาน", nil)
		return
	}

	playerID := ctx.Param("playerId")
	if !isUUID(playerID) {
		writeError(ctx, http.StatusBadRequest, "invalid_request", "playerId ต้องเป็น UUID", nil)
		return
	}

	playerProgress, err := handler.store.GetProgress(ctx.Request.Context(), playerID)
	if err != nil {
		writeInternalError(ctx)
		return
	}

	ctx.JSON(http.StatusOK, playerProgress)
}

func (handler apiHandler) updateProgress(ctx *gin.Context) {
	if handler.store == nil {
		writeError(ctx, http.StatusServiceUnavailable, "service_unavailable", "ฐานข้อมูลยังไม่พร้อมใช้งาน", nil)
		return
	}

	playerID := ctx.Param("playerId")
	if !isUUID(playerID) {
		writeError(ctx, http.StatusBadRequest, "invalid_request", "playerId ต้องเป็น UUID", nil)
		return
	}

	var request updateProgressRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		writeError(ctx, http.StatusBadRequest, "invalid_request", "ข้อมูล progress ไม่ถูกต้อง", nil)
		return
	}

	if request.QuestID == "" || !domain.IsQuestStatus(request.Status) {
		writeError(ctx, http.StatusBadRequest, "invalid_request", "questId และ status ต้องถูกต้อง", nil)
		return
	}

	playerProgress, err := handler.store.UpsertQuestProgress(ctx.Request.Context(), progress.UpsertQuestProgressInput{
		PlayerID: playerID,
		QuestID:  request.QuestID,
		Status:   request.Status,
	})
	if errors.Is(err, progress.ErrNotFound) {
		writeError(ctx, http.StatusNotFound, "not_found", "ไม่พบ quest ที่ระบุ", nil)
		return
	}
	if err != nil {
		writeInternalError(ctx)
		return
	}

	ctx.JSON(http.StatusOK, playerProgress)
}

func (handler apiHandler) createSubmission(ctx *gin.Context) {
	if handler.store == nil {
		writeError(ctx, http.StatusServiceUnavailable, "service_unavailable", "ฐานข้อมูลยังไม่พร้อมใช้งาน", nil)
		return
	}

	var request createSubmissionRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		writeError(ctx, http.StatusBadRequest, "invalid_request", "ข้อมูล submission ไม่ถูกต้อง", nil)
		return
	}

	if validationErrors := validateSubmissionRequest(request); len(validationErrors) > 0 {
		writeError(ctx, http.StatusBadRequest, "invalid_request", "ข้อมูล submission ไม่ถูกต้อง", validationErrors)
		return
	}

	submission, err := handler.store.CreateSubmission(ctx.Request.Context(), progress.CreateSubmissionInput{
		PlayerID:      request.PlayerID,
		QuestID:       request.QuestID,
		LessonID:      request.LessonID,
		SourceSize:    request.SourceSize,
		Status:        request.Status,
		StdoutPreview: request.StdoutPreview,
		Feedback:      request.Feedback,
	})
	if errors.Is(err, progress.ErrNotFound) {
		writeError(ctx, http.StatusNotFound, "not_found", "ไม่พบ quest หรือ lesson ที่ระบุ", nil)
		return
	}
	if err != nil {
		writeInternalError(ctx)
		return
	}

	ctx.JSON(http.StatusCreated, submission)
}

func (handler apiHandler) getSubmission(ctx *gin.Context) {
	if handler.store == nil {
		writeError(ctx, http.StatusServiceUnavailable, "service_unavailable", "ฐานข้อมูลยังไม่พร้อมใช้งาน", nil)
		return
	}

	submissionID := ctx.Param("id")
	if !isUUID(submissionID) {
		writeError(ctx, http.StatusBadRequest, "invalid_request", "submission id ต้องเป็น UUID", nil)
		return
	}

	submission, err := handler.store.GetSubmission(ctx.Request.Context(), submissionID)
	if errors.Is(err, progress.ErrNotFound) {
		writeError(ctx, http.StatusNotFound, "not_found", "ไม่พบ submission ที่ระบุ", nil)
		return
	}
	if err != nil {
		writeInternalError(ctx)
		return
	}

	ctx.JSON(http.StatusOK, submission)
}

func validateSubmissionRequest(request createSubmissionRequest) map[string]any {
	validationErrors := make(map[string]any)

	if !isUUID(request.PlayerID) {
		validationErrors["playerId"] = "ต้องเป็น UUID"
	}
	if request.QuestID == "" {
		validationErrors["questId"] = "ต้องไม่ว่าง"
	}
	if request.LessonID == "" {
		validationErrors["lessonId"] = "ต้องไม่ว่าง"
	}
	if request.SourceSize < 0 {
		validationErrors["sourceSize"] = "ต้องมากกว่าหรือเท่ากับ 0"
	}
	if request.SourceSize > maxSubmissionSourceSize {
		validationErrors["sourceSize"] = "ขนาด source metadata เกินกว่าที่กำหนด"
	}
	if !domain.IsSubmissionStatus(request.Status) {
		validationErrors["status"] = "status ไม่ถูกต้อง"
	}
	if len(request.StdoutPreview) > maxPreviewLength {
		validationErrors["stdoutPreview"] = "ยาวเกินกว่าที่กำหนด"
	}
	if len(request.Feedback) > maxPreviewLength {
		validationErrors["feedback"] = "ยาวเกินกว่าที่กำหนด"
	}

	return validationErrors
}

func validateRunCodeRequest(request runCodeRequest, maxSourceBytes int) map[string]any {
	validationErrors := make(map[string]any)

	if request.QuestID == "" {
		validationErrors["questId"] = "ต้องไม่ว่าง"
	}
	if request.LessonID == "" {
		validationErrors["lessonId"] = "ต้องไม่ว่าง"
	}
	if request.SourceCode == "" {
		validationErrors["sourceCode"] = "ต้องไม่ว่าง"
	}
	if len([]byte(request.SourceCode)) > maxSourceBytes {
		validationErrors["sourceCode"] = "ขนาด source code เกินกว่าที่กำหนด"
	}

	return validationErrors
}

func writeInternalError(ctx *gin.Context) {
	writeError(ctx, http.StatusInternalServerError, "internal_error", "ระบบมีปัญหา กรุณาลองใหม่อีกครั้ง", nil)
}

func writeError(ctx *gin.Context, statusCode int, code string, message string, details map[string]any) {
	ctx.JSON(statusCode, errorResponse{
		Error: apiError{
			Code:    code,
			Message: message,
			Details: details,
		},
	})
}

func isUUID(value string) bool {
	return uuidPattern.MatchString(value)
}

type codeRunRateLimiter struct {
	mu       sync.Mutex
	limit    int
	window   time.Duration
	requests map[string][]time.Time
}

func newCodeRunRateLimiter(limit int, window time.Duration) *codeRunRateLimiter {
	return &codeRunRateLimiter{
		limit:    limit,
		window:   window,
		requests: make(map[string][]time.Time),
	}
}

func (limiter *codeRunRateLimiter) Allow(key string) bool {
	limiter.mu.Lock()
	defer limiter.mu.Unlock()

	now := time.Now()
	windowStart := now.Add(-limiter.window)
	entries := limiter.requests[key]
	kept := entries[:0]
	for _, entry := range entries {
		if entry.After(windowStart) {
			kept = append(kept, entry)
		}
	}

	if len(kept) >= limiter.limit {
		limiter.requests[key] = kept
		return false
	}

	limiter.requests[key] = append(kept, now)
	return true
}
