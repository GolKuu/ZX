import type { PlayerId } from '../core/types';
import type { TeamSimulationSnapshot } from '../team/TeamTypes';

export const NETWORK_PROTOCOL_VERSION = 2;
export const DEFAULT_INPUT_DELAY_TICKS = 3;
export const SNAPSHOT_INTERVAL_TICKS = 3;
export const INTERPOLATION_DELAY_TICKS = 6;

export type GameplayInputPacket = {
  matchId: string;
  tick: number;
  sequence: number;
  actionBitmask: number;
  direction: -1 | 0 | 1;
  acknowledgedTick: number;
};

export type OnlineRoomStatus =
  | 'waiting'
  | 'lobby'
  | 'playing'
  | 'disconnected'
  | 'finished';

export type OnlinePlayerView = {
  playerId: PlayerId;
  connected: boolean;
  ready: boolean;
  characterId: string;
  pingMs: number | null;
  rematchReady: boolean;
};

export type OnlineRoomView = {
  matchId: string;
  roomCode: string;
  status: OnlineRoomStatus;
  players: Partial<Record<PlayerId, OnlinePlayerView>>;
  inputDelayTicks: number;
  reconnectGraceMs: number;
};

export type RoomCredentials = {
  matchId: string;
  roomCode: string;
  playerId: PlayerId;
  playerToken: string;
};

export type ClientControlMessage =
  | { type: 'selectCharacter'; characterId: string }
  | { type: 'setReady'; ready: boolean }
  | { type: 'ping'; clientTime: number }
  | { type: 'rematch'; ready: boolean }
  | { type: 'leave' }
  | { type: 'input'; payload: GameplayInputPacket };

export type ServerMessage =
  | {
      type: 'connected';
      protocolVersion: number;
      playerId: PlayerId;
      room: OnlineRoomView;
    }
  | { type: 'roomState'; room: OnlineRoomView }
  | {
      type: 'snapshot';
      matchId: string;
      serverTick: number;
      snapshot: TeamSimulationSnapshot;
      processedSequences: Record<PlayerId, number>;
    }
  | { type: 'pong'; clientTime: number; serverTime: number }
  | { type: 'error'; code: string; message: string };

export type RoomApiError = {
  code: string;
  message: string;
};
