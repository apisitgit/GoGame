import { getApiBaseUrl } from "./config";

export type QuestProgressStatus =
  | "locked"
  | "available"
  | "active"
  | "completed";

export type LevelProgress = {
  level: number;
  currentExp: number;
  currentLevelExp: number;
  nextLevelExp: number;
  expToNextLevel: number;
  progressPercent: number;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  status: "locked" | "unlocked";
};

export type SkillProgression = {
  id: string;
  title: string;
  description: string;
  status: "locked" | "unlocked" | "completed";
  prerequisiteIds: string[];
};

export type QuestProgressItem = {
  questId: string;
  status: QuestProgressStatus;
  earnedExp: number;
  completedAt?: string;
  updatedAt: string;
};

export type PlayerProgressResponse = {
  playerId: string;
  totalExp: number;
  level: LevelProgress;
  quests: QuestProgressItem[];
  achievements: Achievement[];
  skillTree: SkillProgression[];
};

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

export async function fetchPlayerProgress(
  playerId: string,
): Promise<PlayerProgressResponse | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/v1/progress/${playerId}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as PlayerProgressResponse;
  } catch {
    return null;
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
