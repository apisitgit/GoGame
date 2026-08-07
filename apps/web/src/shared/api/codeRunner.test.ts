import { afterEach, describe, expect, it, vi } from "vitest";
import { runGoCode, submitGoCode } from "./codeRunner";

describe("runGoCode", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts source code to the API runner endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "passed",
          stdout: "สวัสดี Gopher\n",
          stderr: "",
          message: "โปรแกรมรันสำเร็จ",
          executionTimeMs: 10,
          outputTruncated: false,
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await runGoCode({
      questId: "hello-gopher",
      lessonId: "hello-world-001",
      sourceCode: "package main\n\nfunc main() {}",
    });

    expect(result.status).toBe("passed");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/code/run",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("package main"),
      }),
    );
  });

  it("surfaces Thai API error messages", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: "service_unavailable",
              message: "development runner ยังไม่พร้อมใช้งาน",
            },
          }),
          { status: 503 },
        ),
      ),
    );

    await expect(
      runGoCode({
        questId: "hello-gopher",
        lessonId: "hello-world-001",
        sourceCode: "package main",
      }),
    ).rejects.toThrow("development runner ยังไม่พร้อมใช้งาน");
  });

  it("posts submissions to the server-managed test endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "passed",
          stdout: "ผ่าน test cases",
          stderr: "",
          message: "ผ่านแล้วครับ",
          executionTimeMs: 20,
          outputTruncated: false,
          tests: {
            passed: 2,
            failed: 0,
            total: 2,
            score: 100,
          },
          submissionId: "33333333-3333-4333-8333-333333333333",
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await submitGoCode({
      playerId: "11111111-1111-4111-8111-111111111111",
      questId: "hello-gopher",
      lessonId: "hello-world-001",
      sourceCode: "package main\n\nfunc main() {}",
    });

    expect(result.tests?.score).toBe(100);
    expect(result.submissionId).toBe("33333333-3333-4333-8333-333333333333");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/code/submit",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("playerId"),
      }),
    );
  });
});
