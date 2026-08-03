import { afterEach, describe, expect, it, vi } from "vitest";
import { runGoCode } from "./codeRunner";

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
});
