import { XRAY_MOVE_ID } from '@/src/data/combat-moves';
import { ultimateChargeFromHealth } from '@/src/hud';
import type { CommandContext } from '@/src/input';
import type { CombatEvent, FighterSnapshot } from '@/src/sim';
import { useRenderStore } from '@/src/store/renderStore';

export class XrayController {
  private readonly usedBy = new Set<string>();

  public inputContext(fighter: FighterSnapshot): CommandContext {
    return {
      grounded: fighter.grounded,
      stanceId: null,
      gauge: 0,
      superMeter: this.usedBy.has(fighter.id)
        ? 0
        : ultimateChargeFromHealth(fighter.health, fighter.maxHealth),
    };
  }

  public accept(events: readonly CombatEvent[]): void {
    for (const event of events) {
      if (event.type === 'moveStarted' && event.moveId === XRAY_MOVE_ID) {
        this.usedBy.add(event.fighterId);
      }
      if (
        event.type === 'hit'
        && event.moveId === XRAY_MOVE_ID
        && (event.attackerId === 'p1' || event.attackerId === 'p2')
      ) {
        useRenderStore.getState().triggerXray(event.attackerId);
      }
    }
  }

  public spentState(): Readonly<Record<string, boolean>> {
    return {
      p1: this.usedBy.has('p1'),
      p2: this.usedBy.has('p2'),
    };
  }

  public reset(): void {
    this.usedBy.clear();
  }
}
