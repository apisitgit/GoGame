package http

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/socket9companylimited/go-quest/apps/api/internal/config"
)

type healthResponse struct {
	Status  string `json:"status"`
	Service string `json:"service"`
	Version string `json:"version"`
}

func NewRouter(cfg config.Config, logger *slog.Logger) http.Handler {
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(requestLogger(logger))
	router.Use(securityHeaders())
	router.Use(cors(cfg.AllowedOrigin))

	router.GET("/health", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, healthResponse{
			Status:  "ok",
			Service: "go-quest-api",
			Version: "dev",
		})
	})

	return router
}

func requestLogger(logger *slog.Logger) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		start := time.Now()
		ctx.Next()

		logger.Info(
			"http request",
			"method", ctx.Request.Method,
			"path", ctx.Request.URL.Path,
			"status", ctx.Writer.Status(),
			"duration_ms", time.Since(start).Milliseconds(),
		)
	}
}

func securityHeaders() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Header("X-Content-Type-Options", "nosniff")
		ctx.Header("X-Frame-Options", "DENY")
		ctx.Header("Referrer-Policy", "no-referrer")
		ctx.Header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		ctx.Next()
	}
}

func cors(allowedOrigin string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		origin := ctx.GetHeader("Origin")
		if origin == allowedOrigin {
			ctx.Header("Access-Control-Allow-Origin", allowedOrigin)
			ctx.Header("Vary", "Origin")
			ctx.Header("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS")
			ctx.Header("Access-Control-Allow-Headers", "Content-Type,Authorization")
		}

		if ctx.Request.Method == http.MethodOptions {
			ctx.AbortWithStatus(http.StatusNoContent)
			return
		}

		ctx.Next()
	}
}
