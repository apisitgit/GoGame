package config

import "testing"

func TestLoadRejectsWildcardCORS(t *testing.T) {
	t.Setenv("CORS_ALLOWED_ORIGIN", "*")

	_, err := Load()
	if err == nil {
		t.Fatal("expected wildcard CORS to be rejected")
	}
}

func TestLoadRequiresRunnerURLWhenRunnerEnabled(t *testing.T) {
	t.Setenv("CODE_RUNNER_ENABLED", "true")
	t.Setenv("RUNNER_URL", "")

	_, err := Load()
	if err == nil {
		t.Fatal("expected missing runner URL to be rejected")
	}
}

func TestLoadUsesDevelopmentDefaults(t *testing.T) {
	t.Setenv("API_PORT", "")
	t.Setenv("CORS_ALLOWED_ORIGIN", "")
	t.Setenv("APP_ENV", "")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("expected config to load: %v", err)
	}

	if cfg.Port != "8080" {
		t.Fatalf("expected default port 8080, got %s", cfg.Port)
	}

	if cfg.AllowedOrigin != "http://localhost:5173" {
		t.Fatalf("expected local frontend origin, got %s", cfg.AllowedOrigin)
	}

	if cfg.MigrationsDir != "migrations" {
		t.Fatalf("expected default migrations dir, got %s", cfg.MigrationsDir)
	}

	if cfg.MaxSourceBytes != 20_000 {
		t.Fatalf("expected default max source bytes, got %d", cfg.MaxSourceBytes)
	}
}
