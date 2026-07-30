/**
 * Both meters for one match, as a pure ledger.
 *
 * Energy is earned by trading hits and spent on supers. The ultimate is not on
 * that economy: it unlocks when the fighter's own health falls to the threshold
 * and is gone for the rest of the round once used. Nothing here touches the DOM
 * or the engine, so a replay of the same events produces the same meters.
 */

import { buildsMeter, isUltimateMove, superCostForMove } from '../data/meter-moves.js';
import type { CombatEvent } from '../sim/events.js';
import {
  clampSuperMeter,
  superGainForDamageDealt,
  superGainForDamageTaken,
} from './superMeter.js';
import { ultimateReadyFromHealth } from './ultimateCharge.js';

export class MeterLedger {
  private readonly energy = new Map<string, number>();
  private readonly ultimatesUsed = new Set<string>();

  public accept(events: readonly CombatEvent[]): void {
    for (const event of events) {
      if (event.type === 'moveStarted') {
        this.spend(event.fighterId, event.moveId);
      }
      if (event.type === 'hit') {
        this.earn(event.attackerId, event.defenderId, event.moveId, event.damage);
      }
    }
  }

  public charge(fighterId: string): number {
    return this.energy.get(fighterId) ?? 0;
  }

  public isUltimateReady(
    fighterId: string,
    health: number,
    maxHealth: number,
  ): boolean {
    return !this.ultimatesUsed.has(fighterId)
      && ultimateReadyFromHealth(health, maxHealth);
  }

  public ultimateUsed(fighterId: string): boolean {
    return this.ultimatesUsed.has(fighterId);
  }

  public reset(): void {
    this.energy.clear();
    this.ultimatesUsed.clear();
  }

  private spend(fighterId: string, moveId: string): void {
    if (isUltimateMove(moveId)) {
      this.ultimatesUsed.add(fighterId);
      return;
    }
    const cost = superCostForMove(moveId);
    if (cost !== null) {
      this.add(fighterId, -cost);
    }
  }

  private earn(
    attackerId: string,
    defenderId: string,
    moveId: string,
    damage: number,
  ): void {
    if (!buildsMeter(moveId)) {
      return;
    }
    this.add(attackerId, superGainForDamageDealt(damage));
    this.add(defenderId, superGainForDamageTaken(damage));
  }

  private add(fighterId: string, delta: number): void {
    this.energy.set(fighterId, clampSuperMeter(this.charge(fighterId) + delta));
  }
}
