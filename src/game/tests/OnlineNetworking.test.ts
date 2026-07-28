import { describe, expect, it } from 'vitest';
import { CombatSimulation } from '../core/CombatSimulation';
import type { PlayerInputFrame } from '../core/types';
import {
  decodeNetworkInput,
  encodePlayerInput,
  ONLINE_ACTION_BITS,
} from '../network/InputCodec';
import { PredictionEngine } from '../network/PredictionEngine';
import { SnapshotInterpolator } from '../network/SnapshotInterpolator';

describe('online client networking', () => {
  it('encodes only raw actions and derives trustworthy input edges', () => {
    const held: PlayerInputFrame = {
      held: ['MOVE_RIGHT', 'LIGHT_ATTACK', 'DEFENSE'],
      pressed: ['LIGHT_ATTACK'],
      released: [],
    };
    const encoded = encodePlayerInput(held);
    expect(encoded).toEqual({
      direction: 1,
      actionBitmask: ONLINE_ACTION_BITS.LIGHT_ATTACK | ONLINE_ACTION_BITS.DEFENSE,
    });
    const decoded = decodeNetworkInput(
      encoded,
      { direction: 0, actionBitmask: 0 },
    );
    expect(decoded.pressed).toEqual(['MOVE_RIGHT', 'LIGHT_ATTACK', 'DEFENSE']);
    expect(decodeNetworkInput(encoded, encoded).pressed).toEqual([]);
  });

  it('reconciles prediction to the acknowledged authoritative state', () => {
    const simulation = new CombatSimulation();
    const authoritative = simulation.getSnapshot();
    authoritative.roundPhase = 'ACTIVE';
    authoritative.phaseTicksRemaining = 0;
    const engine = new PredictionEngine('player1');
    engine.reconcile(authoritative, 0);
    engine.predict(1, frame(['MOVE_RIGHT']));
    expect(engine.render(null)!.fighters.player1.x)
      .toBeGreaterThan(authoritative.fighters.player1.x);

    const confirmed = structuredClone(authoritative);
    confirmed.tick += 1;
    confirmed.fighters.player1.x = 254;
    engine.reconcile(confirmed, 1);
    expect(engine.render(null)!.fighters.player1.x).toBe(254);
  });

  it('interpolates remote movement behind the latest server tick', () => {
    const simulation = new CombatSimulation();
    const first = simulation.getSnapshot();
    const second = structuredClone(first);
    first.tick = 0;
    second.tick = 12;
    first.fighters.player2.x = 600;
    second.fighters.player2.x = 720;
    const interpolation = new SnapshotInterpolator();
    interpolation.add(first, 0);
    interpolation.add(second, 200);
    const sampled = interpolation.sample(200)!;
    expect(sampled.fighters.player2.x).toBeCloseTo(660);
  });
});

function frame(held: PlayerInputFrame['held']): PlayerInputFrame {
  return { held, pressed: held, released: [] };
}
