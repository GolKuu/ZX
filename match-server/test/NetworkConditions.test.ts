import { describe, expect, it } from 'vitest';
import { balanceConfig } from '../../src/game/config/balanceConfig.js';
import {
  ALL_ONLINE_ACTION_BITS,
  ONLINE_ACTION_BITS,
  parseGameplayInputPacket,
} from '../../src/game/network/InputCodec.js';
import type { GameplayInputPacket } from '../../src/game/network/protocol.js';
import { AuthoritativeMatch } from '../src/simulation/AuthoritativeMatch.js';
import { PlayerInputTimeline } from '../src/simulation/PlayerInputTimeline.js';

describe('network delay and packet loss', () => {
  it('applies input only after transport latency and configured input delay', () => {
    const timeline = new PlayerInputTimeline(3);
    const link = new LaggyLink<GameplayInputPacket>(5, () => false);
    link.send(packet(1, 0, 0, 1), 0);
    const seenMovement: number[] = [];

    for (let tick = 0; tick < 12; tick += 1) {
      link.deliver(tick).forEach((input) => timeline.enqueue(input, tick));
      if (timeline.frame(tick).held.includes('MOVE_RIGHT')) seenMovement.push(tick);
    }

    expect(seenMovement[0]).toBe(8);
    expect(timeline.lastProcessedSequence).toBe(1);
  });

  it('keeps authoritative positions valid with 100ms latency and 20% loss', () => {
    const first = new PlayerInputTimeline(3);
    const second = new PlayerInputTimeline(3);
    const match = new AuthoritativeMatch({ player1: 'granite', player2: 'shira' });
    const link = new LaggyLink<GameplayInputPacket>(6, (sequence) => sequence % 5 === 0);

    for (let networkTick = 0; networkTick < 720; networkTick += 1) {
      const moving = networkTick < 650 ? 1 : 0;
      const attacking = networkTick > 400 && networkTick % 30 < 6
        ? ONLINE_ACTION_BITS.LIGHT_ATTACK
        : 0;
      link.send(packet(networkTick + 1, networkTick, attacking, moving), networkTick);
      link.deliver(networkTick).forEach((input) => first.enqueue(input, match.tick));
      match.step({ player1: first, player2: second });
    }

    const state = match.snapshot;
    expect(state.tick).toBe(720);
    expect(state.fighters.player1.x).toBeGreaterThan(250);
    expect(state.fighters.player1.x).toBeGreaterThanOrEqual(balanceConfig.fighterRadius);
    expect(state.fighters.player1.x)
      .toBeLessThanOrEqual(balanceConfig.arenaWidth - balanceConfig.fighterRadius);
    expect(state.fighters.player2.health).toBeLessThan(state.fighters.player2.maxHealth);
    expect(state.fighters.player2.health).toBeGreaterThanOrEqual(0);
    expect(first.lastProcessedSequence).toBeGreaterThan(600);
  });

  it('rejects forged state fields and unknown action bits', () => {
    const valid = packet(1, 0, ALL_ONLINE_ACTION_BITS, 0);
    expect(parseGameplayInputPacket({ ...valid, x: 900 })).toMatchObject({ ok: false });
    expect(parseGameplayInputPacket({
      ...valid,
      actionBitmask: ALL_ONLINE_ACTION_BITS | (1 << 12),
    })).toMatchObject({ ok: false, reason: 'ACTION_BITMASK' });
  });
});

class LaggyLink<T extends { sequence: number }> {
  private queue: Array<{ deliveryTick: number; payload: T }> = [];

  constructor(
    private readonly latencyTicks: number,
    private readonly drops: (sequence: number) => boolean,
  ) {}

  send(payload: T, nowTick: number) {
    if (this.drops(payload.sequence)) return;
    this.queue.push({ deliveryTick: nowTick + this.latencyTicks, payload });
  }

  deliver(nowTick: number) {
    const due = this.queue
      .filter((item) => item.deliveryTick <= nowTick)
      .map((item) => item.payload);
    this.queue = this.queue.filter((item) => item.deliveryTick > nowTick);
    return due;
  }
}

function packet(
  sequence: number,
  tick: number,
  actionBitmask: number,
  direction: -1 | 0 | 1,
): GameplayInputPacket {
  return {
    matchId: 'a'.repeat(32),
    tick,
    sequence,
    actionBitmask,
    direction,
    acknowledgedTick: 0,
  };
}
