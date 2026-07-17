import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchHealth } from "./health";

describe("fetchHealth", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps a healthy backend response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: "ok",
          service: "go-quest-api",
          version: "dev",
        }),
      }),
    );

    await expect(fetchHealth()).resolves.toEqual({
      status: "online",
      service: "go-quest-api",
      version: "dev",
    });
  });

  it("returns offline when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await expect(fetchHealth()).resolves.toEqual({
      status: "offline",
      message: "network down",
    });
  });
});

