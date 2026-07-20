const PLAYER_ID_STORAGE_KEY = "go-quest:player-id:v1";

export function getOrCreatePlayerId(storage: Storage): string {
  const existingPlayerId = storage.getItem(PLAYER_ID_STORAGE_KEY);
  if (existingPlayerId) {
    return existingPlayerId;
  }

  const playerId = createUUID();
  storage.setItem(PLAYER_ID_STORAGE_KEY, playerId);
  return playerId;
}

function createUUID() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (character) =>
    (
      Number(character) ^
      (Math.floor(Math.random() * 256) & (15 >> (Number(character) / 4)))
    ).toString(16),
  );
}
