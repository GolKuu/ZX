import Phaser from 'phaser';
import type { LocalPvpMatchConfig } from '../../../stores/localPvpStore';
import { GameEvents } from '../../bridge/GameEvents';
import type { ReactGameBridge } from '../../bridge/ReactGameBridge';
import { FIXED_STEP_SECONDS } from '../../config/balanceConfig';
import { CombatSimulation } from '../../core/CombatSimulation';
import { FixedStepLoop } from '../../core/FixedStepLoop';
import type { PlayerId } from '../../core/types';
import { circleFighters } from '../../data/characters/circleFighters';
import { InputManager } from '../../input/InputManager';
import { settingsStore } from '../../../stores/settingsStore';
import { createArena } from '../arenas/createArena';
import { FighterRenderer } from '../fighters/FighterRenderer';
import { FightHud } from '../hud/FightHud';
import { ArenaTrapRenderer } from '../arenas/ArenaTrapRenderer';
import { PerformanceMonitor } from '../../diagnostics/PerformanceMonitor';
import { createSceneButton } from './createSceneButton';

export function createFightScene(bridge: ReactGameBridge, matchConfig: LocalPvpMatchConfig) {
  return class FightScene extends Phaser.Scene {
    private readonly simulation = new CombatSimulation(matchConfig.characters);
    private readonly loop = new FixedStepLoop();
    private readonly inputManager = new InputManager(matchConfig.assignments, {
      onDeviceDisconnected: (playerId, label) => this.handleDisconnect(playerId, label),
      onDeviceReconnected: (playerId, label) => this.handleReconnect(playerId, label),
    });
    private fighterOne!: FighterRenderer;
    private fighterTwo!: FighterRenderer;
    private hud!: FightHud;
    private pauseButton!: Phaser.GameObjects.Text;
    private traps!: ArenaTrapRenderer;
    private readonly performance = new PerformanceMonitor();
    private resultEmitted = false;
    private stopBridgeListeners: Array<() => void> = [];

    constructor() {
      super('FightScene');
    }

    create() {
      createArena(this);
      this.fighterOne = new FighterRenderer(this, 'player1', this.characterFor('player1'));
      this.fighterTwo = new FighterRenderer(this, 'player2', this.characterFor('player2'));
      this.hud = new FightHud(
        this,
        this.characterFor('player1'),
        this.characterFor('player2'),
        settingsStore.load().showCombatHints,
      );
      this.traps = new ArenaTrapRenderer(this);
      this.performance.attach(this);
      this.pauseButton = createSceneButton(this, 24, 492, 'Ⅱ Пауза', () => this.togglePause());
      createSceneButton(this, 132, 492, '← Выбор', () =>
        bridge.emit(GameEvents.returnToSetupRequested, undefined),
      );
      createSceneButton(this, 240, 492, '⌂ Меню', () =>
        bridge.emit(GameEvents.exitRequested, undefined),
      );
      this.bindBridgeCommands();
      this.inputManager.attach();
      this.syncRenderers();

      const canvasCount = this.game.canvas.parentElement?.querySelectorAll('canvas').length ?? 1;
      bridge.emit(GameEvents.ready, { canvasCount });
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
    }

    update(_time: number, deltaMs: number) {
      this.loop.advance(deltaMs / 1_000, () => {
        const input = this.inputManager.snapshot();
        if (this.inputManager.consumeGlobalPress('PAUSE')) this.togglePause();
        this.simulation.step(input, FIXED_STEP_SECONDS);
        this.inputManager.endTick();
      });
      this.syncRenderers();
      this.emitMatchResult();
      this.performance.record(this, deltaMs);
    }

    private bindBridgeCommands() {
      this.stopBridgeListeners = [
        bridge.on(GameEvents.rematchRequested, () => {
          this.simulation.rematch();
          this.resultEmitted = false;
        }),
        bridge.on(GameEvents.switchToKeyboardRequested, ({ playerId }) => {
          const profiles = {
            player1: matchConfig.assignments.player1.keyboardProfile,
            player2: matchConfig.assignments.player2.keyboardProfile,
          };
          this.inputManager.switchToKeyboard(playerId, profiles);
          this.handleReconnect(playerId, 'Клавиатура');
        }),
      ];
    }

    private togglePause() {
      const nextPaused = !this.simulation.getSnapshot().paused;
      this.simulation.setPaused(nextPaused);
      this.pauseButton.setText(nextPaused ? '▶ Продолжить' : 'Ⅱ Пауза');
      bridge.emit(GameEvents.pauseChanged, { paused: nextPaused });
    }

    private handleDisconnect(playerId: PlayerId, label: string) {
      this.simulation.setPaused(true);
      this.pauseButton?.setText('▶ Продолжить');
      bridge.emit(GameEvents.deviceDisconnected, { playerId, label });
    }

    private handleReconnect(playerId: PlayerId, label: string) {
      this.simulation.setPaused(false);
      this.pauseButton?.setText('Ⅱ Пауза');
      bridge.emit(GameEvents.deviceReconnected, { playerId, label });
    }

    private emitMatchResult() {
      const snapshot = this.simulation.getSnapshot();
      if (!snapshot.matchWinner || this.resultEmitted) return;
      this.resultEmitted = true;
      bridge.emit(GameEvents.matchEnded, {
        winner: snapshot.matchWinner,
        wins: snapshot.wins,
      });
    }

    private syncRenderers() {
      const snapshot = this.simulation.getSnapshot();
      const context = { matchWinner: snapshot.matchWinner };
      const stopped = snapshot.hitStopTicks > 0;
      this.fighterOne.sync(snapshot.fighters.player1, context, stopped);
      this.fighterTwo.sync(snapshot.fighters.player2, context, stopped);
      this.traps.sync(snapshot.traps);
      this.hud.update(snapshot, this.simulation.getCountdownLabel());
    }

    private characterFor(playerId: PlayerId) {
      return (
        circleFighters.find((fighter) => fighter.id === matchConfig.characters[playerId]) ??
        circleFighters[playerId === 'player1' ? 0 : 1]
      );
    }

    private cleanup() {
      this.stopBridgeListeners.forEach((stop) => stop());
      this.stopBridgeListeners = [];
      this.inputManager.detach();
      this.fighterOne.destroy();
      this.fighterTwo.destroy();
      this.traps.destroy();
      this.hud.destroy();
      this.performance.destroy();
      bridge.emit(GameEvents.destroyed, undefined);
    }

  };
}
