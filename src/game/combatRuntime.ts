import { FIXED_SCALE, type CombatEvent, type FighterSnapshot, type WorldSnapshot } from '@/src/sim';

interface CombatRenderFrame {
  world: WorldSnapshot | null;
  interpolationAlpha: number;
}

/**
 * The last blow each fighter took, for effects that depend on *where* it landed.
 *
 * A snapshot says a fighter is in hitstun; it cannot say whether the blow caught
 * the head or swept the legs, so every reaction driven by the snapshot alone is
 * the same reaction. The sim already computes the answer — `HitEvent.position` is
 * the centre of the hitbox/hurtbox overlap — it simply had nowhere to go.
 *
 * A plain mutable record, like `combatRenderFrame`: a store update per hit would
 * re-render the React tree in the middle of a combo.
 */
export interface CombatHit {
  /** Rises on every landed blow, so a reader can tell a new one from a held one. */
  readonly serial: number;
  readonly attackerId: string;
  readonly defenderId: string;
  readonly moveId: string;
  readonly damage: number;
  /** Impact point in engine units. */
  readonly x: number;
  readonly y: number;
  /** Which way the defender was driven: -1 or 1. */
  readonly away: number;
}

const hitsByDefender = new Map<string, CombatHit>();
let hitSerial = 0;

export function publishCombatHits(
  world: WorldSnapshot,
  events: readonly CombatEvent[],
): void {
  for (const event of events) {
    if (event.type !== 'hit') continue;
    const attacker = world.fighters.find(
      (fighter) => fighter.id === event.attackerId,
    );
    const defender = world.fighters.find(
      (fighter) => fighter.id === event.defenderId,
    );
    hitSerial += 1;
    hitsByDefender.set(event.defenderId, {
      serial: hitSerial,
      attackerId: event.attackerId,
      defenderId: event.defenderId,
      moveId: event.moveId,
      damage: event.damage,
      x: event.position.x / FIXED_SCALE,
      y: event.position.y / FIXED_SCALE,
      away:
        attacker === undefined || defender === undefined
          ? 1
          : Math.sign(defender.position.x - attacker.position.x) || 1,
    });
  }
}

export function readLatestHit(defenderId: string): CombatHit | null {
  return hitsByDefender.get(defenderId) ?? null;
}

export function clearCombatHits(): void {
  hitsByDefender.clear();
}

export const combatRenderFrame: CombatRenderFrame = {
  world: null,
  interpolationAlpha: 0,
};

let requestedReset = 0;

export function publishCombatFrame(
  world: WorldSnapshot,
  interpolationAlpha: number,
): void {
  combatRenderFrame.world = world;
  combatRenderFrame.interpolationAlpha = interpolationAlpha;
}

export function requestCombatReset(): void {
  requestedReset += 1;
}

export function readCombatResetVersion(): number {
  return requestedReset;
}

export function readCombatFighter(id: string): FighterSnapshot | null {
  const fighters = combatRenderFrame.world?.fighters;
  if (fighters === undefined) return null;
  for (const fighter of fighters) {
    if (fighter.id === id) return fighter;
  }
  return null;
}
