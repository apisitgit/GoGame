import { describe, expect, it } from "vitest";
import { createSubmissionStateFromRunResult } from "./submissionState";

describe("submission state", () => {
  it("maps passed mock run result to passed submission state", () => {
    expect(
      createSubmissionStateFromRunResult({
        status: "passed",
        stdout: "สวัสดี Gopher",
        message: "ผ่านแล้ว",
      }),
    ).toEqual({
      status: "passed",
      stdout: "สวัสดี Gopher",
      message: "ผ่านแล้ว",
    });
  });

  it("maps failed mock run result to failed submission state", () => {
    expect(
      createSubmissionStateFromRunResult({
        status: "failed",
        stdout: "hello",
        message: "ยังไม่ผ่าน",
      }),
    ).toEqual({
      status: "failed",
      stdout: "hello",
      message: "ยังไม่ผ่าน",
    });
  });
});
