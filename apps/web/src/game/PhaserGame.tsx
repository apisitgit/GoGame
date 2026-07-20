import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { createGameConfig } from "./config/createGameConfig";
import {
  DEBUG_STATE_EVENT,
  NPC_INTERACTION_STATE_EVENT,
  NPC_INTERACT_EVENT,
  type GameDebugState,
  type NpcInteractEvent,
  type NpcInteractionState,
} from "./events";

type PhaserGameProps = {
  onDebugStateChange?: (state: GameDebugState) => void;
  onNpcInteractionChange?: (state: NpcInteractionState) => void;
  onNpcInteract?: (event: NpcInteractEvent) => void;
};

export function PhaserGame({
  onDebugStateChange,
  onNpcInteractionChange,
  onNpcInteract,
}: PhaserGameProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) {
      return;
    }

    gameRef.current = new Phaser.Game(createGameConfig(containerRef.current));

    if (onDebugStateChange) {
      gameRef.current.events.on(DEBUG_STATE_EVENT, onDebugStateChange);
    }
    if (onNpcInteractionChange) {
      gameRef.current.events.on(
        NPC_INTERACTION_STATE_EVENT,
        onNpcInteractionChange,
      );
    }
    if (onNpcInteract) {
      gameRef.current.events.on(NPC_INTERACT_EVENT, onNpcInteract);
    }

    return () => {
      if (onDebugStateChange) {
        gameRef.current?.events.off(DEBUG_STATE_EVENT, onDebugStateChange);
      }
      if (onNpcInteractionChange) {
        gameRef.current?.events.off(
          NPC_INTERACTION_STATE_EVENT,
          onNpcInteractionChange,
        );
      }
      if (onNpcInteract) {
        gameRef.current?.events.off(NPC_INTERACT_EVENT, onNpcInteract);
      }
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [onDebugStateChange, onNpcInteractionChange, onNpcInteract]);

  return (
    <div
      ref={containerRef}
      className="h-[calc(100vh-73px)] min-h-[420px] w-full bg-[#203238]"
      data-testid="phaser-game-root"
    />
  );
}
