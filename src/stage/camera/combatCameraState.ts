import { readCombatFighter, readLatestHit } from '@/src/game/combatRuntime';

/**
 * The camera's reaction to what just happened in the fight.
 *
 * Split out from the rig so the two questions stay separate: *what did the sim
 * just do* lives here, *where does the lens go* lives in the rig. Every value
 * decays toward zero, so a rig that stops asking simply settles.
 */
export interface CameraImpulse {
  /** Positional noise amplitude. */
  shake: number;
  /** Lateral kick along the blow's direction. */
  kick: number;
  /** Dolly bias toward the fighters — the punch-in on a heavy landing. */
  punch: number;
  /** Dutch roll, in radians. */
  roll: number;
  /** 0…1 slow, dramatic push after a fighter is finished. */
  finish: number;
}

export const MAX_SHAKE = 1.9;

export function createImpulse(): CameraImpulse {
  return { shake: 0, kick: 0, punch: 0, roll: 0, finish: 0 };
}

type FighterId = 'p1' | 'p2';

export interface ImpulseWatch {
  hitSerial: Record<FighterId, number>;
  finished: boolean;
}

export function createWatch(): ImpulseWatch {
  return { hitSerial: { p1: 0, p2: 0 }, finished: false };
}

/**
 * Fold every blow landed since the last frame into the impulse.
 *
 * Weighting is by damage, and heavily so. A jab and a launcher moving the
 * camera by the same amount is the single most common way a fighting game ends
 * up feeling weightless — the camera is the main thing telling the player how
 * hard something hit.
 */
export function accumulateImpacts(
  impulse: CameraImpulse,
  watch: ImpulseWatch,
): void {
  for (const defenderId of ['p1', 'p2'] as const) {
    const hit = readLatestHit(defenderId);
    if (hit === null || hit.serial === watch.hitSerial[defenderId]) continue;
    watch.hitSerial[defenderId] = hit.serial;

    const weight = Math.min(1, hit.damage / 80);
    impulse.shake = Math.min(MAX_SHAKE, Math.max(impulse.shake, 0.5 + weight * 1.4));
    impulse.kick = hit.away * (0.03 + weight * 0.12);
    // Only a genuinely heavy blow earns the push-in; on a light hit it reads as
    // the camera twitching rather than as force.
    impulse.punch = Math.max(impulse.punch, Math.max(0, weight - 0.35) * 1.9);
    impulse.roll = Math.max(impulse.roll, weight * 0.05) * -hit.away;
  }

  // A finished fighter starts the slow push. Held until the rig is rebuilt for
  // the next round, which is exactly how long the shot should last.
  if (!watch.finished && isAnyoneFinished()) {
    watch.finished = true;
  }
  impulse.finish = watch.finished
    ? Math.min(1, impulse.finish + 0.02)
    : Math.max(0, impulse.finish - 0.08);
}

function isAnyoneFinished(): boolean {
  for (const fighterId of ['p1', 'p2'] as const) {
    const fighter = readCombatFighter(fighterId);
    if (fighter !== null && fighter.health <= 0) return true;
  }
  return false;
}
