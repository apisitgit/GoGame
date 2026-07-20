import { questDefinitions } from "./questData";
import { createInitialQuestProgress, ensureKnownQuests } from "./questProgress";
import type { QuestProgress, QuestStatus } from "./types";

const QUEST_PROGRESS_STORAGE_KEY = "go-quest:quest-progress:v1";
const VALID_STATUSES = new Set<QuestStatus>([
  "locked",
  "available",
  "active",
  "completed",
]);

export function loadQuestProgress(storage: Storage): QuestProgress {
  const rawValue = storage.getItem(QUEST_PROGRESS_STORAGE_KEY);

  if (!rawValue) {
    return createInitialQuestProgress(questDefinitions);
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue);
    if (!isQuestProgress(parsedValue)) {
      return createInitialQuestProgress(questDefinitions);
    }

    return ensureKnownQuests(parsedValue, questDefinitions);
  } catch {
    return createInitialQuestProgress(questDefinitions);
  }
}

export function saveQuestProgress(
  storage: Storage,
  progress: QuestProgress,
): void {
  storage.setItem(QUEST_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

export function resetQuestProgress(storage: Storage): QuestProgress {
  storage.removeItem(QUEST_PROGRESS_STORAGE_KEY);
  return createInitialQuestProgress(questDefinitions);
}

function isQuestProgress(value: unknown): value is QuestProgress {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every(
    (status): status is QuestStatus =>
      typeof status === "string" && isQuestStatus(status),
  );
}

function isQuestStatus(status: string): status is QuestStatus {
  return VALID_STATUSES.has(status as QuestStatus);
}
