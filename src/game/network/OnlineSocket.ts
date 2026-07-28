import type {
  ClientControlMessage,
  RoomCredentials,
  ServerMessage,
} from './protocol';
import { matchServerSocketUrl } from './matchServerUrl';

export type OnlineConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected';

type SocketCallbacks = {
  onMessage: (message: ServerMessage) => void;
  onStatus: (status: OnlineConnectionStatus) => void;
};

const RECONNECT_WINDOW_MS = 30_000;

export class OnlineSocket {
  private socket: WebSocket | null = null;
  private retryTimer: number | null = null;
  private reconnectStartedAt = 0;
  private retryAttempt = 0;
  private permanentlyClosed = false;

  constructor(
    private readonly credentials: RoomCredentials,
    private readonly callbacks: SocketCallbacks,
  ) {}

  connect() {
    if (this.socket || this.permanentlyClosed) return;
    this.callbacks.onStatus(this.retryAttempt > 0 ? 'reconnecting' : 'connecting');
    const socket = new WebSocket(matchServerSocketUrl(
      this.credentials.matchId,
      this.credentials.playerToken,
    ));
    this.socket = socket;
    socket.addEventListener('open', () => {
      this.retryAttempt = 0;
      this.reconnectStartedAt = 0;
      this.callbacks.onStatus('connected');
    });
    socket.addEventListener('message', (event) => {
      const message = parseServerMessage(event.data);
      if (message) this.callbacks.onMessage(message);
    });
    socket.addEventListener('close', () => {
      if (this.socket !== socket) return;
      this.socket = null;
      if (this.permanentlyClosed) {
        this.callbacks.onStatus('disconnected');
        return;
      }
      this.scheduleReconnect();
    });
    socket.addEventListener('error', () => socket.close());
  }

  send(message: ClientControlMessage) {
    if (this.socket?.readyState !== WebSocket.OPEN) return false;
    this.socket.send(JSON.stringify(message));
    return true;
  }

  close() {
    this.permanentlyClosed = true;
    if (this.retryTimer !== null) window.clearTimeout(this.retryTimer);
    this.retryTimer = null;
    this.socket?.close(1000, 'Client left');
    this.socket = null;
    this.callbacks.onStatus('disconnected');
  }

  private scheduleReconnect() {
    const now = Date.now();
    if (this.reconnectStartedAt === 0) this.reconnectStartedAt = now;
    if (now - this.reconnectStartedAt >= RECONNECT_WINDOW_MS) {
      this.callbacks.onStatus('disconnected');
      return;
    }
    this.retryAttempt += 1;
    this.callbacks.onStatus('reconnecting');
    const delay = Math.min(4_000, 400 * 2 ** Math.min(this.retryAttempt, 4));
    this.retryTimer = window.setTimeout(() => {
      this.retryTimer = null;
      this.connect();
    }, delay);
  }
}

function parseServerMessage(value: unknown): ServerMessage | null {
  if (typeof value !== 'string') return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      parsed &&
      typeof parsed === 'object' &&
      'type' in parsed &&
      typeof parsed.type === 'string'
    ) return parsed as ServerMessage;
  } catch {
    return null;
  }
  return null;
}
