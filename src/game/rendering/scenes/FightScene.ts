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
import { createArena } from '../arenas/createArena';
import { FighterRenderer } from '../fighters/FighterRenderer';
import { FightHud } from '../hud/FightHud';

export function createFightScene(bridge: ReactGameBridge, matchConfig: LocalPvpMatchConfig) {
  return class FightScene extends Phaser.Scene {
    private readonly simulation = new CombatSimulation();
    private readonly loop = new FixedStepLoop();
    private readonly inputManager = new InputManager(matchConfig.assignments, {
      onDeviceDisconnected: (playerId, label) => this.handleDisconnect(playerId, label),
      onDeviceReconnected: (playerId, label) => this.handleReconnect(playerId, label),
    });
    private fighterOne!: FighterRenderer;
    private fighterTwo!: FighterRenderer;
    private hud!: FightHud;
    private pauseButton!: Phaser.GameObjects.Text;
    private resultEmitted = false;
    private stopBridgeListeners: Array<() => void> = [];

    constructor() {
      super('FightScene');
    }

    create() {
      createArena(this);
      this.fighterOne = new FighterRenderer(this, this.characterFor('player1'));
      this.fighterTwo = new FighterRenderer(this, this.characterFor('player2'));
      this.hud = new FightHud(this);
      this.pauseButton = this.createButton(36, 84, 'Пауза', () => this.togglePause());
      this.createButton(36, 126, 'К выбору', () =>
        bridge.emit(GameEvents.returnToSetupRequested, undefined),
      );
      this.createButton(36, 168, 'В меню', () =>
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
      this.pauseButton.setText(nextPaused ? 'Продолжить' : 'Пауза');
      bridge.emit(GameEvents.pauseChanged, { paused: nextPaused });
    }

    private handleDisconnect(playerId: PlayerId, label: string) {
      this.simulation.setPaused(true);
      this.pauseButton?.setText('Продолжить');
      bridge.emit(GameEvents.deviceDisconnected, { playerId, label });
    }

    private handleReconnect(playerId: PlayerId, label: string) {
      this.simulation.setPaused(false);
      this.pauseButton?.setText('Пауза');
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
      this.fighterOne.sync(snapshot.fighters.player1);
      this.fighterTwo.sync(snapshot.fighters.player2);
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
      this.hud.destroy();
      bridge.emit(GameEvents.destroyed, undefined);
    }

    private createButton(x: number, y: number, label: string, action: () => void) {
      return this.add
        .text(x, y, label, {
          fontFamily: 'Arial',
          fontSize: '17px',
          fontStyle: 'bold',
          color: '#30264f',
          backgroundColor: '#ffffffdd',
          padding: { x: 14, y: 9 },
        })
        .setDepth(30)
        .setInteractive({ useHandCursor: true })
        .on(Phaser.Input.Events.POINTER_DOWN, action);
    }
  };
}
