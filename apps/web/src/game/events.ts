export const DEBUG_STATE_EVENT = "go-quest:debug-state";

export type GameDebugState = {
  player: {
    x: number;
    y: number;
  };
  world: {
    width: number;
    height: number;
  };
};

