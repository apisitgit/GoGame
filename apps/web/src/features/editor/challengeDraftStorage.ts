const DRAFT_STORAGE_PREFIX = "go-quest:challenge-draft:v1:";

export function loadChallengeDraft(
  storage: Storage,
  lessonId: string,
  fallbackCode: string,
): string {
  return storage.getItem(getDraftStorageKey(lessonId)) ?? fallbackCode;
}

export function saveChallengeDraft(
  storage: Storage,
  lessonId: string,
  sourceCode: string,
): void {
  storage.setItem(getDraftStorageKey(lessonId), sourceCode);
}

export function resetChallengeDraft(
  storage: Storage,
  lessonId: string,
  starterCode: string,
): string {
  storage.setItem(getDraftStorageKey(lessonId), starterCode);
  return starterCode;
}

function getDraftStorageKey(lessonId: string) {
  return `${DRAFT_STORAGE_PREFIX}${lessonId}`;
}
