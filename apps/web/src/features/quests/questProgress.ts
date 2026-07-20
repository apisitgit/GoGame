import type { QuestDefinition, QuestProgress, QuestStatus } from "./types";

export function createInitialQuestProgress(
  quests: QuestDefinition[],
): QuestProgress {
  return Object.fromEntries(
    quests.map((quest) => [quest.id, quest.statusWhenNew]),
  );
}

export function getQuestStatus(
  progress: QuestProgress,
  quest: QuestDefinition,
): QuestStatus {
  return progress[quest.id] ?? quest.statusWhenNew;
}

export function acceptQuest(
  progress: QuestProgress,
  questId: string,
): QuestProgress {
  const currentStatus = progress[questId];

  if (currentStatus !== "available") {
    return progress;
  }

  return {
    ...progress,
    [questId]: "active",
  };
}

export function completeQuest(
  progress: QuestProgress,
  questId: string,
): QuestProgress {
  const currentStatus = progress[questId];

  if (currentStatus !== "active") {
    return progress;
  }

  return {
    ...progress,
    [questId]: "completed",
  };
}

export function ensureKnownQuests(
  progress: QuestProgress,
  quests: QuestDefinition[],
): QuestProgress {
  return {
    ...createInitialQuestProgress(quests),
    ...progress,
  };
}
