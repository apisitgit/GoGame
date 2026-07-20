import { describe, expect, it } from "vitest";
import {
  acceptQuest,
  completeQuest,
  createInitialQuestProgress,
  ensureKnownQuests,
  getQuestStatus,
} from "./questProgress";
import type { QuestDefinition, QuestProgress } from "./types";

const firstQuest: QuestDefinition = {
  id: "hello-gopher",
  title: "คำทักทายจาก Gopher",
  objective: "ทักทาย Gopher",
  rewardExp: 100,
  statusWhenNew: "available",
};

const lockedQuest: QuestDefinition = {
  id: "variables",
  title: "กล่องเก็บข้อมูล",
  objective: "เรียนรู้ตัวแปร",
  rewardExp: 100,
  statusWhenNew: "locked",
};

describe("quest progress", () => {
  it("creates initial progress from quest definitions", () => {
    expect(createInitialQuestProgress([firstQuest, lockedQuest])).toEqual({
      "hello-gopher": "available",
      variables: "locked",
    });
  });

  it("moves an available quest to active", () => {
    const progress: QuestProgress = { "hello-gopher": "available" };

    expect(acceptQuest(progress, "hello-gopher")).toEqual({
      "hello-gopher": "active",
    });
  });

  it("does not reopen locked or completed quests", () => {
    const lockedProgress: QuestProgress = { variables: "locked" };
    const completedProgress: QuestProgress = { "hello-gopher": "completed" };

    expect(acceptQuest(lockedProgress, "variables")).toBe(lockedProgress);
    expect(acceptQuest(completedProgress, "hello-gopher")).toBe(completedProgress);
  });

  it("moves an active quest to completed once", () => {
    const progress: QuestProgress = { "hello-gopher": "active" };
    const completed = completeQuest(progress, "hello-gopher");

    expect(completed).toEqual({ "hello-gopher": "completed" });
    expect(completeQuest(completed, "hello-gopher")).toBe(completed);
  });

  it("keeps unknown missing quest status aligned with definitions", () => {
    const progress: QuestProgress = { "hello-gopher": "active" };

    expect(ensureKnownQuests(progress, [firstQuest, lockedQuest])).toEqual({
      "hello-gopher": "active",
      variables: "locked",
    });
    expect(getQuestStatus({}, firstQuest)).toBe("available");
  });
});
