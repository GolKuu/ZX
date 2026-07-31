import type { CombatEvent } from '../events.js';
import type { MutableFighterState, WallRunState } from '../state.js';
import type { WallField } from './field.js';
import type { WallEntity } from './types.js';

/**
 * Wall running has its own state machine because none of its phases share
 * timing, physics or cancel rules with a jump. Approach is airborne and
 * uncommitted; contact is a one-frame handshake; the loop is gravity-free;
 * every exit leaves with a different velocity.
 */
export const WALL_RUN_CLIMB_SPEED = 88;
export const WALL_RUN_DESCEND_SPEED = -104;
export const WALL_RUN_MAX_FRAMES = 54;
export const WALL_RUN_PAUSE_FRAMES = 14;
export const WALL_RUN_JUMP_SPEED = 372;
export const WALL_RUN_KICKOFF_SPEED = 148;
/** How close the fighter must be to a runnable plane to grab it. */
export const WALL_RUN_GRAB_RANGE = 260;

export interface WallRunRequest {
  /** The player is asking to mount a plane this frame. */
  readonly mount: boolean;
  /** −1 down, 0 hold, 1 up. */
  readonly climb: -1 | 0 | 1;
  readonly jump: boolean;
  /** Leave forward (1) or backward (−1) without jumping. */
  readonly exit: -1 | 0 | 1;
}

export const IDLE_WALL_RUN: WallRunState = {
  phase: 'none',
  wallId: null,
  frame: 0,
  climb: 0,
};

export function updateWallRun(
  fighter: MutableFighterState,
  field: WallField,
  request: WallRunRequest,
  frame: number,
  events: CombatEvent[],
): void {
  const run = fighter.wallRun;
  if (fighter.health === 0 || fighter.hitstun > 0) {
    detach(fighter, field, frame, events, 'interrupted');
    return;
  }

  if (run.phase === 'none') {
    if (request.mount) mount(fighter, field, frame, events);
    return;
  }

  const wall = run.wallId === null ? null : field.find(run.wallId);
  if (wall === null || wall.state !== 'solid') {
    detach(fighter, field, frame, events, 'wallLost');
    return;
  }

  run.frame += 1;
  fighter.grounded = false;

  if (run.phase === 'contact') {
    run.phase = 'runStart';
    fighter.velocity.x = 0;
    fighter.velocity.y = 0;
    return;
  }
  if (run.phase === 'runStart' && run.frame >= 4) {
    run.phase = 'runLoop';
  }
  if (request.jump) {
    leap(fighter, wall, frame, events);
    return;
  }
  if (request.exit !== 0) {
    exit(fighter, wall, request.exit, frame, events);
    return;
  }
  if (run.frame >= WALL_RUN_MAX_FRAMES) {
    detach(fighter, field, frame, events, 'timeout');
    return;
  }
  climb(fighter, wall, request.climb);
}

function mount(
  fighter: MutableFighterState,
  field: WallField,
  frame: number,
  events: CombatEvent[],
): void {
  const wall = nearestRunnable(fighter, field);
  if (wall === null) return;
  fighter.wallRun = {
    phase: 'contact',
    wallId: wall.id,
    frame: 0,
    climb: 0,
  };
  fighter.position.x = wall.center.x
    - Math.sign(wall.center.x - fighter.position.x) * (wall.halfSize.x + 120);
  fighter.velocity.x = 0;
  fighter.velocity.y = 0;
  fighter.grounded = false;
  events.push({
    type: 'wallRun',
    frame,
    fighterId: fighter.id,
    wallId: wall.id,
    phase: 'contact',
  });
}

function climb(
  fighter: MutableFighterState,
  wall: WallEntity,
  direction: -1 | 0 | 1,
): void {
  const run = fighter.wallRun;
  run.climb = direction;
  run.phase = direction === 0 ? 'pause' : direction === 1 ? 'runUp' : 'runDown';
  const speed = direction === 1
    ? WALL_RUN_CLIMB_SPEED
    : direction === -1
      ? WALL_RUN_DESCEND_SPEED
      : 0;
  fighter.velocity.x = 0;
  fighter.velocity.y = 0;
  // Never let the loop settle on the floor: touching down is `fall`, not a run.
  const top = wall.center.y + wall.halfSize.y;
  const bottom = Math.max(240, wall.center.y - wall.halfSize.y);
  fighter.position.y = Math.min(top, Math.max(bottom, fighter.position.y + speed));
}

function leap(
  fighter: MutableFighterState,
  wall: WallEntity,
  frame: number,
  events: CombatEvent[],
): void {
  const away = fighter.position.x >= wall.center.x ? 1 : -1;
  fighter.velocity.y = WALL_RUN_JUMP_SPEED;
  fighter.velocity.x = away * WALL_RUN_KICKOFF_SPEED;
  fighter.grounded = false;
  fighter.wallRun = { ...IDLE_WALL_RUN };
  events.push({
    type: 'wallRun',
    frame,
    fighterId: fighter.id,
    wallId: wall.id,
    phase: 'jump',
  });
}

function exit(
  fighter: MutableFighterState,
  wall: WallEntity,
  direction: -1 | 1 | 0,
  frame: number,
  events: CombatEvent[],
): void {
  const away = fighter.position.x >= wall.center.x ? 1 : -1;
  fighter.velocity.x = away * direction * WALL_RUN_KICKOFF_SPEED;
  fighter.velocity.y = 40;
  fighter.grounded = false;
  fighter.wallRun = { ...IDLE_WALL_RUN };
  events.push({
    type: 'wallRun',
    frame,
    fighterId: fighter.id,
    wallId: wall.id,
    phase: direction === 1 ? 'exitForward' : 'exitBack',
  });
}

function detach(
  fighter: MutableFighterState,
  field: WallField,
  frame: number,
  events: CombatEvent[],
  reason: 'interrupted' | 'wallLost' | 'timeout',
): void {
  const run = fighter.wallRun;
  if (run.phase === 'none') return;
  const wallId = run.wallId;
  fighter.wallRun = { ...IDLE_WALL_RUN };
  fighter.grounded = false;
  if (reason !== 'timeout') fighter.velocity.x *= 0;
  events.push({
    type: 'wallRun',
    frame,
    fighterId: fighter.id,
    wallId: wallId ?? -1,
    phase: reason === 'timeout' ? 'fall' : 'interrupted',
  });
  void field;
}

function nearestRunnable(
  fighter: MutableFighterState,
  field: WallField,
): WallEntity | null {
  let best: WallEntity | null = null;
  let bestDistance = WALL_RUN_GRAB_RANGE;
  for (const wall of field.entities) {
    if (!wall.runnable || wall.state !== 'solid') continue;
    const distance = Math.abs(wall.center.x - fighter.position.x)
      - wall.halfSize.x;
    const withinHeight = fighter.position.y >= wall.center.y - wall.halfSize.y - 400
      && fighter.position.y <= wall.center.y + wall.halfSize.y;
    if (withinHeight && distance <= bestDistance) {
      best = wall;
      bestDistance = distance;
    }
  }
  return best;
}
