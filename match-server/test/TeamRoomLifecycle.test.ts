import type { WebSocket } from 'ws';
import { describe, expect, it } from 'vitest';
import { ONLINE_ACTION_BITS } from '../../src/game/network/InputCodec.js';
import type { ServerMessage } from '../../src/game/network/protocol.js';
import { TeamMatchRoom } from '../src/team/TeamMatchRoom.js';

describe('online team room', () => {
  it('validates team actions and replaces a disconnected player with AI', () => {
    const room = createRoom();
    const host = socketStub();
    const guest = socketStub();
    room.connect('player1', asSocket(host));
    room.connect('player2', asSocket(guest));
    room.handle('player1', { type: 'setReady', ready: true });
    room.handle('player2', { type: 'setReady', ready: true });

    room.handle('player1', {
      type: 'input',
      payload: {
        matchId: room.matchId,
        tick: 0,
        sequence: 1,
        actionBitmask: ONLINE_ACTION_BITS.ASSIST,
        direction: 0,
        acknowledgedTick: 0,
      },
    });
    expect(host.sent.at(-1)).toMatchObject({
      type: 'error',
      code: 'ROUND_NOT_ACTIVE',
    });

    const tickBeforeDisconnect = room.snapshot!.tick;
    room.disconnect('player2', asSocket(guest));
    room.tick();
    expect(room.status).toBe('disconnected');
    expect(room.snapshot!.tick).toBeGreaterThan(tickBeforeDisconnect);
    expect(room.snapshot!.teamBattle.teams.player2.aiTakeover).toBe(true);

    const reconnected = socketStub();
    room.connect('player2', asSocket(reconnected));
    expect(room.status).toBe('playing');
    expect(room.snapshot!.teamBattle.teams.player2.aiTakeover).toBe(false);
  });
});

function createRoom() {
  const room = new TeamMatchRoom({
    matchId: 'd'.repeat(32),
    roomCode: 'TEAM2345',
    inputDelayTicks: 0,
    reconnectGraceMs: 30_000,
  });
  room.addPlayer('player1', 'host-token');
  room.addPlayer('player2', 'guest-token');
  return room;
}

type SocketStub = {
  readyState: number;
  sent: ServerMessage[];
  send: (payload: string) => void;
  close: () => void;
  ping: () => void;
};

function socketStub(): SocketStub {
  return {
    readyState: 1,
    sent: [],
    send(payload) {
      this.sent.push(JSON.parse(payload) as ServerMessage);
    },
    close() {
      this.readyState = 3;
    },
    ping() {
      return;
    },
  };
}

function asSocket(socket: SocketStub) {
  return socket as unknown as WebSocket;
}
