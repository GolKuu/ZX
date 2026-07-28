import { FIXED_STEP_SECONDS } from '../config/balanceConfig';
import { CombatSimulation } from '../core/CombatSimulation';
import type {
  PlayerId,
  PlayerInputFrame,
} from '../core/types';
import { TeamActionValidator } from './TeamActionValidator';
import { TeamAssistSystem } from './TeamAssistSystem';
import { TeamInputResolver } from './TeamInputResolver';
import { TeamMatchResolver } from './TeamMatchResolver';
import { TeamRoster } from './TeamRoster';
import { createTeamBattleState } from './TeamStateFactory';
import { cloneTeamBattle } from './TeamSnapshotUtils';
import {
  TEAM_ACTIONS,
  type TeamAction,
  type TeamActionValidation,
  type TeamBattleConfig,
  type TeamBattleSnapshot,
  type TeamInputFrame,
  type TeamSimulationSnapshot,
} from './TeamTypes';

const TEAM_IDS: readonly PlayerId[] = ['player1', 'player2'];
const EMPTY_INPUT: PlayerInputFrame = { held: [], pressed: [], released: [] };

export class TeamCombatSimulation {
  private core: CombatSimulation;
  private battle: TeamBattleSnapshot;
  private readonly actions = new TeamActionValidator();
  private readonly assists = new TeamAssistSystem();
  private readonly inputs = new TeamInputResolver();
  private readonly roster = new TeamRoster();
  private readonly match = new TeamMatchResolver(this.roster);

  constructor(private readonly config: TeamBattleConfig) {
    this.battle = createTeamBattleState(config);
    this.core = this.createCore();
  }

  step(input: TeamInputFrame, stepSeconds = FIXED_STEP_SECONDS) {
    const before = this.getSnapshot();
    if (before.paused || before.roundPhase === 'MATCH_OVER' || before.hitStopTicks > 0) {
      this.core.step(this.inputs.empty(), stepSeconds);
      return;
    }
    const sideInput = this.inputs.resolve(input, before);
    if (before.roundPhase === 'ACTIVE') this.applyActions(sideInput);
    this.core.step(sideInput, stepSeconds);
    if (before.roundPhase !== 'ACTIVE') return;

    this.core.updateState((state) => {
      this.assists.tick(state, this.battle, sideInput);
      this.match.update(state, this.battle);
    });
  }

  validateAction(teamId: PlayerId, action: TeamAction): TeamActionValidation {
    return this.actions.validate(action, teamId, this.core.getSnapshot(), this.battle);
  }

  setAiTakeover(teamId: PlayerId, active: boolean) {
    this.battle.teams[teamId].aiTakeover = active;
  }

  setPaused(paused: boolean) {
    this.core.setPaused(paused);
  }

  rematch() {
    this.battle = createTeamBattleState(this.config);
    this.core = this.createCore();
  }

  restore(snapshot: TeamSimulationSnapshot) {
    this.battle = cloneTeamBattle(snapshot.teamBattle);
    this.core.restore(snapshot);
  }

  getSnapshot(): TeamSimulationSnapshot {
    return {
      ...this.core.getSnapshot(),
      teamBattle: cloneTeamBattle(this.battle),
    };
  }

  private createCore() {
    return new CombatSimulation(
      {
        player1: this.config.rosters.player1[0],
        player2: this.config.rosters.player2[0],
      },
      { deferRoundResolution: true },
    );
  }

  private applyActions(input: Record<PlayerId, PlayerInputFrame>) {
    TEAM_IDS.forEach((teamId) => {
      for (const action of TEAM_ACTIONS) {
        if (!input[teamId].pressed.includes(action)) continue;
        const validation = this.validateAction(teamId, action);
        if (!validation.ok) continue;
        this.core.updateState((state) => {
          if (action === 'TAG_SWITCH') {
            this.roster.switch(this.battle, state, teamId);
            input[teamId] = EMPTY_INPUT;
          } else {
            this.assists.start(action, teamId, state, this.battle);
          }
        });
        break;
      }
    });
  }
}
