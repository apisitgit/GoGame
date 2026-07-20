import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { createGameConfig } from "./config/createGameConfig";
import { DEBUG_STATE_EVENT, type GameDebugState } from "./events";

type PhaserGameProps = {
  onDebugStateChange?: (state: GameDebugState) => void;
};

export function PhaserGame({ onDebugStateChange }: PhaserGameProps) {
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

    return () => {
      if (onDebugStateChange) {
        gameRef.current?.events.off(DEBUG_STATE_EVENT, onDebugStateChange);
      }
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [onDebugStateChange]);

  return (
    <div
      ref={containerRef}
      className="h-[calc(100vh-73px)] min-h-[420px] w-full bg-[#203238]"
      data-testid="phaser-game-root"
    />
  );
}
