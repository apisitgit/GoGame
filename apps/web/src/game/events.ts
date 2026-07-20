export const DEBUG_STATE_EVENT = "go-quest:debug-state";
export const NPC_INTERACTION_STATE_EVENT = "go-quest:npc-interaction-state";
export const NPC_INTERACT_EVENT = "go-quest:npc-interact";

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

export type NpcInteractionState = {
  npcId: string;
  questId: string;
  prompt: string;
  isNearby: boolean;
};

export type NpcInteractEvent = {
  npcId: string;
  questId: string;
};
