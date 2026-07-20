import { afterEach, describe, expect, it, vi } from "vitest";
import { createSubmissionMetadata, syncQuestProgress } from "./progress";

describe("progress api", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("syncs quest progress without sending source code", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      syncQuestProgress({
        playerId: "11111111-1111-4111-8111-111111111111",
        questId: "hello-gopher",
        status: "active",
      }),
    ).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/progress/11111111-1111-4111-8111-111111111111",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          questId: "hello-gopher",
          status: "active",
        }),
      }),
    );
  });

  it("creates submission metadata without source code", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createSubmissionMetadata({
        playerId: "11111111-1111-4111-8111-111111111111",
        questId: "hello-gopher",
        lessonId: "hello-world-001",
        sourceSize: 82,
        status: "passed",
        stdoutPreview: "สวัสดี Gopher",
        feedback: "ผ่านแล้ว",
      }),
    ).resolves.toBe(true);

    const requestInit = fetchMock.mock.calls[0][1] as RequestInit;
    expect(requestInit.body).not.toContain("sourceCode");
    expect(requestInit.body).not.toContain("package main");
  });

  it("returns false when backend is offline", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(
      syncQuestProgress({
        playerId: "11111111-1111-4111-8111-111111111111",
        questId: "hello-gopher",
        status: "active",
      }),
    ).resolves.toBe(false);
  });
});
