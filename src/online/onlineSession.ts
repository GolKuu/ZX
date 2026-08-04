import type { RealtimeChannel } from '@supabase/supabase-js';
import type { CharacterSelection } from '@/src/data/characterRoster';
import type { HudSnapshot } from '@/src/hud/types';
import type { FighterInput, WorldSnapshot } from '@/src/sim';
import type { MatchResult } from '@/src/store/hudStore';
import { getSupabaseClient } from '@/src/lib/supabase';
import { createRoomCode, normalizeRoomCode } from './roomCode';
import {
  EMPTY_LOBBY,
  type FramePacket,
  type InputPacket,
  type OnlineLobby,
  type OnlineRole,
  type OnlineSnapshot,
} from './types';

export { normalizeRoomCode } from './roomCode';
export type { OnlineLobby, OnlineRole, OnlineSnapshot } from './types';

let snapshot: OnlineSnapshot = {
  status: 'idle', code: '', role: null, peerConnected: false,
  lobby: EMPTY_LOBBY, error: null,
};
let channel: RealtimeChannel | null = null;
let remoteInput: InputPacket = { sequence: 0, input: {} };
let remoteFrame: FramePacket | null = null;
let remoteResult: MatchResult | null = null;
let inputSequence = 0;
const listeners = new Set<() => void>();

export function getOnlineSnapshot(): OnlineSnapshot { return snapshot; }
export function subscribeOnline(listener: () => void): () => void {
  listeners.add(listener); return () => listeners.delete(listener);
}

export async function createOnlineRoom(): Promise<void> { await connect(createRoomCode(), 'host'); }

export async function joinOnlineRoom(code: string): Promise<void> {
  const normalized = normalizeRoomCode(code);
  if (normalized.length !== 6) {
    update({ status: 'error', error: 'Room codes contain six characters.' });
    return;
  }
  await connect(normalized, 'guest');
}

export async function leaveOnlineRoom(): Promise<void> {
  const client = await getSupabaseClient();
  if (channel !== null && client !== null) await client.removeChannel(channel);
  channel = null;
  remoteFrame = null;
  remoteResult = null;
  remoteInput = { sequence: 0, input: {} };
  snapshot = { ...snapshot, status: 'idle', code: '', role: null, peerConnected: false, error: null };
  emit();
}

export function updateOnlineLobby(patch: Partial<OnlineLobby>): void {
  if (snapshot.role === null || channel === null || snapshot.status === 'error') return;
  if (snapshot.role === 'host') {
    snapshot = {
      ...snapshot,
      status: patch.phase === 'fight' ? 'fight' : snapshot.status,
      lobby: { ...snapshot.lobby, ...patch },
    };
    emit();
    void send('lobby', snapshot.lobby);
  } else {
    void send('guest-patch', patch);
  }
}

export function selectionFromLobby(lobby = snapshot.lobby): CharacterSelection {
  return [lobby.hostFighter, lobby.guestFighter];
}

export function sendOnlineInput(input: FighterInput): void {
  inputSequence += 1; void send('input', { sequence: inputSequence, input });
}

export function readRemoteInput(): InputPacket { return remoteInput; }
export function broadcastOnlineFrame(world: WorldSnapshot, hud: HudSnapshot): void {
  void send('frame', { world, hud });
}
export function takeRemoteFrame(): FramePacket | null {
  const packet = remoteFrame; remoteFrame = null; return packet;
}
export function broadcastOnlineResult(result: MatchResult): void { void send('result', result); }
export function takeRemoteResult(): MatchResult | null {
  const result = remoteResult; remoteResult = null; return result;
}

async function connect(code: string, role: OnlineRole): Promise<void> {
  await leaveOnlineRoom();
  const client = await getSupabaseClient();
  if (client === null) {
    update({ status: 'error', error: 'Online service is not configured for this build.' });
    return;
  }
  snapshot = { ...snapshot, status: 'connecting', code, role, lobby: EMPTY_LOBBY, error: null };
  emit();
  const peerId = crypto.randomUUID();
  channel = client.channel(`circle-clash:${code}`, {
    config: { broadcast: { self: false }, presence: { key: peerId } },
  });
  channel
    .on('presence', { event: 'sync' }, () => {
      const peers = Object.values(channel?.presenceState() ?? {}).flat();
      const connected = peers.length >= 2;
      update({ peerConnected: connected, status: snapshot.lobby.phase === 'fight' ? 'fight' : 'lobby' });
      if (connected && snapshot.role === 'host') void send('lobby', snapshot.lobby);
    })
    .on('broadcast', { event: 'hello' }, () => {
      if (snapshot.role === 'host') void send('lobby', snapshot.lobby);
    })
    .on('broadcast', { event: 'lobby' }, ({ payload }) => receiveLobby(payload))
    .on('broadcast', { event: 'guest-patch' }, ({ payload }) => receiveGuestPatch(payload))
    .on('broadcast', { event: 'input' }, ({ payload }) => { remoteInput = payload as InputPacket; })
    .on('broadcast', { event: 'frame' }, ({ payload }) => { remoteFrame = payload as FramePacket; })
    .on('broadcast', { event: 'result' }, ({ payload }) => { remoteResult = payload as MatchResult; })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel?.track({ role, joinedAt: Date.now() });
        update({ status: 'lobby' });
        await send('hello', { role });
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        update({ status: 'error', error: 'Could not connect to the room. Try again.' });
      }
    });
}

function receiveLobby(payload: unknown): void {
  if (snapshot.role !== 'guest' || typeof payload !== 'object' || payload === null) return;
  const lobby = payload as OnlineLobby;
  snapshot = { ...snapshot, lobby, peerConnected: true, status: lobby.phase === 'fight' ? 'fight' : 'lobby' };
  emit();
}

function receiveGuestPatch(payload: unknown): void {
  if (snapshot.role !== 'host' || typeof payload !== 'object' || payload === null) return;
  const patch = payload as Partial<OnlineLobby>;
  const allowed: Partial<OnlineLobby> = {
    ...(typeof patch.guestReady === 'boolean' ? { guestReady: patch.guestReady } : {}),
    ...(typeof patch.guestFighter === 'string' ? { guestFighter: patch.guestFighter } : {}),
  };
  snapshot = { ...snapshot, lobby: { ...snapshot.lobby, ...allowed } };
  emit();
  void send('lobby', snapshot.lobby);
}

async function send(event: string, payload: object): Promise<void> {
  if (channel === null) return;
  await channel.send({ type: 'broadcast', event, payload });
}

function update(patch: Partial<OnlineSnapshot>): void {
  snapshot = { ...snapshot, ...patch }; emit();
}

function emit(): void { listeners.forEach((listener) => listener()); }
