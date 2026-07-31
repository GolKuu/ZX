import { MeterLedger } from '@/src/hud';
import type { CommandContext } from '@/src/input';
import type { CombatEvent, FighterSnapshot } from '@/src/sim';
import type { CharacterSelection } from '@/src/data/characterRoster';

/** Adapter between the meter ledger, the command tables and the HUD. */
export class MeterController {
  private readonly ledger = new MeterLedger();
  public constructor(private readonly selection: CharacterSelection) {}

  public inputContext(fighter: FighterSnapshot): CommandContext {
    return {
      grounded: fighter.grounded,
      stanceId: fighter.statusId,
      gauge: this.isVorgh(fighter.id)
        ? fighter.resource
        : this.isLucky(fighter.id)
          ? fighter.resource
          : 0,
      superMeter: this.ledger.charge(fighter.id),
      ultimateReady: this.isUltimateReady(fighter),
    };
  }

  public accept(events: readonly CombatEvent[]): void {
    this.ledger.accept(events);
  }

  public superChargeState(
    fighters: readonly FighterSnapshot[],
  ): Readonly<Record<string, number>> {
    const state: Record<string, number> = {};
    for (const fighter of fighters) {
      state[fighter.id] = this.ledger.charge(fighter.id);
    }
    return state;
  }

  public ultimateReadyState(
    fighters: readonly FighterSnapshot[],
  ): Readonly<Record<string, boolean>> {
    const state: Record<string, boolean> = {};
    for (const fighter of fighters) {
      state[fighter.id] = this.isUltimateReady(fighter);
    }
    return state;
  }

  public luckState(
    fighters: readonly FighterSnapshot[],
  ): Readonly<Record<string, number>> {
    const state: Record<string, number> = {};
    for (const fighter of fighters) {
      state[fighter.id] = this.isLucky(fighter.id)
        ? fighter.resource
        : 0;
    }
    return state;
  }

  public rageState(
    fighters: readonly FighterSnapshot[],
  ): Readonly<Record<string, number>> {
    const state: Record<string, number> = {};
    for (const fighter of fighters) {
      state[fighter.id] = this.isVorgh(fighter.id) ? fighter.resource : 0;
    }
    return state;
  }

  public reset(): void {
    this.ledger.reset();
  }

  private isUltimateReady(fighter: FighterSnapshot): boolean {
    const healthReady = this.ledger.isUltimateReady(
      fighter.id,
      fighter.health,
      fighter.maxHealth,
    );
    const luckReady = (
      this.isLucky(fighter.id)
      && fighter.resource >= 75
      && !this.ledger.ultimateUsed(fighter.id)
    );
    return healthReady || luckReady;
  }

  private isLucky(fighterId: string): boolean {
    if (fighterId === 'p1') return this.selection[0] === 'lucky';
    if (fighterId === 'p2') return this.selection[1] === 'lucky';
    return false;
  }

  private isVorgh(fighterId: string): boolean {
    if (fighterId === 'p1') return this.selection[0] === 'vorgh';
    if (fighterId === 'p2') return this.selection[1] === 'vorgh';
    return false;
  }
}
