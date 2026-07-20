package config

import (
	"errors"
	"os"
)

type Config struct {
	Port              string
	AllowedOrigin     string
	Environment       string
	DatabaseURL       string
	MigrationsDir     string
	CodeRunnerEnabled bool
}

func Load() (Config, error) {
	cfg := Config{
		Port:          getEnv("API_PORT", "8080"),
		AllowedOrigin: getEnv("CORS_ALLOWED_ORIGIN", "http://localhost:5173"),
		Environment:   getEnv("APP_ENV", "development"),
		DatabaseURL:   os.Getenv("DATABASE_URL"),
		MigrationsDir: getEnv("MIGRATIONS_DIR", "migrations"),
	}

	if cfg.Port == "" {
		return Config{}, errors.New("API_PORT must not be empty")
	}

	if cfg.AllowedOrigin == "*" {
		return Config{}, errors.New("CORS_ALLOWED_ORIGIN must be a specific origin")
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
