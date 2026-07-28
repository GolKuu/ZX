import type { PlayerInputFrame, SimulationSnapshot } from '../core/types';
import { encodePlayerInput } from './InputCodec';
import {
  type OnlineConnectionStatus,
  OnlineSocket,
} from './OnlineSocket';
import { PredictionEngine } from './PredictionEngine';
import type {
  OnlineRoomView,
  RoomCredentials,
  ServerMessage,
} from './protocol';
import { SnapshotInterpolator } from './SnapshotInterpolator';

export class OnlineMatchClient {
  private readonly socket: OnlineSocket;
  private readonly prediction: PredictionEngine;
  private readonly interpolation = new SnapshotInterpolator();
  private readonly listeners = new Set<() => void>();
  private pingTimer: number | null = null;
  private sequence = 0;
  private localTick = 0;
  private serverTick = 0;
  private roomState: OnlineRoomView | null = null;
  private connectionState: OnlineConnectionStatus = 'connecting';
  private pingValue: number | null = null;
  private errorValue = '';

  constructor(readonly credentials: RoomCredentials) {
    this.prediction = new PredictionEngine(credentials.playerId);
    this.socket = new OnlineSocket(credentials, {
      onMessage: (message) => this.onMessage(message),
      onStatus: (status) => this.onStatus(status),
    });
  }

  connect() {
    this.socket.connect();
    if (this.pingTimer === null) {
      this.pingTimer = window.setInterval(() => {
        this.socket.send({ type: 'ping', clientTime: performance.now() });
      }, 2_000);
    }
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  selectCharacter(characterId: string) {
    this.socket.send({ type: 'selectCharacter', characterId });
  }

  setReady(ready: boolean) {
    this.socket.send({ type: 'setReady', ready });
  }

  requestRematch(ready: boolean) {
    this.socket.send({ type: 'rematch', ready });
  }

  submitInput(frame: PlayerInputFrame) {
    const raw = encodePlayerInput(frame);
    this.sequence += 1;
    const tick = Math.max(this.localTick, this.serverTick);
    this.localTick = tick + 1;
    const packet = {
      matchId: this.credentials.matchId,
      tick,
      sequence: this.sequence,
      actionBitmask: raw.actionBitmask,
      direction: raw.direction,
      acknowledgedTick: this.serverTick,
    } as const;
    this.socket.send({ type: 'input', payload: packet });
    this.prediction.predict(this.sequence, frame);
    this.emit();
  }

  renderSnapshot(now = performance.now()): SimulationSnapshot | null {
    return this.prediction.render(this.interpolation.sample(now));
  }

  destroy() {
    if (this.pingTimer !== null) window.clearInterval(this.pingTimer);
    this.pingTimer = null;
    this.socket.send({ type: 'leave' });
    this.socket.close();
    this.listeners.clear();
  }

  get room() {
    return this.roomState;
  }

  get connectionStatus() {
    return this.connectionState;
  }

  get pingMs() {
    return this.pingValue;
  }

  get error() {
    return this.errorValue;
  }

  private onMessage(message: ServerMessage) {
    if (message.type === 'connected' || message.type === 'roomState') {
      this.roomState = message.room;
    } else if (message.type === 'snapshot') {
      this.serverTick = message.serverTick;
      this.localTick = Math.max(this.localTick, message.serverTick);
      this.interpolation.add(message.snapshot);
      this.prediction.reconcile(
        message.snapshot,
        message.processedSequences[this.credentials.playerId],
      );
    } else if (message.type === 'pong') {
      this.pingValue = Math.max(0, Math.round(performance.now() - message.clientTime));
    } else if (message.type === 'error') {
      this.errorValue = `${message.code}: ${message.message}`;
    }
    this.emit();
  }

  private onStatus(status: OnlineConnectionStatus) {
    this.connectionState = status;
    this.emit();
  }

  private emit() {
    this.listeners.forEach((listener) => listener());
  }
}
