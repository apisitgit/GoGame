import { describe, expect, it } from "vitest";
import { runMockGoChallenge } from "./mockRunner";

const expectedOutput = "สวัสดี Gopher";

describe("mock Go challenge runner", () => {
  it("passes when fmt.Println output matches expected output", () => {
    const result = runMockGoChallenge(
      'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("สวัสดี Gopher")\n}',
      expectedOutput,
    );

    expect(result).toEqual({
      status: "passed",
      stdout: expectedOutput,
      message: "ผ่านแล้วครับ โปรแกรมแสดงข้อความตรงกับภารกิจ",
    });
  });

  it("fails when output does not match", () => {
    const result = runMockGoChallenge(
      'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("hello")\n}',
      expectedOutput,
    );

    expect(result.status).toBe("failed");
    expect(result.stdout).toBe("hello");
  });

  it("fails when source is missing fmt import", () => {
    const result = runMockGoChallenge(
      'package main\n\nfunc main() {\n    fmt.Println("สวัสดี Gopher")\n}',
      expectedOutput,
    );

    expect(result.status).toBe("failed");
    expect(result.message).toContain('import "fmt"');
  });
});
