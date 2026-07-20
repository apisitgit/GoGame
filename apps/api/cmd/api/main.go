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

	"github.com/socket9companylimited/go-quest/apps/api/internal/config"
	httpserver "github.com/socket9companylimited/go-quest/apps/api/internal/http"
	"github.com/socket9companylimited/go-quest/apps/api/internal/platform/database"
	"github.com/socket9companylimited/go-quest/apps/api/internal/platform/migrations"
	"github.com/socket9companylimited/go-quest/apps/api/internal/progress"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	cfg, err := config.Load()
	if err != nil {
		logger.Error("failed to load config", "error", err)
		os.Exit(1)
	}

	var store httpserver.LearningStore
	var closeDatabase func()
	if cfg.DatabaseURL != "" {
		dbCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		pool, err := database.Connect(dbCtx, cfg.DatabaseURL)
		cancel()
		if err != nil {
			logger.Error("failed to connect database", "error", err)
			os.Exit(1)
		}

		migrationCtx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
		if err := migrations.Run(migrationCtx, pool, cfg.MigrationsDir); err != nil {
			cancel()
			pool.Close()
			logger.Error("failed to run migrations", "error", err)
			os.Exit(1)
		}
		cancel()

		store = progress.NewStore(pool)
		closeDatabase = pool.Close
		logger.Info("database connected", "migrations_dir", cfg.MigrationsDir)
	}

	if closeDatabase != nil {
		defer closeDatabase()
	}

	router := httpserver.NewRouter(cfg, logger, store)
	server := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	go func() {
		logger.Info("api server listening", "addr", server.Addr)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("api server failed", "error", err)
			os.Exit(1)
		}
	}()

	shutdownCtx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	<-shutdownCtx.Done()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		logger.Error("graceful shutdown failed", "error", err)
		os.Exit(1)
	}

	logger.Info("api server stopped")
}
