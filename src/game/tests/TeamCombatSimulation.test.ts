import { describe, expect, it } from 'vitest';
import type { CombatAction, PlayerInputFrame } from '../core/types';
import { TeamCombatSimulation } from '../team/TeamCombatSimulation';
import { createTeamBattleConfig } from '../team/TeamModeFactory';
import type { TeamController, TeamMode } from '../team/TeamTypes';

const EMPTY: PlayerInputFrame = { held: [], pressed: [], released: [] };

describe('team combat simulation', () => {
  it('defines all four ownership modes', () => {
    expect(config('LOCAL_2V2').controllers).toEqual({
      player1: ['LOCAL_PLAYER_1', 'LOCAL_PLAYER_1'],
      player2: ['LOCAL_PLAYER_2', 'LOCAL_PLAYER_2'],
    });
    expect(config('TWO_PLAYERS_VS_AI').controllers.player1).toEqual([
      'LOCAL_PLAYER_1',
      'LOCAL_PLAYER_2',
    ]);
    expect(config('PLAYER_AND_AI_VS_TWO_OPPONENTS').controllers).toEqual({
      player1: ['LOCAL_PLAYER_1', 'AI'],
      player2: ['AI', 'AI'],
    });
    expect(config('ONLINE_2V2').controllers.player2).toEqual([
      'ONLINE_PLAYER_2',
      'ONLINE_PLAYER_2',
    ]);
  });

  it('switches only to a living partner, keeps health and enforces cooldown', () => {
    const simulation = activeSimulation();
    const prepared = simulation.getSnapshot();
    prepared.fighters.player1.health = 41;
    prepared.teamBattle.teams.player1.members[1].fighter.health = 63;
    simulation.restore(prepared);

    simulation.step(pressed('ONLINE_PLAYER_1', 'TAG_SWITCH'));
    let snapshot = simulation.getSnapshot();
    expect(snapshot.teamBattle.teams.player1.activeMember).toBe(1);
    expect(snapshot.fighters.player1.health).toBe(63);
    expect(snapshot.teamBattle.teams.player1.members[0].fighter.health).toBe(41);
    expect(snapshot.teamBattle.teams.player1.tagCooldownTicks).toBeGreaterThan(0);

    simulation.step(pressed('ONLINE_PLAYER_1', 'TAG_SWITCH'));
    snapshot = simulation.getSnapshot();
    expect(snapshot.teamBattle.teams.player1.activeMember).toBe(1);
    expect(snapshot.fighters.player1.health).toBe(63);
  });

  it('permits only one assist extension per combo', () => {
    const simulation = activeSimulation();
    const prepared = simulation.getSnapshot();
    prepared.fighters.player1.x = 300;
    prepared.fighters.player1.y = 220;
    prepared.fighters.player1.grounded = false;
    prepared.fighters.player2.x = 310;
    simulation.restore(prepared);
    simulation.step(pressed('ONLINE_PLAYER_1', 'ASSIST'));
    for (let tick = 0; tick < 6; tick += 1) simulation.step({});

    const snapshot = simulation.getSnapshot();
    expect(snapshot.teamBattle.teams.player1.assist).not.toBeNull();
    expect(snapshot.combos.player1.hits).toBeGreaterThan(0);
    expect(snapshot.teamBattle.teams.player1.assistComboLocked).toBe(true);
    expect(simulation.validateAction('player1', 'ASSIST')).toMatchObject({
      ok: false,
    });
  });

  it('lets an opponent hit the called helper', () => {
    const simulation = activeSimulation();
    const prepared = simulation.getSnapshot();
    prepared.fighters.player1.x = 300;
    prepared.fighters.player1.y = 220;
    prepared.fighters.player1.grounded = false;
    prepared.fighters.player1.mode = 'hitstun';
    prepared.fighters.player1.modeTicksRemaining = 20;
    prepared.fighters.player2.x = 310;
    simulation.restore(prepared);

    simulation.step({
      ONLINE_PLAYER_1: actionFrame('BURST_ASSIST'),
      ONLINE_PLAYER_2: actionFrame('LIGHT_ATTACK'),
    });
    for (let tick = 0; tick < 12; tick += 1) {
      simulation.step({
        ONLINE_PLAYER_1: EMPTY,
        ONLINE_PLAYER_2: EMPTY,
      });
    }
    const partner = simulation.getSnapshot()
      .teamBattle.teams.player1.members[1];
    expect(partner.fighter.health).toBeLessThan(partner.fighter.maxHealth);
  });

  it('uses BURST_ASSIST once to break pressure without extending a combo', () => {
    const simulation = activeSimulation();
    const prepared = simulation.getSnapshot();
    prepared.fighters.player1.mode = 'hitstun';
    prepared.fighters.player1.modeTicksRemaining = 20;
    prepared.combos.player2.hits = 3;
    prepared.combos.player2.targetId = 'player1';
    prepared.combos.player2.remainingTicks = 30;
    const opponentHealth = prepared.fighters.player2.health;
    simulation.restore(prepared);

    simulation.step(pressed('ONLINE_PLAYER_1', 'BURST_ASSIST'));
    const snapshot = simulation.getSnapshot();
    expect(snapshot.fighters.player1.mode).not.toBe('hitstun');
    expect(snapshot.fighters.player2.health).toBe(opponentHealth - 6);
    expect(snapshot.combos.player2.hits).toBe(0);
    expect(snapshot.teamBattle.teams.player1.burstAssistAvailable).toBe(false);
    expect(simulation.validateAction('player1', 'BURST_ASSIST')).toMatchObject({
      ok: false,
      reason: 'ASSIST_ACTIVE',
    });
  });

  it('continues after the first knockout and loses only after both fighters fall', () => {
    const simulation = activeSimulation();
    const firstKnockout = simulation.getSnapshot();
    firstKnockout.fighters.player1.health = 0;
    simulation.restore(firstKnockout);
    simulation.step({});

    const snapshot = simulation.getSnapshot();
    expect(snapshot.teamBattle.teams.player1.activeMember).toBe(1);
    expect(snapshot.matchWinner).toBeNull();

    snapshot.fighters.player1.health = 0;
    simulation.restore(snapshot);
    simulation.step({});
    expect(simulation.getSnapshot().matchWinner).toBe('player2');
  });
});

function config(mode: TeamMode) {
  return createTeamBattleConfig(mode);
}

function activeSimulation() {
  const simulation = new TeamCombatSimulation(config('ONLINE_2V2'));
  const snapshot = simulation.getSnapshot();
  snapshot.roundPhase = 'ACTIVE';
  snapshot.phaseTicksRemaining = 0;
  simulation.restore(snapshot);
  return simulation;
}

function pressed(controller: TeamController, action: CombatAction) {
  return { [controller]: actionFrame(action) };
}

function actionFrame(action: CombatAction): PlayerInputFrame {
  return { held: [action], pressed: [action], released: [] };
}
