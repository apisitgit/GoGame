import { describe, expect, it } from "vitest";
import { getVisibleHints, resetHints, revealNextHint } from "./hintProgression";

const hints = ["hint 1", "hint 2", "hint 3"];

describe("hint progression", () => {
  it("reveals hints one level at a time", () => {
    const firstCount = revealNextHint(hints, 0);
    const secondCount = revealNextHint(hints, firstCount);

    expect(getVisibleHints(hints, firstCount)).toEqual(["hint 1"]);
    expect(getVisibleHints(hints, secondCount)).toEqual(["hint 1", "hint 2"]);
  });

  it("does not reveal past the available hints", () => {
    expect(revealNextHint(hints, 99)).toBe(3);
    expect(getVisibleHints(hints, 99)).toEqual(hints);
  });

  it("resets hint progression", () => {
    expect(resetHints()).toBe(0);
  });
});
