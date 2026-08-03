import { getApiBaseUrl } from "./config";

export type CodeRunStatus =
  | "passed"
  | "failed"
  | "compile_error"
  | "runtime_error"
  | "timeout"
  | "rejected"
  | "internal_error";

export type CodeRunResult = {
  status: CodeRunStatus;
  stdout: string;
  stderr: string;
  message: string;
  executionTimeMs: number;
  outputTruncated: boolean;
};

export type RunGoCodeInput = {
  questId: string;
  lessonId: string;
  sourceCode: string;
};

export async function runGoCode(input: RunGoCodeInput): Promise<CodeRunResult> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/code/run`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readAPIErrorMessage(response));
  }

  return (await response.json()) as CodeRunResult;
}

async function readAPIErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as {
      error?: { message?: string };
    };

    return payload.error?.message ?? "runner ยังไม่พร้อมใช้งาน";
  } catch {
    return "runner ยังไม่พร้อมใช้งาน";
  }
}
