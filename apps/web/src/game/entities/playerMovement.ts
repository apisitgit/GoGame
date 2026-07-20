export type DirectionInput = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
};

export type Velocity = {
  x: number;
  y: number;
};

export const PLAYER_SPEED = 180;

export function calculatePlayerVelocity(input: DirectionInput): Velocity {
  const horizontal = Number(input.right) - Number(input.left);
  const vertical = Number(input.down) - Number(input.up);

  if (horizontal !== 0 && vertical !== 0) {
    return {
      x: horizontal * PLAYER_SPEED * Math.SQRT1_2,
      y: vertical * PLAYER_SPEED * Math.SQRT1_2,
    };
  }

  return {
    x: horizontal * PLAYER_SPEED,
    y: vertical * PLAYER_SPEED,
  };
}

