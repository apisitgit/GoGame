package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/socket9companylimited/go-quest/apps/runner/internal/config"
	"github.com/socket9companylimited/go-quest/apps/runner/internal/execution"
	httpserver "github.com/socket9companylimited/go-quest/apps/runner/internal/http"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	cfg, err := config.Load()
	if err != nil {
		logger.Error("failed to load runner config", "error", err)
		os.Exit(1)
	}

	router := httpserver.NewRouter(
		logger,
		execution.NewRunner(cfg.Timeout, cfg.MaxSourceBytes, cfg.MaxOutputBytes),
	)
	server := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       cfg.Timeout + 2*time.Second,
		WriteTimeout:      cfg.Timeout + 2*time.Second,
		IdleTimeout:       30 * time.Second,
	}

	go func() {
		logger.Info("runner server listening", "addr", server.Addr)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("runner server failed", "error", err)
			os.Exit(1)
		}
	}()

	shutdownCtx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	<-shutdownCtx.Done()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		logger.Error("runner graceful shutdown failed", "error", err)
		os.Exit(1)
	}

	logger.Info("runner server stopped")
}
