import type { CombatEvent } from '../sim/events.js';
import type { FighterSnapshot, WorldSnapshot } from '../sim/state.js';
import { ultimateChargeFromHealth } from './ultimateCharge.js';
import {
  HUD_PUBLISH_INTERVAL_FRAMES,
  type HudComboSnapshot,
  type HudFighterIdentity,
  type HudFighterSnapshot,
  type HudMatchState,
  type HudSnapshot,
} from './types.js';

export type HudPublisher = (snapshot: HudSnapshot) => void;

/**
 * Converts authoritative 60 Hz combat state into presentation snapshots.
 * At most one snapshot is published every four simulation frames (15 Hz).
 */
export class HudBridge {
  private readonly identities: ReadonlyMap<string, HudFighterIdentity>;
  private readonly publish: HudPublisher;
  private lastAcceptedFrame = -1;
  private lastPublishedFrame = -HUD_PUBLISH_INTERVAL_FRAMES;
  private combo: HudComboSnapshot | null = null;

  public constructor(
    identities: readonly [HudFighterIdentity, HudFighterIdentity],
    publish: HudPublisher,
  ) {
    if (new Set(identities.map((identity) => identity.id)).size !== 2) {
      throw new Error('HUD fighter identities must have unique ids');
    }
    if (new Set(identities.map((identity) => identity.side)).size !== 2) {
      throw new Error('HUD fighter identities must use opposite sides');
    }
    this.identities = new Map(
      identities.map((identity) => [identity.id, { ...identity }]),
    );
    this.publish = publish;
  }

  public accept(
    world: WorldSnapshot,
    events: readonly CombatEvent[],
    match: HudMatchState,
  ): void {
    if (world.frame < this.lastAcceptedFrame) {
      throw new Error(
        `HUD bridge received frame ${world.frame} after ${this.lastAcceptedFrame}`,
      );
    }
    this.lastAcceptedFrame = world.frame;
    this.updateCombo(world, events);

    if (
      world.frame - this.lastPublishedFrame
      < HUD_PUBLISH_INTERVAL_FRAMES
    ) {
      return;
    }

    const fighters = this.readFighters(world, match);
    this.publish({
      frame: world.frame,
      round: positiveInteger(match.round, 'round'),
      timerFrames: nonNegativeInteger(match.timerFrames, 'timerFrames'),
      fighters,
      combo: this.combo === null ? null : { ...this.combo },
    });
    this.lastPublishedFrame = world.frame;
  }

  public reset(): void {
    this.lastAcceptedFrame = -1;
    this.lastPublishedFrame = -HUD_PUBLISH_INTERVAL_FRAMES;
    this.combo = null;
  }

  private readFighters(
    world: WorldSnapshot,
    match: HudMatchState,
  ): readonly [HudFighterSnapshot, HudFighterSnapshot] {
    const fighters = [...world.fighters]
      .map((fighter) => this.readFighter(fighter, match))
      .sort((first, second) => (first.side === 'left' ? -1 : second.side === 'left' ? 1 : 0));

    const left = fighters[0];
    const right = fighters[1];
    if (
      fighters.length !== 2
      || left === undefined
      || right === undefined
      || left.side !== 'left'
      || right.side !== 'right'
    ) {
      throw new Error('HUD bridge requires exactly one left and one right fighter');
    }
    return [left, right];
  }

  private readFighter(
    fighter: FighterSnapshot,
    match: HudMatchState,
  ): HudFighterSnapshot {
    const identity = this.identities.get(fighter.id);
    if (identity === undefined) {
      throw new Error(`Missing HUD identity for fighter "${fighter.id}"`);
    }
    const maxHealth = positiveInteger(fighter.maxHealth, 'maxHealth');
    const health = Math.max(0, Math.min(maxHealth, fighter.health));
    const ultimateSpent = match.ultimateSpent?.[fighter.id] === true;
    const superSpent = Math.max(
      0,
      Math.min(100, match.superSpent?.[fighter.id] ?? 0),
    );
    const earnedCharge = ultimateChargeFromHealth(health, maxHealth);
    return {
      ...identity,
      health,
      maxHealth,
      superCharge: ultimateSpent
        ? 0
        : Math.max(0, earnedCharge - superSpent),
      roundWins: Math.min(3, nonNegativeInteger(match.roundWins[fighter.id] ?? 0, 'roundWins')),
    };
  }

  private updateCombo(
    world: WorldSnapshot,
    events: readonly CombatEvent[],
  ): void {
    for (const event of events) {
      if (event.type !== 'hit') {
        continue;
      }
      if (this.combo?.attackerId === event.attackerId) {
        this.combo = {
          attackerId: event.attackerId,
          hits: this.combo.hits + 1,
          damage: this.combo.damage + event.damage,
        };
      } else {
        this.combo = {
          attackerId: event.attackerId,
          hits: 1,
          damage: event.damage,
        };
      }
    }

    if (this.combo === null) {
      return;
    }
    const defender = world.fighters.find(
      (fighter) => fighter.id !== this.combo?.attackerId,
    );
    if (
      !events.some((event) => event.type === 'hit')
      && defender !== undefined
      && defender.hitstun === 0
      && defender.hitstop === 0
    ) {
      this.combo = null;
    }
  }
}

function positiveInteger(value: number, name: string): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}

function nonNegativeInteger(value: number, name: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }
  return value;
}
