package config

import (
	"errors"
	"os"
	"strconv"
	"time"
)

type Config struct {
	Port           string
	Timeout        time.Duration
	MaxSourceBytes int
	MaxOutputBytes int
}

func Load() (Config, error) {
	cfg := Config{
		Port:           getEnv("RUNNER_PORT", "8090"),
		Timeout:        getDurationEnv("RUNNER_TIMEOUT_MS", 10_000),
		MaxSourceBytes: getIntEnv("RUNNER_MAX_SOURCE_BYTES", 20_000),
		MaxOutputBytes: getIntEnv("RUNNER_MAX_OUTPUT_BYTES", 20_000),
	}

	if cfg.Port == "" {
		return Config{}, errors.New("RUNNER_PORT must not be empty")
	}
	if cfg.Timeout <= 0 {
		return Config{}, errors.New("RUNNER_TIMEOUT_MS must be greater than zero")
	}
	if cfg.MaxSourceBytes <= 0 {
		return Config{}, errors.New("RUNNER_MAX_SOURCE_BYTES must be greater than zero")
	}
	if cfg.MaxOutputBytes <= 0 {
		return Config{}, errors.New("RUNNER_MAX_OUTPUT_BYTES must be greater than zero")
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

func getDurationEnv(key string, fallbackMilliseconds int) time.Duration {
	return time.Duration(getIntEnv(key, fallbackMilliseconds)) * time.Millisecond
}
