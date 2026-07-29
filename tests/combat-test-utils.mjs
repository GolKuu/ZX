import { CombatEngine } from '../.sim-test-build/src/sim/index.js';

export const standardHurtbox = {
  offset: { x: 0, y: 500 },
  halfSize: { x: 400, y: 500 },
};

export function makeMove(overrides = {}) {
  const startup = overrides.startup ?? 0;
  const active = overrides.active ?? 1;
  return {
    id: overrides.id ?? 'strike',
    startup,
    active,
    recovery: overrides.recovery ?? 1,
    hitboxes: overrides.hitboxes ?? [
      {
        hitId: 'primary',
        frames: { from: startup, toExclusive: startup + active },
        boxes: [
          {
            offset: { x: 700, y: 500 },
            halfSize: { x: 500, y: 300 },
          },
        ],
        hit: {
          damage: overrides.damage ?? 10,
          hitstop: overrides.hitstop ?? { attacker: 0, defender: 0 },
          hitstun: overrides.hitstun ?? 5,
          knockback: overrides.knockback ?? { x: 0, y: 0 },
          block: overrides.block,
          wallBounce: overrides.wallBounce,
          groundBounce: overrides.groundBounce,
        },
      },
    ],
    hurtboxes: overrides.hurtboxes,
    cancels: overrides.cancels,
  };
}

export function makeEngine(move, overrides = {}) {
  const fighters = overrides.fighters ?? [
    fighterDefinition('p1', 1, 0, 1),
    fighterDefinition('p2', 2, 1_200, -1),
  ];
  return new CombatEngine({
    moves: overrides.moves ?? [move],
    fighters,
    world: {
      groundY: 0,
      leftWall: -5_000,
      rightWall: 5_000,
      gravityPerFrame: 100,
      groundFriction: { numerator: 1, denominator: 1 },
      maximumVelocity: 2_000,
      friendlyFire: false,
      ...overrides.world,
    },
  });
}

export function fighterDefinition(id, team, x, facing) {
  return {
    id,
    team,
    maxHealth: 100,
    spawn: { x, y: 0 },
    facing,
    hurtboxes: [standardHurtbox],
  };
}

export function readFighter(state, id) {
  const result = state.fighters.find((fighter) => fighter.id === id);
  if (result === undefined) {
    throw new Error(`Missing fighter ${id}`);
  }
  return result;
}
