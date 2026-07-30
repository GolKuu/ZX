import { XRAY_MOVE_ID } from '@/src/data/combat-moves';
import {
  chronoSuperCostForMove,
  chronoSuperKindForMove,
} from '@/src/data/chrono-super-moves';
import {
  echoSuperCostForMove,
  echoSuperKindForMove,
} from '@/src/data/echo-super-moves';
import {
  idolSuperCostForMove,
  isIdolCinematicMove,
} from '@/src/data/idol-move-ids';
import {
  mimSuperCostForMove,
  mimSuperKindForMove,
} from '@/src/data/mim-super-moves';
import { ultimateChargeFromHealth } from '@/src/hud';
import type { CommandContext } from '@/src/input';
import type { CombatEvent, FighterSnapshot } from '@/src/sim';
import { useRenderStore } from '@/src/store/renderStore';

export class XrayController {
  private readonly spentBy = new Map<string, number>();

  public inputContext(
    fighter: FighterSnapshot,
    opponent?: FighterSnapshot,
  ): CommandContext {
    const earned = ultimateChargeFromHealth(fighter.health, fighter.maxHealth);
    return {
      grounded: fighter.grounded,
      stanceId: null,
      gauge: 0,
      superMeter: Math.max(0, earned - (this.spentBy.get(fighter.id) ?? 0)),
      finisherReady: opponent !== undefined
        && opponent.health / opponent.maxHealth <= 0.3,
    };
  }

  public accept(events: readonly CombatEvent[]): void {
    for (const event of events) {
      if (event.type === 'moveStarted') {
        const cost = event.moveId === XRAY_MOVE_ID
          ? 100
          : mimSuperCostForMove(event.moveId)
            ?? echoSuperCostForMove(event.moveId)
            ?? idolSuperCostForMove(event.moveId)
            ?? chronoSuperCostForMove(event.moveId);
        if (cost !== null) {
          this.spentBy.set(
            event.fighterId,
            Math.min(100, (this.spentBy.get(event.fighterId) ?? 0) + cost),
          );
        }
        const kind = mimSuperKindForMove(event.moveId);
        if (
          kind !== null
          && (event.fighterId === 'p1' || event.fighterId === 'p2')
        ) {
          useRenderStore.getState().triggerMimSuper(event.fighterId, kind);
        }
        const echoKind = echoSuperKindForMove(event.moveId);
        if (
          echoKind !== null
          && (event.fighterId === 'p1' || event.fighterId === 'p2')
        ) {
          useRenderStore.getState().triggerEchoSuper(event.fighterId, echoKind);
        }
        if (
          isIdolCinematicMove(event.moveId)
          && (event.fighterId === 'p1' || event.fighterId === 'p2')
        ) {
          useRenderStore.getState().triggerIdolSuper(
            event.fighterId,
            event.moveId,
          );
        }
        const chronoKind = chronoSuperKindForMove(event.moveId);
        if (
          chronoKind !== null
          && (event.fighterId === 'p1' || event.fighterId === 'p2')
        ) {
          useRenderStore.getState().triggerChronoSuper(
            event.fighterId,
            chronoKind,
          );
        }
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
      p1: (this.spentBy.get('p1') ?? 0) >= 100,
      p2: (this.spentBy.get('p2') ?? 0) >= 100,
    };
  }

  public spentCharge(): Readonly<Record<string, number>> {
    return {
      p1: this.spentBy.get('p1') ?? 0,
      p2: this.spentBy.get('p2') ?? 0,
    };
  }

  public reset(): void {
    this.spentBy.clear();
  }
}
