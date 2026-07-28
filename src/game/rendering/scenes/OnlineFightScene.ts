import Phaser from 'phaser';
import type { ReactGameBridge } from '../../bridge/ReactGameBridge';
import { GameEvents } from '../../bridge/GameEvents';
import { FixedStepLoop } from '../../core/FixedStepLoop';
import { RoundManager } from '../../core/RoundManager';
import type { PlayerId } from '../../core/types';
import type { TeamSimulationSnapshot } from '../../team/TeamTypes';
import type { OnlineMatchClient } from '../../network/OnlineMatchClient';
import { createOnlineAssignments } from '../../network/createOnlineAssignments';
import { InputManager } from '../../input/InputManager';
import { createArena } from '../arenas/createArena';
import { ArenaTrapRenderer } from '../arenas/ArenaTrapRenderer';
import { createSceneButton } from './createSceneButton';
import { TeamFighterRenderers } from './TeamFighterRenderers';

export function createOnlineFightScene(
  bridge: ReactGameBridge,
  client: OnlineMatchClient,
  _characters: Record<PlayerId, string>,
) {
  return class OnlineFightScene extends Phaser.Scene {
    private readonly loop = new FixedStepLoop();
    private readonly round = new RoundManager();
    private readonly inputs = new InputManager(createOnlineAssignments());
    private fighters!: TeamFighterRenderers;
    private traps!: ArenaTrapRenderer;

    constructor() {
      super('OnlineFightScene');
    }

    create() {
      createArena(this);
      this.fighters = new TeamFighterRenderers(this);
      this.traps = new ArenaTrapRenderer(this);
      createSceneButton(this, 24, 492, '← Выйти', () =>
        bridge.emit(GameEvents.returnToSetupRequested, undefined),
      );
      createSceneButton(this, 150, 492, '⌂ Меню', () =>
        bridge.emit(GameEvents.exitRequested, undefined),
      );
      this.inputs.attach();
      this.syncRenderers();
      bridge.emit(GameEvents.ready, { canvasCount: 1 });
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
    }

    update(_time: number, deltaMs: number) {
      this.loop.advance(deltaMs / 1_000, () => {
        const input = this.inputs.snapshot();
        client.submitInput(input.player1);
        this.inputs.endTick();
      });
      this.syncRenderers();
    }

    private syncRenderers() {
      const snapshot = client.renderSnapshot();
      if (!snapshot || !('teamBattle' in snapshot)) return;
      const teamSnapshot = snapshot as TeamSimulationSnapshot;
      this.fighters.sync(teamSnapshot, this.round.countdownLabel(teamSnapshot));
      this.traps.sync(snapshot.traps);
    }

    private cleanup() {
      this.inputs.detach();
      this.fighters.destroy();
      this.traps.destroy();
      bridge.emit(GameEvents.destroyed, undefined);
    }
  };
}
