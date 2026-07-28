import type { WebSocket } from 'ws';
import { describe, expect, it } from 'vitest';
import type { ServerMessage } from '../../src/game/network/protocol.js';
import { MatchRoom } from '../src/rooms/MatchRoom.js';

describe('private room lifecycle', () => {
  it('starts after both players are ready, reconnects and rematches', () => {
    let now = 1_000;
    const room = new MatchRoom({
      matchId: 'b'.repeat(32),
      roomCode: 'ROOM2345',
      inputDelayTicks: 3,
      reconnectGraceMs: 30_000,
      clock: { now: () => now },
    });
    room.addPlayer('player1', 'host-token');
    room.addPlayer('player2', 'guest-token');
    const host = socketStub();
    const guest = socketStub();
    room.connect('player1', asSocket(host));
    room.connect('player2', asSocket(guest));
    room.handle('player1', { type: 'selectCharacter', characterId: 'volt' });
    room.handle('player2', { type: 'selectCharacter', characterId: 'fenr' });
    room.handle('player1', { type: 'setReady', ready: true });
    room.handle('player2', { type: 'setReady', ready: true });

    expect(room.view.status).toBe('playing');
    expect(room.snapshot?.fighters.player1.characterId).toBe('volt');
    expect(room.snapshot?.fighters.player2.characterId).toBe('fenr');

    room.disconnect('player2', asSocket(guest));
    expect(room.view.status).toBe('disconnected');
    now += 30_001;
    room.tick();
    expect(room.view.status).toBe('finished');
    expect(room.snapshot?.matchWinner).toBe('player1');

    const reconnectedGuest = socketStub();
    room.connect('player2', asSocket(reconnectedGuest));
    room.handle('player1', { type: 'rematch', ready: true });
    room.handle('player2', { type: 'rematch', ready: true });
    expect(room.view.status).toBe('playing');
    expect(room.snapshot?.matchWinner).toBeNull();
  });

  it('never trusts an invalid character selection', () => {
    const room = new MatchRoom({
      matchId: 'c'.repeat(32),
      roomCode: 'SAFE2345',
      inputDelayTicks: 3,
      reconnectGraceMs: 30_000,
    });
    room.addPlayer('player1', 'token');
    room.handle('player1', { type: 'selectCharacter', characterId: '../../admin' });
    expect(room.view.players.player1?.characterId).toBe('granite');
  });
});

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
