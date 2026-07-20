import Phaser from "phaser";
import { calculatePlayerVelocity } from "./playerMovement";

type WasdKeys = {
  W: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  S: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
};

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;

  private readonly cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly wasd?: WasdKeys;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, "player");
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);
    this.sprite.body?.setSize(24, 26).setOffset(4, 6);

    this.cursors = scene.input.keyboard?.createCursorKeys();
    this.wasd = scene.input.keyboard?.addKeys("W,A,S,D") as WasdKeys | undefined;
  }

  update() {
    const velocity = calculatePlayerVelocity({
      left: Boolean(this.cursors?.left.isDown || this.wasd?.A.isDown),
      right: Boolean(this.cursors?.right.isDown || this.wasd?.D.isDown),
      up: Boolean(this.cursors?.up.isDown || this.wasd?.W.isDown),
      down: Boolean(this.cursors?.down.isDown || this.wasd?.S.isDown),
    });

    this.sprite.setVelocity(velocity.x, velocity.y);
  }
}

