import { getApiBaseUrl } from "./config";

export type QuestProgressStatus =
  | "locked"
  | "available"
  | "active"
  | "completed";

export type SubmissionMetadataInput = {
  playerId: string;
  questId: string;
  lessonId: string;
  sourceSize: number;
  status: "passed" | "failed";
  stdoutPreview: string;
  feedback: string;
};

export async function syncQuestProgress(input: {
  playerId: string;
  questId: string;
  status: QuestProgressStatus;
}): Promise<boolean> {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/api/v1/progress/${input.playerId}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questId: input.questId,
          status: input.status,
        }),
      },
    );

    return response.ok;
  } catch {
    return false;
  }
}

export async function createSubmissionMetadata(
  input: SubmissionMetadataInput,
): Promise<boolean> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/v1/submissions`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    return response.ok;
  } catch {
    return false;
  }
}
