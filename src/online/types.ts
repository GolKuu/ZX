import type { ArenaId } from '@/src/data/arenas';
import type { CharacterId } from '@/src/data/characterRoster';
import type { HudSnapshot } from '@/src/hud/types';
import type { FighterInput, WorldSnapshot } from '@/src/sim';

export type OnlineRole = 'host' | 'guest';
export type OnlineStatus = 'idle' | 'matching' | 'connecting' | 'lobby' | 'fight' | 'error';
/** How the session started: 'quick' is matchmaking, 'room' is a private six-digit code. */
export type OnlineOrigin = 'quick' | 'room';

export interface OnlineLobby {
  readonly hostFighter: CharacterId;
  readonly guestFighter: CharacterId;
  readonly arenaId: ArenaId;
  readonly hostReady: boolean;
  readonly guestReady: boolean;
  readonly phase: 'lobby' | 'fight';
}

export interface OnlineSnapshot {
  readonly status: OnlineStatus;
  readonly code: string;
  readonly role: OnlineRole | null;
  readonly peerConnected: boolean;
  readonly lobby: OnlineLobby;
  readonly error: string | null;
  readonly origin: OnlineOrigin | null;
  /** Identifies the current fight so one win is only ever paid once. */
  readonly matchId: string | null;
}

export type FramePacket = { readonly world: WorldSnapshot; readonly hud: HudSnapshot };
export type InputPacket = { readonly sequence: number; readonly input: FighterInput };

export const EMPTY_LOBBY: OnlineLobby = {
  hostFighter: 'mim',
  guestFighter: 'glitch',
  arenaId: 'null-circle',
  hostReady: false,
  guestReady: false,
  phase: 'lobby',
};
