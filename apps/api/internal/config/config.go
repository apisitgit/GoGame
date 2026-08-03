package config

import (
	"errors"
	"os"
	"strconv"
)

type Config struct {
	Port              string
	AllowedOrigin     string
	Environment       string
	DatabaseURL       string
	MigrationsDir     string
	CodeRunnerEnabled bool
	RunnerURL         string
	MaxSourceBytes    int
}

func Load() (Config, error) {
	cfg := Config{
		Port:          getEnv("API_PORT", "8080"),
		AllowedOrigin: getEnv("CORS_ALLOWED_ORIGIN", "http://localhost:5173"),
		Environment:   getEnv("APP_ENV", "development"),
		DatabaseURL:   os.Getenv("DATABASE_URL"),
		MigrationsDir: getEnv("MIGRATIONS_DIR", "migrations"),
		CodeRunnerEnabled: getBoolEnv(
			"CODE_RUNNER_ENABLED",
			false,
		),
		RunnerURL:      os.Getenv("RUNNER_URL"),
		MaxSourceBytes: getIntEnv("MAX_SOURCE_BYTES", 20_000),
	}

	if cfg.Port == "" {
		return Config{}, errors.New("API_PORT must not be empty")
	}

	if cfg.AllowedOrigin == "*" {
		return Config{}, errors.New("CORS_ALLOWED_ORIGIN must be a specific origin")
	}
	if cfg.CodeRunnerEnabled && cfg.RunnerURL == "" {
		return Config{}, errors.New("RUNNER_URL must be set when CODE_RUNNER_ENABLED=true")
	}
	if cfg.MaxSourceBytes <= 0 {
		return Config{}, errors.New("MAX_SOURCE_BYTES must be greater than zero")
	}

	return cfg, nil
}

func getEnv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}

func getBoolEnv(key string, fallback bool) bool {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return fallback
	}

	return parsed
}

func getIntEnv(key string, fallback int) int {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}

	return parsed
}
