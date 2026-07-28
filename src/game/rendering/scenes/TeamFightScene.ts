import Phaser from 'phaser';
import type { LocalTeamBattleConfig } from '../../../stores/teamBattleStore';
import type { ReactGameBridge } from '../../bridge/ReactGameBridge';
import { GameEvents } from '../../bridge/GameEvents';
import { FIXED_STEP_SECONDS } from '../../config/balanceConfig';
import { FixedStepLoop } from '../../core/FixedStepLoop';
import { InputManager } from '../../input/InputManager';
import { TeamCombatSimulation } from '../../team/TeamCombatSimulation';
import type { TeamInputFrame } from '../../team/TeamTypes';
import { createArena } from '../arenas/createArena';
import { ArenaTrapRenderer } from '../arenas/ArenaTrapRenderer';
import { createSceneButton } from './createSceneButton';
import { TeamFighterRenderers } from './TeamFighterRenderers';
import { RoundManager } from '../../core/RoundManager';
import { settingsStore } from '../../../stores/settingsStore';
import { CartoonParticlePool } from '../effects/CartoonParticlePool';

export function createTeamFightScene(
  bridge: ReactGameBridge,
  config: LocalTeamBattleConfig,
) {
  return class TeamFightScene extends Phaser.Scene {
    private readonly simulation = new TeamCombatSimulation(config.battle);
    private readonly inputs = new InputManager(config.assignments);
    private readonly loop = new FixedStepLoop();
    private readonly round = new RoundManager();
    private fighters!: TeamFighterRenderers;
    private traps!: ArenaTrapRenderer;
    private feedback!: CartoonParticlePool;
    private resultEmitted = false;

    constructor() {
      super('TeamFightScene');
    }

    create() {
      createArena(this);
      this.fighters = new TeamFighterRenderers(this);
      this.traps = new ArenaTrapRenderer(this);
      this.feedback = new CartoonParticlePool(this, settingsStore.load());
      createSceneButton(this, 24, 492, '← Режимы', () =>
        bridge.emit(GameEvents.returnToSetupRequested, undefined),
      );
      createSceneButton(this, 146, 492, '⌂ Меню', () =>
        bridge.emit(GameEvents.exitRequested, undefined),
      );
      this.inputs.attach();
      this.sync();
      bridge.emit(GameEvents.ready, { canvasCount: 1 });
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
    }

    update(_time: number, deltaMs: number) {
      this.loop.advance(deltaMs / 1_000, () => {
        const input = this.inputs.snapshot();
        this.simulation.step(mapInput(config.battle.mode, input), FIXED_STEP_SECONDS);
        this.inputs.endTick();
      });
      this.sync();
      const snapshot = this.simulation.getSnapshot();
      if (snapshot.matchWinner && !this.resultEmitted) {
        this.resultEmitted = true;
        bridge.emit(GameEvents.matchEnded, {
          winner: snapshot.matchWinner,
          wins: snapshot.wins,
        });
      }
    }

    private sync(deltaMs = 0) {
      const snapshot = this.simulation.getSnapshot();
      this.fighters.sync(snapshot, this.round.countdownLabel(snapshot));
      this.traps.sync(snapshot.traps);
      this.feedback.sync(snapshot, deltaMs);
    }

    private cleanup() {
      this.inputs.detach();
      this.fighters.destroy();
      this.traps.destroy();
      this.feedback.destroy();
      bridge.emit(GameEvents.destroyed, undefined);
    }
  };
}

function mapInput(
  mode: LocalTeamBattleConfig['battle']['mode'],
  input: ReturnType<InputManager['snapshot']>,
): TeamInputFrame {
  if (mode === 'TWO_PLAYERS_VS_AI') {
    return {
      LOCAL_PLAYER_1: input.player1,
      LOCAL_PLAYER_2: input.player2,
    };
  }
  if (mode === 'PLAYER_AND_AI_VS_TWO_OPPONENTS') {
    return { LOCAL_PLAYER_1: input.player1 };
  }
  return {
    LOCAL_PLAYER_1: input.player1,
    LOCAL_PLAYER_2: input.player2,
  };
}
