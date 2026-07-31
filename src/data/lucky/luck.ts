import type { CombatEvent } from '../../sim/events.js';

export const LUCK_MAX = 100;
export const LUCK_ENHANCED_COST = 25;

const COSTS: Readonly<Record<string, number>> = {
  'lucky.enhanced.step': 25,
  'lucky.enhanced.loaded-strike': 25,
  'lucky.enhanced.probability-shift': 25,
  'lucky.enhanced.risky-counter': 25,
  'lucky.enhanced.fortune-break': 50,
  'lucky.enhanced.jackpot-rush': 75,
};

export class LuckLedger {
  private readonly values = new Map<string, number>();

  public accept(events: readonly CombatEvent[]): void {
    for (const event of events) {
      if (event.type === 'moveStarted') {
        this.add(event.fighterId, -(COSTS[event.moveId] ?? 0));
      } else if (event.type === 'hit' && event.moveId.startsWith('lucky.')) {
        const comboReward = event.damage >= 70 ? 8 : 5;
        this.add(event.attackerId, comboReward);
      } else if (event.type === 'block' && event.perfect) {
        this.add(event.defenderId, 4);
      }
    }
  }

  public charge(fighterId: string): number {
    return this.values.get(fighterId) ?? 0;
  }

  public reset(): void {
    this.values.clear();
  }

  private add(fighterId: string, delta: number): void {
    const next = Math.max(0, Math.min(LUCK_MAX, this.charge(fighterId) + delta));
    this.values.set(fighterId, next);
  }
}

export function luckyCostForMove(moveId: string): number {
  return COSTS[moveId] ?? 0;
}
