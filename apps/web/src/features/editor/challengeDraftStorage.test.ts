import { describe, expect, it } from "vitest";
import {
  loadChallengeDraft,
  resetChallengeDraft,
  saveChallengeDraft,
} from "./challengeDraftStorage";

describe("challenge draft storage", () => {
  it("loads starter code when no draft exists", () => {
    const storage = new MemoryStorage();

    expect(loadChallengeDraft(storage, "lesson-1", "starter")).toBe("starter");
  });

  it("saves and loads a draft per lesson", () => {
    const storage = new MemoryStorage();

    saveChallengeDraft(storage, "lesson-1", "draft");

    expect(loadChallengeDraft(storage, "lesson-1", "starter")).toBe("draft");
    expect(loadChallengeDraft(storage, "lesson-2", "starter")).toBe("starter");
  });

  it("resets draft to starter code", () => {
    const storage = new MemoryStorage();
    saveChallengeDraft(storage, "lesson-1", "draft");

    expect(resetChallengeDraft(storage, "lesson-1", "starter")).toBe("starter");
    expect(loadChallengeDraft(storage, "lesson-1", "fallback")).toBe("starter");
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
