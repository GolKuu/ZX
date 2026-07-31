import { MeterLedger } from '@/src/hud';
import type { CommandContext } from '@/src/input';
import type { CombatEvent, FighterSnapshot } from '@/src/sim';
import type { CharacterSelection } from '@/src/data/characterRoster';
import { LuckLedger } from '@/src/data/lucky/luck';

/** Adapter between the meter ledger, the command tables and the HUD. */
export class MeterController {
  private readonly ledger = new MeterLedger();
  private readonly luck = new LuckLedger();

  public constructor(private readonly selection: CharacterSelection) {}

  public inputContext(fighter: FighterSnapshot): CommandContext {
    return {
      grounded: fighter.grounded,
      stanceId: null,
      gauge: this.isLucky(fighter.id) ? this.luck.charge(fighter.id) : 0,
      superMeter: this.ledger.charge(fighter.id),
      ultimateReady: this.isUltimateReady(fighter),
    };
  }

  public accept(events: readonly CombatEvent[]): void {
    this.ledger.accept(events);
    this.luck.accept(events);
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
        ? this.luck.charge(fighter.id)
        : 0;
    }
    return state;
  }

  public reset(): void {
    this.ledger.reset();
    this.luck.reset();
  }

  private isUltimateReady(fighter: FighterSnapshot): boolean {
    return this.ledger.isUltimateReady(
      fighter.id,
      fighter.health,
      fighter.maxHealth,
    );
  }

  private isLucky(fighterId: string): boolean {
    const index = fighterId === 'p1' ? 0 : fighterId === 'p2' ? 1 : -1;
    return index >= 0 && this.selection[index] === 'lucky';
  }
}
