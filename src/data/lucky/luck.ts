/**
 * The Luck meter.
 *
 * Two rules shape everything here.
 *
 * First, the *engine* owns the number. Luck is `fighter.resource`; the engine
 * deducts `resourceCost` once in `tryStartMove` and pays `resourceGainOnHit` in
 * `resolve`. This module reads and describes that number, and never keeps a
 * second copy — a parallel ledger is exactly how a cost gets charged twice.
 *
 * Second, nothing here is hidden. Every tier, every modifier and every price is
 * something the HUD prints before it is spent, and the randomness runs off a
 * seed the player can see and reset. The brief forbids hidden random damage,
 * hidden unblockable states and random effects without visual communication;
 * the way to keep that promise is to have nothing to hide.
 */

import { LUCKY_SPECIAL_MOVES } from './specials.js';
import { LUCKY_MOVES } from './moves.js';

export const LUCK_MAX = 100;
export const LUCK_ENHANCED_COST = 25;

/** The five bands the brief names, lowest first. */
export const LUCK_TIERS = [
  { id: 'cold', from: 0, to: 24, label: 'Cold' },
  { id: 'even', from: 25, to: 49, label: 'Even Odds' },
  { id: 'warm', from: 50, to: 74, label: 'Running Hot' },
  { id: 'loaded', from: 75, to: 99, label: 'Loaded' },
  { id: 'jackpot', from: 100, to: 100, label: 'Jackpot' },
] as const;

export type LuckTierId = (typeof LUCK_TIERS)[number]['id'];

export function luckTier(charge: number): (typeof LUCK_TIERS)[number] {
  const clamped = Math.max(0, Math.min(LUCK_MAX, charge));
  for (const tier of LUCK_TIERS) {
    if (clamped >= tier.from && clamped <= tier.to) return tier;
  }
  return LUCK_TIERS[0];
}

/**
 * The modifiers K+L arms.
 *
 * Each one is a bounded, stated effect. None of them is an instant win, an
 * unblockable, or a damage number the player cannot see coming.
 */
export const LUCK_MODIFIERS = [
  {
    id: 'pressure',
    kind: 'offense',
    cost: 25,
    label: 'Loaded Odds',
    effect: 'Next special gains a wall bounce.',
  },
  {
    id: 'reach',
    kind: 'offense',
    cost: 25,
    label: 'Long Shot',
    effect: 'Next special travels further and pushes back harder.',
  },
  {
    id: 'guard',
    kind: 'defense',
    cost: 25,
    label: 'House Rules',
    effect: 'Next blocked hit costs no guard health.',
  },
  {
    id: 'escape',
    kind: 'defense',
    cost: 25,
    label: 'Cut Losses',
    effect: 'Next wake-up gains four frames of invulnerability.',
  },
] as const;

export type LuckModifier = (typeof LUCK_MODIFIERS)[number];
export type LuckModifierId = LuckModifier['id'];
export type LuckModifierKind = LuckModifier['kind'];

export function luckModifiersOfKind(
  kind: LuckModifierKind,
): readonly LuckModifier[] {
  return LUCK_MODIFIERS.filter((modifier) => modifier.kind === kind);
}

/**
 * A small, explicit PRNG.
 *
 * `Math.random` cannot be replayed, so a desync report or a failing test could
 * never be reproduced. Mulberry32 is thirty-two bits of state, seeded by an
 * integer the HUD can display and the player can reset.
 */
export class LuckRng {
  private state: number;

  public constructor(private readonly initialSeed: number = 0x5eed) {
    this.state = initialSeed >>> 0;
  }

  /** The seed currently in use, for the on-screen readout. */
  public get seed(): number {
    return this.initialSeed >>> 0;
  }

  public get currentState(): number {
    return this.state >>> 0;
  }

  /** Next value in `[0, 1)`. */
  public next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let value = this.state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  }

  public pick<Item>(items: readonly Item[]): Item | null {
    if (items.length === 0) return null;
    return items[Math.floor(this.next() * items.length)] ?? null;
  }

  /** Back to the seed it was built with. */
  public reset(): void {
    this.state = this.initialSeed >>> 0;
  }
}

/** What the HUD needs to print, all of it derived and none of it hidden. */
export interface LuckState {
  readonly charge: number;
  readonly tier: (typeof LUCK_TIERS)[number];
  readonly prepared: LuckModifier | null;
  readonly seed: number;
}

/**
 * Which modifier is armed, and the seed that chose it.
 *
 * Preparing is deliberate — the player commits with K+L and the choice is shown
 * before it can be spent. The seed only decides which modifier of the requested
 * *kind* is offered, so a player asking for a defensive modifier always gets a
 * defensive one; chance narrows the choice, it never overrides the request.
 */
export class LuckModifierSlot {
  private prepared: LuckModifier | null = null;

  public constructor(private readonly rng: LuckRng = new LuckRng()) {}

  public prepare(kind: LuckModifierKind): LuckModifier | null {
    const modifier = this.rng.pick(luckModifiersOfKind(kind));
    this.prepared = modifier;
    return modifier;
  }

  public cancel(): void {
    this.prepared = null;
  }

  public get current(): LuckModifier | null {
    return this.prepared;
  }

  /** Hand the armed modifier over and clear the slot, so it is spent once. */
  public consume(): LuckModifier | null {
    const modifier = this.prepared;
    this.prepared = null;
    return modifier;
  }

  public state(charge: number): LuckState {
    return {
      charge,
      tier: luckTier(charge),
      prepared: this.prepared,
      seed: this.rng.seed,
    };
  }

  public reset(): void {
    this.prepared = null;
    this.rng.reset();
  }
}

/**
 * Luck price of a move, read straight off the authored move data.
 *
 * Derived rather than duplicated: a hand-maintained cost table would be a
 * second place for a price to live, and the two would eventually disagree about
 * what an enhanced move costs.
 */
const COSTS: ReadonlyMap<string, number> = new Map(
  [...LUCKY_MOVES, ...LUCKY_SPECIAL_MOVES]
    .filter((move) => (move.resourceCost ?? 0) > 0)
    .map((move) => [move.id, move.resourceCost ?? 0]),
);

export function luckyCostForMove(moveId: string): number {
  return COSTS.get(moveId) ?? 0;
}

/** Every move that spends Luck, for the move list and the tests. */
export function luckySpendingMoves(): readonly string[] {
  return [...COSTS.keys()];
}
