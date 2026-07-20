import Phaser from "phaser";
import { professorGopher } from "../../features/quests/questData";
import { Player } from "../entities/Player";
import {
  DEBUG_STATE_EVENT,
  NPC_INTERACTION_STATE_EVENT,
  NPC_INTERACT_EVENT,
  type GameDebugState,
} from "../events";

const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 1000;
const TILE_SIZE = 64;
const PROFESSOR_INTERACTION_RADIUS = 96;
const PROFESSOR_POSITION = { x: 250, y: 180 };

type Obstacle = {
  x: number;
  y: number;
  texture: "tree" | "rock" | "house";
};

const OBSTACLES: Obstacle[] = [
  { x: 300, y: 210, texture: "tree" },
  { x: 430, y: 220, texture: "tree" },
  { x: 720, y: 180, texture: "house" },
  { x: 1040, y: 250, texture: "rock" },
  { x: 1220, y: 430, texture: "tree" },
  { x: 260, y: 680, texture: "house" },
  { x: 860, y: 720, texture: "rock" },
  { x: 1260, y: 760, texture: "tree" },
];

export class BeginnerVillageScene extends Phaser.Scene {
  private player?: Player;
  private professor?: Phaser.Types.Physics.Arcade.SpriteWithStaticBody;
  private interactionKey?: Phaser.Input.Keyboard.Key;
  private isNearProfessor = false;
  private lastDebugEventAt = 0;

  constructor() {
    super("BeginnerVillageScene");
  }

  preload() {
    this.createTextures();
  }

  create() {
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setZoom(1);

    this.createVillageMap();

    const obstacles = this.physics.add.staticGroup();
    for (const obstacle of OBSTACLES) {
      obstacles.create(obstacle.x, obstacle.y, obstacle.texture).refreshBody();
    }

    this.professor = this.physics.add.staticSprite(
      PROFESSOR_POSITION.x,
      PROFESSOR_POSITION.y,
      "professor-gopher",
    );
    this.professor.setDepth(8);
    this.professor.body?.setSize(34, 36).setOffset(7, 8);

    this.player = new Player(this, 180, 180);
    this.physics.add.collider(this.player.sprite, obstacles);
    this.physics.add.collider(this.player.sprite, this.professor);
    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(120, 80);
    this.interactionKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.E,
    );

    this.add
      .text(48, 48, "Beginner Village", {
        fontFamily: "Arial",
        fontSize: "28px",
        color: "#f8f5ea",
        stroke: "#18202f",
        strokeThickness: 5,
      })
      .setScrollFactor(0)
      .setDepth(20);
  }

  update(time: number) {
    this.player?.update();
    this.updateProfessorInteraction();
    this.emitDebugState(time);
  }

  getDebugState(): GameDebugState {
    return {
      player: {
        x: this.player?.sprite.x ?? 0,
        y: this.player?.sprite.y ?? 0,
      },
      world: {
        width: WORLD_WIDTH,
        height: WORLD_HEIGHT,
      },
    };
  }

  private emitDebugState(time: number) {
    if (time - this.lastDebugEventAt < 100) {
      return;
    }

    this.lastDebugEventAt = time;
    this.game.events.emit(DEBUG_STATE_EVENT, this.getDebugState());
  }

  private createVillageMap() {
    this.add.tileSprite(
      WORLD_WIDTH / 2,
      WORLD_HEIGHT / 2,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      "grass",
    );

    this.add.rectangle(WORLD_WIDTH / 2, 96, WORLD_WIDTH - 180, 96, 0x6d8f5f, 0.45);
    this.add.rectangle(840, 500, 1180, 120, 0xc99d64, 0.5).setAngle(-4);
    this.add.rectangle(760, 620, 1100, 92, 0xc99d64, 0.45).setAngle(6);

    this.add.rectangle(0, WORLD_HEIGHT / 2, 24, WORLD_HEIGHT, 0x2f5137);
    this.add.rectangle(WORLD_WIDTH, WORLD_HEIGHT / 2, 24, WORLD_HEIGHT, 0x2f5137);
    this.add.rectangle(WORLD_WIDTH / 2, 0, WORLD_WIDTH, 24, 0x2f5137);
    this.add.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT, WORLD_WIDTH, 24, 0x2f5137);
  }

  private createTextures() {
    if (this.textures.exists("player")) {
      return;
    }

    this.createPlayerTexture();
    this.createProfessorTexture();
    this.createGrassTexture();
    this.createTreeTexture();
    this.createRockTexture();
    this.createHouseTexture();
  }

  private createPlayerTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x4f8f60);
    graphics.fillRoundedRect(6, 8, 20, 22, 4);
    graphics.fillStyle(0xf2c28f);
    graphics.fillCircle(16, 8, 8);
    graphics.fillStyle(0x203238);
    graphics.fillRect(11, 7, 3, 3);
    graphics.fillRect(18, 7, 3, 3);
    graphics.fillStyle(0x2c5f43);
    graphics.fillRect(8, 30, 7, 8);
    graphics.fillRect(18, 30, 7, 8);
    graphics.generateTexture("player", 32, 40);
    graphics.destroy();
  }

  private createProfessorTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2f6f45);
    graphics.fillRoundedRect(8, 12, 32, 30, 8);
    graphics.fillStyle(0xe8d7b3);
    graphics.fillCircle(24, 12, 12);
    graphics.fillStyle(0xf8f5ea);
    graphics.fillCircle(18, 11, 4);
    graphics.fillCircle(30, 11, 4);
    graphics.fillStyle(0x203238);
    graphics.fillCircle(18, 11, 2);
    graphics.fillCircle(30, 11, 2);
    graphics.lineStyle(3, 0x8f513d);
    graphics.strokeCircle(18, 11, 6);
    graphics.strokeCircle(30, 11, 6);
    graphics.lineBetween(24, 11, 24, 11);
    graphics.fillStyle(0x6f4432);
    graphics.fillRect(14, 42, 7, 10);
    graphics.fillRect(27, 42, 7, 10);
    graphics.generateTexture("professor-gopher", 48, 56);
    graphics.destroy();
  }

  private createGrassTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x6fa45f);
    graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    graphics.fillStyle(0x82b86d);
    for (let i = 0; i < 9; i += 1) {
      graphics.fillRect((i * 11) % TILE_SIZE, (i * 17) % TILE_SIZE, 12, 3);
    }
    graphics.generateTexture("grass", TILE_SIZE, TILE_SIZE);
    graphics.destroy();
  }

  private createTreeTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x6b4f32);
    graphics.fillRect(28, 36, 14, 28);
    graphics.fillStyle(0x2f6f45);
    graphics.fillCircle(35, 24, 26);
    graphics.fillStyle(0x3d8954);
    graphics.fillCircle(20, 32, 18);
    graphics.fillCircle(50, 34, 18);
    graphics.generateTexture("tree", 72, 72);
    graphics.destroy();
  }

  private createRockTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x6f7880);
    graphics.fillRoundedRect(8, 18, 52, 34, 12);
    graphics.fillStyle(0x98a2a9);
    graphics.fillRoundedRect(18, 14, 32, 18, 8);
    graphics.generateTexture("rock", 72, 64);
    graphics.destroy();
  }

  private createHouseTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x8f513d);
    graphics.fillTriangle(8, 34, 56, 4, 104, 34);
    graphics.fillStyle(0xe4c184);
    graphics.fillRoundedRect(18, 34, 76, 58, 4);
    graphics.fillStyle(0x6f4432);
    graphics.fillRect(48, 58, 18, 34);
    graphics.fillStyle(0x6fa7b8);
    graphics.fillRect(28, 48, 16, 14);
    graphics.fillRect(70, 48, 16, 14);
    graphics.generateTexture("house", 112, 96);
    graphics.destroy();
  }

  private updateProfessorInteraction() {
    if (!this.player || !this.professor) {
      return;
    }

    const distance = Phaser.Math.Distance.Between(
      this.player.sprite.x,
      this.player.sprite.y,
      this.professor.x,
      this.professor.y,
    );
    const isNearby = distance <= PROFESSOR_INTERACTION_RADIUS;

    if (isNearby !== this.isNearProfessor) {
      this.isNearProfessor = isNearby;
      this.game.events.emit(NPC_INTERACTION_STATE_EVENT, {
        npcId: professorGopher.id,
        questId: professorGopher.questId,
        prompt: professorGopher.prompt,
        isNearby,
      });
    }

    if (
      isNearby &&
      this.interactionKey &&
      Phaser.Input.Keyboard.JustDown(this.interactionKey)
    ) {
      this.game.events.emit(NPC_INTERACT_EVENT, {
        npcId: professorGopher.id,
        questId: professorGopher.questId,
      });
    }
  }
}
