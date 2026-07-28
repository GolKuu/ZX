import Phaser from 'phaser';
import type { ReactGameBridge } from '../../bridge/ReactGameBridge';
import { GameEvents } from '../../bridge/GameEvents';
import { FixedStepLoop } from '../../core/FixedStepLoop';
import { RoundManager } from '../../core/RoundManager';
import type { PlayerId } from '../../core/types';
import { circleFighters } from '../../data/characters/circleFighters';
import type { OnlineMatchClient } from '../../network/OnlineMatchClient';
import { createOnlineAssignments } from '../../network/createOnlineAssignments';
import { InputManager } from '../../input/InputManager';
import { settingsStore } from '../../../stores/settingsStore';
import { createArena } from '../arenas/createArena';
import { ArenaTrapRenderer } from '../arenas/ArenaTrapRenderer';
import { FighterRenderer } from '../fighters/FighterRenderer';
import { FightHud } from '../hud/FightHud';
import { createSceneButton } from './createSceneButton';

export function createOnlineFightScene(
  bridge: ReactGameBridge,
  client: OnlineMatchClient,
  characters: Record<PlayerId, string>,
) {
  return class OnlineFightScene extends Phaser.Scene {
    private readonly loop = new FixedStepLoop();
    private readonly round = new RoundManager();
    private readonly inputs = new InputManager(createOnlineAssignments());
    private first!: FighterRenderer;
    private second!: FighterRenderer;
    private traps!: ArenaTrapRenderer;
    private hud!: FightHud;

    constructor() {
      super('OnlineFightScene');
    }

    create() {
      createArena(this);
      this.first = new FighterRenderer(this, 'player1', this.character('player1'));
      this.second = new FighterRenderer(this, 'player2', this.character('player2'));
      this.traps = new ArenaTrapRenderer(this);
      this.hud = new FightHud(
        this,
        this.character('player1'),
        this.character('player2'),
        settingsStore.load().showCombatHints,
      );
      createSceneButton(this, 24, 492, '← Комната', () =>
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
      if (!snapshot) return;
      const context = { matchWinner: snapshot.matchWinner };
      const stopped = snapshot.hitStopTicks > 0;
      this.first.sync(snapshot.fighters.player1, context, stopped);
      this.second.sync(snapshot.fighters.player2, context, stopped);
      this.traps.sync(snapshot.traps);
      this.hud.update(snapshot, this.round.countdownLabel(snapshot));
    }

    private character(playerId: PlayerId) {
      return circleFighters.find((fighter) => fighter.id === characters[playerId]) ??
        circleFighters[playerId === 'player1' ? 0 : 1];
    }

    private cleanup() {
      this.inputs.detach();
      this.first.destroy();
      this.second.destroy();
      this.traps.destroy();
      this.hud.destroy();
      bridge.emit(GameEvents.destroyed, undefined);
    }
  };
}
