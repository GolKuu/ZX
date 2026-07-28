import { FIXED_STEP_SECONDS } from '../config/balanceConfig';
import { CombatSimulation } from '../core/CombatSimulation';
import type {
  PlayerId,
  PlayerInputFrame,
  SimulationSnapshot,
} from '../core/types';
import { TeamActionValidator } from './TeamActionValidator';
import { TeamAiController } from './TeamAiController';
import { TeamAssistSystem } from './TeamAssistSystem';
import { TeamRoster } from './TeamRoster';
import { createTeamBattleState } from './TeamStateFactory';
import { cloneTeamBattle } from './TeamSnapshotUtils';
import {
  TEAM_ACTIONS,
  type TeamAction,
  type TeamActionValidation,
  type TeamBattleConfig,
  type TeamInputFrame,
  type TeamSimulationSnapshot,
} from './TeamTypes';

const TEAM_IDS: readonly PlayerId[] = ['player1', 'player2'];
const EMPTY_INPUT: PlayerInputFrame = { held: [], pressed: [], released: [] };

export class TeamCombatSimulation {
  private core: CombatSimulation;
  private battle;
  private readonly actions = new TeamActionValidator();
  private readonly ai = new TeamAiController();
  private readonly assists = new TeamAssistSystem();
  private readonly roster = new TeamRoster();

  constructor(private readonly config: TeamBattleConfig) {
    this.battle = createTeamBattleState(config);
    this.core = this.createCore();
  }

  step(input: TeamInputFrame, stepSeconds = FIXED_STEP_SECONDS) {
    const before = this.getSnapshot();
    if (before.paused || before.roundPhase === 'MATCH_OVER' || before.hitStopTicks > 0) {
      this.core.step(emptySideInput(), stepSeconds);
      return;
    }
    const sideInput = this.resolveInputs(input, before);
    if (before.roundPhase === 'ACTIVE') this.applyActions(sideInput);
    this.core.step(sideInput, stepSeconds);
    if (before.roundPhase !== 'ACTIVE') return;

    this.core.updateState((state) => {
      this.assists.tick(state, this.battle, sideInput);
      TEAM_IDS.forEach((teamId) => this.roster.syncActive(this.battle, state, teamId));
      this.replaceKnockedOutFighters(state);
      this.roster.tick(this.battle, state);
      this.finishMatchIfNeeded(state);
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

  private resolveInputs(
    input: TeamInputFrame,
    snapshot: TeamSimulationSnapshot,
  ): Record<PlayerId, PlayerInputFrame> {
    return {
      player1: this.inputFor('player1', input, snapshot),
      player2: this.inputFor('player2', input, snapshot),
    };
  }

  private inputFor(
    teamId: PlayerId,
    input: TeamInputFrame,
    snapshot: TeamSimulationSnapshot,
  ) {
    const team = snapshot.teamBattle.teams[teamId];
    const controller = team.aiTakeover
      ? 'AI'
      : team.members[team.activeMember].controller;
    return controller === 'AI'
      ? this.ai.frame(teamId, snapshot)
      : input[controller] ?? EMPTY_INPUT;
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

  private replaceKnockedOutFighters(state: SimulationSnapshot) {
    TEAM_IDS.forEach((teamId) => {
      const team = this.battle.teams[teamId];
      if (!team.members[team.activeMember].defeated) return;
      if (team.assist) team.assist = null;
      this.roster.switch(this.battle, state, teamId, true);
    });
  }

  private finishMatchIfNeeded(state: SimulationSnapshot) {
    const firstOut = this.roster.isEliminated(this.battle, 'player1');
    const secondOut = this.roster.isEliminated(this.battle, 'player2');
    let winner: PlayerId | null = firstOut === secondOut
      ? null
      : firstOut ? 'player2' : 'player1';
    if (!firstOut && !secondOut && state.roundTicksRemaining === 0) {
      const firstHealth = this.roster.combinedHealth(this.battle, 'player1');
      const secondHealth = this.roster.combinedHealth(this.battle, 'player2');
      winner = firstHealth === secondHealth
        ? null
        : firstHealth > secondHealth ? 'player1' : 'player2';
    }
    if (!winner && !firstOut && !secondOut && state.roundTicksRemaining > 0) return;
    this.battle.winner = winner;
    state.roundWinner = winner;
    state.matchWinner = winner;
    if (winner) state.wins[winner] = 1;
    state.roundPhase = 'MATCH_OVER';
  }
}

function emptySideInput(): Record<PlayerId, PlayerInputFrame> {
  return { player1: EMPTY_INPUT, player2: EMPTY_INPUT };
}
