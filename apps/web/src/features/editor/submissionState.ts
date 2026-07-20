import type { MockRunResult, SubmissionState } from "./types";

export function createSubmissionStateFromRunResult(
  result: MockRunResult,
): SubmissionState {
  return {
    status: result.status,
    stdout: result.stdout,
    message: result.message,
  };
}
