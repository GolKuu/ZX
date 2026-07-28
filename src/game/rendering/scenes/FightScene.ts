import Phaser from 'phaser';
import type { LocalPvpMatchConfig } from '../../../stores/localPvpStore';
import { GameEvents } from '../../bridge/GameEvents';
import type { ReactGameBridge } from '../../bridge/ReactGameBridge';
import { FIXED_STEP_SECONDS } from '../../config/balanceConfig';
import {
  CombatSimulation,
  type CombatSimulationOptions,
} from '../../core/CombatSimulation';
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
import { VictoryCutsceneRenderer } from '../victory/VictoryCutsceneRenderer';
import { VICTORY_CUTSCENE_MS } from '../victory/victoryScenes';
import { SoloAiController } from '../../ai/SoloAiController';
import { CartoonParticlePool } from '../effects/CartoonParticlePool';
import { AI_TUNING } from '../../ai/AiDifficulty';

export function createFightScene(bridge: ReactGameBridge, matchConfig: LocalPvpMatchConfig) {
  return class FightScene extends Phaser.Scene {
    private readonly simulation = new CombatSimulation(
      matchConfig.characters,
      simulationOptions(matchConfig),
    );
    private readonly ai = matchConfig.aiPlayerId
      ? new SoloAiController(matchConfig.aiDifficulty)
      : null;
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
    private victory!: VictoryCutsceneRenderer;
    private feedback!: CartoonParticlePool;
    private readonly performance = new PerformanceMonitor();
    private resultEmitted = false;
    private victoryElapsedMs = 0;
    private stopBridgeListeners: Array<() => void> = [];

    constructor() {
      super('FightScene');
    }

    private onCharacterTextureReady = (payload: { characterId: string; dataUrl: string }) => {
      const key = `character-art-${payload.characterId}`;
      try {
        if (!this.textures.exists(key)) this.textures.addBase64(key, payload.dataUrl);
      } catch (e) {
        // textures.addBase64 may throw on some runtimes; ignore and continue
      }
      // apply to existing fighters if they match
      if (this.fighterOne && (this.fighterOne as any).characterId === payload.characterId) {
        (this.fighterOne as any).applySpriteTexture?.(key);
      }
      if (this.fighterTwo && (this.fighterTwo as any).characterId === payload.characterId) {
        (this.fighterTwo as any).applySpriteTexture?.(key);
      }
    };

    create() {
      const settings = settingsStore.load();
      createArena(this);
      this.fighterOne = new FighterRenderer(this, 'player1', this.characterFor('player1'));
      this.fighterTwo = new FighterRenderer(this, 'player2', this.characterFor('player2'));
      this.hud = new FightHud(
        this,
        this.characterFor('player1'),
        this.characterFor('player2'),
        settings.showCombatHints,
        settings.uiScale,
      );
      this.traps = new ArenaTrapRenderer(this);
      this.victory = new VictoryCutsceneRenderer(this);
      this.feedback = new CartoonParticlePool(this, settings);
      this.performance.attach(this);
      this.pauseButton = createSceneButton(this, 24, 492, 'Ⅱ Пауза', () => this.togglePause());
      createSceneButton(this, 132, 492, '← Выбор', () =>
        bridge.emit(GameEvents.returnToSetupRequested, undefined),
      );
      createSceneButton(this, 240, 492, '⌂ Меню', () =>
        bridge.emit(GameEvents.exitRequested, undefined),
      );
      this.bindBridgeCommands();
      // listen for textures generated from DOM SVGs
      this.stopBridgeListeners.push(bridge.on((GameEvents as any).characterTextureReady, this.onCharacterTextureReady));
      this.inputManager.attach();
      this.syncRenderers(0);

      const canvasCount = this.game.canvas.parentElement?.querySelectorAll('canvas').length ?? 1;
      bridge.emit(GameEvents.ready, { canvasCount });
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
    }

    update(_time: number, deltaMs: number) {
      this.performance.beginFrame();
      this.loop.advance(deltaMs / 1_000, () => {
        const input = this.inputManager.snapshot();
        if (this.ai && matchConfig.aiPlayerId) {
          input[matchConfig.aiPlayerId] = this.ai.frame(
            matchConfig.aiPlayerId,
            this.simulation.getSnapshot(),
          );
        }
        if (this.inputManager.consumeGlobalPress('PAUSE')) this.togglePause();
        this.simulation.step(input, FIXED_STEP_SECONDS);
        this.inputManager.endTick();
      });
      this.syncRenderers(deltaMs);
      this.emitMatchResult();
      this.performance.record(this, deltaMs);
    }

    private bindBridgeCommands() {
      this.stopBridgeListeners = [
        bridge.on(GameEvents.rematchRequested, () => {
          this.simulation.rematch();
          this.resultEmitted = false;
          this.victoryElapsedMs = 0;
        }),
        bridge.on(GameEvents.switchToKeyboardRequested, ({ playerId }) => {
          const profiles = {
            player1: matchConfig.assignments.player1.keyboardProfile,
            player2: matchConfig.assignments.player2.keyboardProfile,
          };
          this.inputManager.switchToKeyboard(playerId, profiles);
          this.handleReconnect(playerId, 'Клавиатура');
        }),
        bridge.on(GameEvents.mobileAction, ({ playerId, action, pressed }) => {
          // accept mobile button events and forward to input manager
          if (pressed) this.inputManager.pressAction(playerId, action as any);
          else this.inputManager.releaseAction(playerId, action as any);
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
      if (this.victoryElapsedMs < VICTORY_CUTSCENE_MS) return;
      this.resultEmitted = true;
      bridge.emit(GameEvents.matchEnded, {
        winner: snapshot.matchWinner,
        wins: snapshot.wins,
      });
    }

    private syncRenderers(deltaMs: number) {
      const snapshot = this.simulation.getSnapshot();
      const context = { matchWinner: snapshot.matchWinner };
      this.victoryElapsedMs = snapshot.matchWinner
        ? this.victoryElapsedMs + deltaMs
        : 0;
      const stopped = snapshot.hitStopTicks > 0;
      this.fighterOne.sync(snapshot.fighters.player1, context, stopped);
      this.fighterTwo.sync(snapshot.fighters.player2, context, stopped);
      this.traps.sync(snapshot.traps);
      this.hud.update(snapshot, this.simulation.getCountdownLabel());
      const winner = snapshot.matchWinner;
      this.victory.sync(
        winner,
        winner ? snapshot.fighters[winner] : null,
        winner ? this.characterFor(winner) : null,
        this.victoryElapsedMs,
      );
      this.feedback.sync(snapshot, deltaMs);

      // emit DOM overlay positions for React layer (keeps menu-like SVGs synced)
      bridge.emit((GameEvents as any).domCharacterSync, {
        player1: {
          x: snapshot.fighters.player1.x,
          y: snapshot.fighters.player1.y,
          facing: snapshot.fighters.player1.facing,
          state: this.fighterStateName(snapshot.fighters.player1),
          characterId: snapshot.fighters.player1.characterId,
        },
        player2: {
          x: snapshot.fighters.player2.x,
          y: snapshot.fighters.player2.y,
          facing: snapshot.fighters.player2.facing,
          state: this.fighterStateName(snapshot.fighters.player2),
          characterId: snapshot.fighters.player2.characterId,
        },
      });
    }

    private fighterStateName(f: import('../../core/types').FighterSnapshot) {
      return f.mode === 'attackActive' && f.attack ? 'light' : f.mode === 'dashing' ? 'dash' : 'idle';
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
      this.victory.destroy();
      this.feedback.destroy();
      this.performance.destroy();
      bridge.emit(GameEvents.destroyed, undefined);
    }

  };
}

function simulationOptions(config: LocalPvpMatchConfig): CombatSimulationOptions {
  if (!config.aiPlayerId) return {};
  const modifier = AI_TUNING[config.aiDifficulty ?? 'EASY'].fighterModifier;
  if (!modifier) return {};
  return { fighterModifiers: { [config.aiPlayerId]: modifier } };
}
