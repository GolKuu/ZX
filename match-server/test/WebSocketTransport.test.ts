import { once } from 'node:events';
import { WebSocket } from 'ws';
import { describe, expect, it } from 'vitest';
import type {
  RoomCredentials,
  ServerMessage,
} from '../../src/game/network/protocol.js';
import { buildServer } from '../src/app.js';

describe('WebSocket transport', () => {
  it('starts a room and resumes it with the reconnect token', async () => {
    const { app } = await buildServer({
      host: '127.0.0.1',
      port: 0,
      clientOrigins: ['http://localhost:5173'],
      inputDelayTicks: 3,
      reconnectGraceMs: 30_000,
    });
    await app.listen({ host: '127.0.0.1', port: 0 });
    const address = app.server.address();
    if (!address || typeof address === 'string') throw new Error('NO_TEST_PORT');
    const host = await credentials(app, '/rooms');
    const guest = await credentials(app, `/rooms/${host.roomCode}/join`);
    const hostSocket = openSocket(address.port, host);
    const guestSocket = openSocket(address.port, guest);
    const hostInbox = new MessageInbox(hostSocket);
    const guestInbox = new MessageInbox(guestSocket);

    try {
      await Promise.all([once(hostSocket, 'open'), once(guestSocket, 'open')]);
      await Promise.all([
        hostInbox.next((message) => message.type === 'connected'),
        guestInbox.next((message) => message.type === 'connected'),
      ]);
      hostSocket.send(JSON.stringify({ type: 'setReady', ready: true }));
      guestSocket.send(JSON.stringify({ type: 'setReady', ready: true }));
      const playing = await hostInbox.next(
        (message) => message.type === 'roomState' && message.room.status === 'playing',
      );
      expect(playing.type).toBe('roomState');
      await hostInbox.next((message) => message.type === 'snapshot');

      guestSocket.close();
      await guestInbox.closed();
      await hostInbox.next(
        (message) => message.type === 'roomState' && message.room.status === 'disconnected',
      );

      const replacement = openSocket(address.port, guest);
      const replacementInbox = new MessageInbox(replacement);
      await once(replacement, 'open');
      const resumed = await replacementInbox.next(
        (message) => message.type === 'connected',
      );
      expect(resumed.type === 'connected' && resumed.room.status).toBe('playing');
      replacement.close();
      await replacementInbox.closed();
    } finally {
      hostSocket.close();
      if (guestSocket.readyState !== WebSocket.CLOSED) guestSocket.close();
      await Promise.allSettled([hostInbox.closed(), guestInbox.closed()]);
      await app.close();
    }
  });
});

async function credentials(
  app: Awaited<ReturnType<typeof buildServer>>['app'],
  url: string,
) {
  const response = await app.inject({ method: 'POST', url, payload: {} });
  return response.json() as RoomCredentials;
}

function openSocket(port: number, credentials: RoomCredentials) {
  const query = new URLSearchParams({
    matchId: credentials.matchId,
    token: credentials.playerToken,
  });
  return new WebSocket(`ws://127.0.0.1:${port}/ws?${query}`, {
    headers: { origin: 'http://localhost:5173' },
  });
}

class MessageInbox {
  private readonly messages: ServerMessage[] = [];
  private readonly waiters = new Set<() => void>();

  constructor(private readonly socket: WebSocket) {
    socket.on('message', (raw) => {
      this.messages.push(JSON.parse(raw.toString()) as ServerMessage);
      this.waiters.forEach((wake) => wake());
    });
  }

  async next(predicate: (message: ServerMessage) => boolean) {
    const deadline = Date.now() + 2_000;
    while (Date.now() < deadline) {
      const index = this.messages.findIndex(predicate);
      if (index >= 0) return this.messages.splice(index, 1)[0];
      await new Promise<void>((resolve) => {
        const timer = setTimeout(() => {
          this.waiters.delete(wake);
          resolve();
        }, 20);
        const wake = () => {
          clearTimeout(timer);
          this.waiters.delete(wake);
          resolve();
        };
        this.waiters.add(wake);
      });
    }
    throw new Error('MESSAGE_TIMEOUT');
  }

  async closed() {
    if (this.socket.readyState === WebSocket.CLOSED) return;
    await once(this.socket, 'close');
  }
}
