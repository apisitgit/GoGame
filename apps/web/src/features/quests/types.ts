export type QuestStatus = "locked" | "available" | "active" | "completed";

export type DialogueLine = {
  id: string;
  speaker: string;
  text: string;
};

export type QuestDefinition = {
  id: string;
  title: string;
  objective: string;
  rewardExp: number;
  statusWhenNew: QuestStatus;
};

export type NpcDefinition = {
  id: string;
  name: string;
  role: string;
  prompt: string;
  questId: string;
  dialogue: DialogueLine[];
  completedDialogue: DialogueLine[];
};

export type QuestProgress = Record<string, QuestStatus>;
