import { describe, expect, it } from 'vitest';
import { balanceConfig } from '../../src/game/config/balanceConfig.js';
import { PlayerInputTimeline } from '../src/simulation/PlayerInputTimeline.js';
import { AuthoritativeTeamMatch } from '../src/team/AuthoritativeTeamMatch.js';

describe('authoritative team match', () => {
  it('rejects team actions outside the active round', () => {
    const { match } = createMatch();
    expect(match.validateAction('player1', 'ASSIST')).toEqual({
      ok: false,
      reason: 'ROUND_NOT_ACTIVE',
    });
  });

  it('keeps simulating with deterministic AI during a disconnect takeover', () => {
    const { match, inputs } = createMatch();
    for (let tick = 0; tick < balanceConfig.countdownTicks; tick += 1) {
      match.step(inputs);
    }
    const before = match.snapshot;
    match.setAiTakeover('player2', true);
    for (let tick = 0; tick < 30; tick += 1) match.step(inputs);
    const after = match.snapshot;

    expect(after.tick).toBeGreaterThan(before.tick);
    expect(after.paused).toBe(false);
    expect(after.teamBattle.teams.player2.aiTakeover).toBe(true);
    expect(after.fighters.player2.x).toBeLessThan(before.fighters.player2.x);
    match.setAiTakeover('player2', false);
    expect(match.snapshot.teamBattle.teams.player2.aiTakeover).toBe(false);
  });
});

function createMatch() {
  const inputs = {
    player1: new PlayerInputTimeline(0),
    player2: new PlayerInputTimeline(0),
  };
  return {
    match: new AuthoritativeTeamMatch({ player1: 'granite', player2: 'shira' }),
    inputs,
  };
}
