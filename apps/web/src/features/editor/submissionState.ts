import type { CodeChallengeRunResult, SubmissionState } from "./types";

export function createSubmissionStateFromRunResult(
  result: CodeChallengeRunResult,
): SubmissionState {
  return {
    status: result.status,
    stdout: result.stdout,
    message: result.message,
  };
}
