import type { Ratio } from './math.js';

export interface CombatWorldConfig {
  readonly groundY: number;
  readonly leftWall: number;
  readonly rightWall: number;
  readonly gravityPerFrame: number;
  readonly groundFriction: Ratio;
  readonly maximumVelocity: number;
  readonly friendlyFire?: boolean;
}

export const DEFAULT_WORLD_CONFIG: CombatWorldConfig = {
  groundY: 0,
  leftWall: -12_000,
  rightWall: 12_000,
  gravityPerFrame: 24,
  groundFriction: { numerator: 7, denominator: 8 },
  maximumVelocity: 4_000,
  friendlyFire: false,
};
