import { XRAY_MOVE_ID } from '@/src/data/combat-moves';
import {
  CHRONO_CINEMATIC_FRAMES,
  chronoSuperKindForMove,
} from '@/src/data/chrono-super-moves';
import {
  ECHO_CINEMATIC_FREEZE_FRAMES,
  echoSuperKindForMove,
} from '@/src/data/echo-super-moves';
import { glitchSuperKindForMove } from '@/src/data/glitch-super-moves';
import { mimSuperKindForMove } from '@/src/data/mim-super-moves';
import {
  LUCKY_CINEMATIC_FRAMES,
  luckySuperKindForMove,
} from '@/src/data/lucky/supers';
import type { CombatEvent } from '@/src/sim';
import { useRenderStore } from '@/src/store/renderStore';
import { CinematicFreeze } from './CinematicFreeze';

/** Cinematics only: the meters live in `MeterController`. */
export class XrayController {
  private readonly freeze = new CinematicFreeze();

  public accept(events: readonly CombatEvent[]): void {
    for (const event of events) {
      if (event.type === 'moveStarted') {
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
          this.freeze.start(ECHO_CINEMATIC_FREEZE_FRAMES[echoKind]);
          useRenderStore.getState().triggerEchoSuper(event.fighterId, echoKind);
        }
        const glitchKind = glitchSuperKindForMove(event.moveId);
        if (
          glitchKind !== null
          && (event.fighterId === 'p1' || event.fighterId === 'p2')
        ) {
          useRenderStore.getState().triggerGlitchSuper(
            event.fighterId,
            glitchKind,
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
      if (
        event.type === 'hit'
        && (event.attackerId === 'p1' || event.attackerId === 'p2')
      ) {
        const luckyKind = luckySuperKindForMove(event.moveId);
        if (luckyKind !== null) {
          this.freeze.start(LUCKY_CINEMATIC_FRAMES[luckyKind]);
          useRenderStore.getState().triggerLuckySuper(
            event.attackerId,
            luckyKind,
          );
        }
        const chronoKind = chronoSuperKindForMove(event.moveId);
        if (chronoKind !== null) {
          this.freeze.start(CHRONO_CINEMATIC_FRAMES[chronoKind]);
          useRenderStore.getState().triggerChronoSuper(
            event.attackerId,
            chronoKind,
          );
        }
      }
    }
  }

  public consumeFrozenFrame(): boolean {
    return this.freeze.consume();
  }

  public get isFrozen(): boolean {
    return this.freeze.active;
  }

  public reset(): void {
    this.freeze.reset();
  }
}
