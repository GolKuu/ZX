import Phaser from 'phaser';
import { GameEvents } from '../../bridge/GameEvents';
import type { ReactGameBridge } from '../../bridge/ReactGameBridge';
import { FIXED_STEP_SECONDS } from '../../config/balanceConfig';
import { CombatSimulation } from '../../core/CombatSimulation';
import { FixedStepLoop } from '../../core/FixedStepLoop';
import { circleFighters } from '../../data/characters/circleFighters';
import { InputManager } from '../../input/InputManager';
import { createArena } from '../arenas/createArena';
import { FighterRenderer } from '../fighters/FighterRenderer';
import { FightHud } from '../hud/FightHud';

export function createFightScene(bridge: ReactGameBridge) {
  return class FightScene extends Phaser.Scene {
    private readonly simulation = new CombatSimulation();
    private readonly loop = new FixedStepLoop();
    private readonly inputManager = new InputManager();
    private fighterOne!: FighterRenderer;
    private fighterTwo!: FighterRenderer;
    private hud!: FightHud;
    private pauseButton!: Phaser.GameObjects.Text;

    constructor() {
      super('FightScene');
    }

    create() {
      createArena(this);
      this.fighterOne = new FighterRenderer(this, circleFighters[0]);
      this.fighterTwo = new FighterRenderer(this, circleFighters[1]);
      this.hud = new FightHud(this);
      this.pauseButton = this.createButton(36, 84, 'Пауза', () => this.togglePause());
      this.createButton(36, 126, 'В меню', () =>
        bridge.emit(GameEvents.exitRequested, undefined),
      );
      this.inputManager.attach();
      this.syncRenderers();

      const canvasCount = this.game.canvas.parentElement?.querySelectorAll('canvas').length ?? 1;
      bridge.emit(GameEvents.ready, { canvasCount });
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.inputManager.detach();
        this.hud.destroy();
        bridge.emit(GameEvents.destroyed, undefined);
      });
    }

    update(_time: number, deltaMs: number) {
      this.loop.advance(deltaMs / 1_000, () => {
        if (this.inputManager.consumeGlobalPress('pause')) this.togglePause();
        if (this.inputManager.consumeGlobalPress('exit')) {
          bridge.emit(GameEvents.exitRequested, undefined);
        }
        this.simulation.step(this.inputManager.snapshot(), FIXED_STEP_SECONDS);
        this.inputManager.endTick();
      });
      this.syncRenderers();
    }

    private togglePause() {
      const nextPaused = !this.simulation.getSnapshot().paused;
      this.simulation.setPaused(nextPaused);
      this.pauseButton.setText(nextPaused ? 'Продолжить' : 'Пауза');
      bridge.emit(GameEvents.pauseChanged, { paused: nextPaused });
    }

    private syncRenderers() {
      const snapshot = this.simulation.getSnapshot();
      this.fighterOne.sync(snapshot.fighters.player1);
      this.fighterTwo.sync(snapshot.fighters.player2);
      this.hud.update(snapshot);
    }

    private createButton(x: number, y: number, label: string, action: () => void) {
      const button = this.add
        .text(x, y, label, {
          fontFamily: 'Arial',
          fontSize: '17px',
          fontStyle: 'bold',
          color: '#30264f',
          backgroundColor: '#ffffffdd',
          padding: { x: 14, y: 9 },
        })
        .setDepth(30)
        .setInteractive({ useHandCursor: true });
      button.on(Phaser.Input.Events.POINTER_DOWN, action);
      return button;
    }
  };
}
