import Phaser from "phaser";
import { BeginnerVillageScene } from "../scenes/BeginnerVillageScene";

export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.CANVAS,
    parent,
    backgroundColor: "#203238",
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: "100%",
      height: "100%",
    },
    physics: {
      default: "arcade",
      arcade: {
        debug: false,
      },
    },
    render: {
      pixelArt: true,
      antialias: false,
    },
    scene: [BeginnerVillageScene],
  };
}
