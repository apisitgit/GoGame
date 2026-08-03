package config

import (
	"testing"
	"time"
)

func TestLoadUsesDefaults(t *testing.T) {
	t.Setenv("RUNNER_PORT", "")
	t.Setenv("RUNNER_TIMEOUT_MS", "")
	t.Setenv("RUNNER_MAX_SOURCE_BYTES", "")
	t.Setenv("RUNNER_MAX_OUTPUT_BYTES", "")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("expected config to load: %v", err)
	}

	if cfg.Port != "8090" {
		t.Fatalf("expected default port, got %s", cfg.Port)
	}
	if cfg.Timeout != 5000*time.Millisecond {
		t.Fatalf("expected default timeout, got %s", cfg.Timeout)
	}
	if cfg.MaxSourceBytes != 20_000 {
		t.Fatalf("expected default max source bytes, got %d", cfg.MaxSourceBytes)
	}
	if cfg.MaxOutputBytes != 20_000 {
		t.Fatalf("expected default max output bytes, got %d", cfg.MaxOutputBytes)
	}
}

func TestLoadRejectsInvalidLimits(t *testing.T) {
	t.Setenv("RUNNER_TIMEOUT_MS", "0")

	if _, err := Load(); err == nil {
		t.Fatal("expected zero timeout to be rejected")
	}
}
