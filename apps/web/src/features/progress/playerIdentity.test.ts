import { describe, expect, it, vi } from "vitest";
import { getOrCreatePlayerId } from "./playerIdentity";

describe("player identity", () => {
  it("loads an existing player id", () => {
    const storage = new MemoryStorage();
    storage.setItem("go-quest:player-id:v1", "existing-id");

    expect(getOrCreatePlayerId(storage)).toBe("existing-id");
  });

  it("creates and stores a new player id", () => {
    const storage = new MemoryStorage();
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(
      "11111111-1111-4111-8111-111111111111",
    );

    expect(getOrCreatePlayerId(storage)).toBe(
      "11111111-1111-4111-8111-111111111111",
    );
    expect(storage.getItem("go-quest:player-id:v1")).toBe(
      "11111111-1111-4111-8111-111111111111",
    );
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
