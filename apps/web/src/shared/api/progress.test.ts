import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createSubmissionMetadata,
  fetchPlayerProgress,
  syncQuestProgress,
} from "./progress";

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

  it("fetches backend progression for the current player", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            playerId: "11111111-1111-4111-8111-111111111111",
            totalExp: 100,
            level: {
              level: 2,
              currentExp: 100,
              currentLevelExp: 100,
              nextLevelExp: 250,
              expToNextLevel: 150,
              progressPercent: 0,
            },
            quests: [
              {
                questId: "hello-gopher",
                status: "completed",
                earnedExp: 100,
                updatedAt: "2026-08-13T00:00:00Z",
              },
            ],
            achievements: [],
            skillTree: [],
          }),
          { status: 200 },
        ),
      ),
    );

    const progress = await fetchPlayerProgress(
      "11111111-1111-4111-8111-111111111111",
    );

    expect(progress?.totalExp).toBe(100);
    expect(progress?.quests[0].status).toBe("completed");
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
