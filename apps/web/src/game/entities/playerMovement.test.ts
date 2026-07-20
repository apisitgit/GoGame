import { describe, expect, it } from "vitest";
import { calculatePlayerVelocity, PLAYER_SPEED } from "./playerMovement";

describe("calculatePlayerVelocity", () => {
  it("returns zero velocity when no direction is pressed", () => {
    expect(
      calculatePlayerVelocity({ left: false, right: false, up: false, down: false }),
    ).toEqual({ x: 0, y: 0 });
  });

  it("moves horizontally at player speed", () => {
    expect(
      calculatePlayerVelocity({ left: false, right: true, up: false, down: false }),
    ).toEqual({ x: PLAYER_SPEED, y: 0 });
  });

  it("normalizes diagonal movement", () => {
    const velocity = calculatePlayerVelocity({
      left: false,
      right: true,
      up: true,
      down: false,
    });

    expect(Math.round(velocity.x)).toBe(127);
    expect(Math.round(velocity.y)).toBe(-127);
  });
});

