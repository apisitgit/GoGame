import { getApiBaseUrl } from "./config";
import type { HealthResponse, HealthState } from "./types";

export async function fetchHealth(): Promise<HealthState> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/health`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return {
        status: "offline",
        message: `Health check failed with HTTP ${response.status}`,
      };
    }

    const payload = (await response.json()) as HealthResponse;

    if (payload.status !== "ok" || !payload.service) {
      return {
        status: "offline",
        message: "Health response shape is invalid",
      };
    }

    return {
      status: "online",
      service: payload.service,
      version: payload.version,
    };
  } catch (error) {
    return {
      status: "offline",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

