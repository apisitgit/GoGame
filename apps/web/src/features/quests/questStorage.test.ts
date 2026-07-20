import { describe, expect, it } from "vitest";
import {
  loadQuestProgress,
  resetQuestProgress,
  saveQuestProgress,
} from "./questStorage";
import type { QuestProgress } from "./types";

describe("quest storage", () => {
  it("returns initial progress when storage is empty", () => {
    const storage = new MemoryStorage();

    expect(loadQuestProgress(storage)).toEqual({
      "hello-gopher": "available",
    });
  });

  it("saves and loads quest progress", () => {
    const storage = new MemoryStorage();
    const progress: QuestProgress = { "hello-gopher": "active" };

    saveQuestProgress(storage, progress);

    expect(loadQuestProgress(storage)).toEqual(progress);
  });

  it("falls back to initial progress when stored JSON is invalid", () => {
    const storage = new MemoryStorage();
    storage.setItem("go-quest:quest-progress:v1", "{invalid");

    expect(loadQuestProgress(storage)).toEqual({
      "hello-gopher": "available",
    });
  });

  it("falls back to initial progress when status is unknown", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      "go-quest:quest-progress:v1",
      JSON.stringify({ "hello-gopher": "done" }),
    );

    expect(loadQuestProgress(storage)).toEqual({
      "hello-gopher": "available",
    });
  });

  it("resets persisted progress", () => {
    const storage = new MemoryStorage();
    saveQuestProgress(storage, { "hello-gopher": "active" });

    expect(resetQuestProgress(storage)).toEqual({
      "hello-gopher": "available",
    });
    expect(loadQuestProgress(storage)).toEqual({
      "hello-gopher": "available",
    });
  });
});

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}
