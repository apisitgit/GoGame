export function getVisibleHints(hints: string[], revealedCount: number): string[] {
  return hints.slice(0, clampRevealedCount(hints, revealedCount));
}

export function revealNextHint(hints: string[], revealedCount: number): number {
  return clampRevealedCount(hints, revealedCount + 1);
}

export function resetHints(): number {
  return 0;
}

function clampRevealedCount(hints: string[], revealedCount: number) {
  return Math.min(Math.max(revealedCount, 0), hints.length);
}
