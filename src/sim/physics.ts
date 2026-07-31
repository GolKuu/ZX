import type { CombatWorldConfig } from './config.js';
import type { CombatEvent } from './events.js';
import { clampInteger, scaleInteger } from './math.js';
import type { MutableFighterState } from './state.js';

export function integrateFighter(
  fighter: MutableFighterState,
  config: CombatWorldConfig,
  frame: number,
  events: CombatEvent[],
): void {
  fighter.velocity.x = clampInteger(
    fighter.velocity.x,
    -config.maximumVelocity,
    config.maximumVelocity,
  );
  fighter.velocity.y = clampInteger(
    fighter.velocity.y,
    -config.maximumVelocity,
    config.maximumVelocity,
  );

  // A mounted fighter is held by the plane, not by the world: gravity and the
  // ground resolve would both fight the wall-run machine for the same axis.
  if (fighter.wallRun.phase !== 'none') {
    return;
  }

  if (!fighter.grounded || fighter.velocity.y !== 0) {
    fighter.velocity.y -= config.gravityPerFrame;
  }
  fighter.position.x += fighter.velocity.x;
  fighter.position.y += fighter.velocity.y;

  resolveWall(fighter, config, frame, events);
  resolveGround(fighter, config, frame, events);

  if (fighter.grounded && fighter.velocity.x !== 0) {
    fighter.velocity.x = scaleInteger(fighter.velocity.x, config.groundFriction);
  }
}

function resolveWall(
  fighter: MutableFighterState,
  config: CombatWorldConfig,
  frame: number,
  events: CombatEvent[],
): void {
  if (fighter.position.x > config.leftWall && fighter.position.x < config.rightWall) {
    return;
  }

  const hitLeftWall = fighter.position.x <= config.leftWall;
  fighter.position.x = hitLeftWall ? config.leftWall : config.rightWall;
  const movingIntoWall = hitLeftWall ? fighter.velocity.x < 0 : fighter.velocity.x > 0;
  if (!movingIntoWall) {
    return;
  }

  if (fighter.hitstun > 0 && fighter.bounce.wallRemaining > 0) {
    const awayFromWall = hitLeftWall ? 1 : -1;
    fighter.velocity.x = awayFromWall * fighter.bounce.wallHorizontalSpeed;
    fighter.velocity.y = fighter.bounce.wallVerticalSpeed;
    fighter.grounded = fighter.velocity.y === 0;
    fighter.bounce.wallRemaining -= 1;
    fighter.hitstun = Math.max(fighter.hitstun, fighter.bounce.wallMinimumHitstun);
    events.push({
      type: 'wallBounce',
      frame,
      fighterId: fighter.id,
      remaining: fighter.bounce.wallRemaining,
    });
    return;
  }

  fighter.velocity.x = 0;
}

function resolveGround(
  fighter: MutableFighterState,
  config: CombatWorldConfig,
  frame: number,
  events: CombatEvent[],
): void {
  if (fighter.position.y > config.groundY) {
    fighter.grounded = false;
    return;
  }

  fighter.position.y = config.groundY;
  if (
    fighter.velocity.y < 0
    && fighter.hitstun > 0
    && fighter.bounce.groundRemaining > 0
  ) {
    fighter.velocity.y = fighter.bounce.groundVerticalSpeed;
    fighter.velocity.x = Math.trunc(
      (fighter.velocity.x * fighter.bounce.groundHorizontalNumerator)
      / fighter.bounce.groundHorizontalDenominator,
    );
    fighter.grounded = false;
    fighter.bounce.groundRemaining -= 1;
    fighter.hitstun = Math.max(fighter.hitstun, fighter.bounce.groundMinimumHitstun);
    events.push({
      type: 'groundBounce',
      frame,
      fighterId: fighter.id,
      remaining: fighter.bounce.groundRemaining,
    });
    return;
  }

  fighter.velocity.y = 0;
  fighter.grounded = true;
}
