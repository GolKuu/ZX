import type { RealtimeChannel } from '@supabase/supabase-js';
import type { CharacterSelection } from '@/src/data/characterRoster';
import { getSupabaseClient } from '@/src/lib/supabase';
import { createRoomCode, normalizeRoomCode } from './roomCode';
import { startMatchmaking, stopMatchmaking } from './matchmaking';
import {
  EMPTY_LOBBY,
  type OnlineLobby,
  type OnlineRole,
  type OnlineSnapshot,
} from './types';
import {
  configureOnlineCombat,
  receiveOnlineFrame,
  receiveOnlineInput,
  receiveOnlineResult,
  resetOnlineCombat,
} from './onlineCombat';

export { normalizeRoomCode } from './roomCode';
export {
  broadcastOnlineFrame,
  broadcastOnlineResult,
  readRemoteInput,
  sendOnlineInput,
  takeRemoteFrame,
  takeRemoteResult,
} from './onlineCombat';
export type { OnlineLobby, OnlineRole, OnlineSnapshot } from './types';

let snapshot: OnlineSnapshot = {
  status: 'idle', code: '', role: null, peerConnected: false,
  lobby: EMPTY_LOBBY, error: null,
};
let channel: RealtimeChannel | null = null;
const listeners = new Set<() => void>();

export function getOnlineSnapshot(): OnlineSnapshot { return snapshot; }
export function subscribeOnline(listener: () => void): () => void {
  listeners.add(listener); return () => listeners.delete(listener);
}

export async function createOnlineRoom(): Promise<void> { await connect(createRoomCode(), 'host'); }

export async function findOnlineMatch(): Promise<void> {
  await leaveOnlineRoom();
  const client = await getSupabaseClient();
  if (client === null) {
    update({ status: 'error', error: 'Online service is not configured for this build.' });
    return;
  }
  update({ status: 'matching', error: null });
  await startMatchmaking(
    client,
    (code, role) => { void connect(code, role); },
    () => update({ status: 'error', error: 'Matchmaking is unavailable. Try again.' }),
  );
}

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
  await stopMatchmaking(client);
  if (channel !== null && client !== null) await client.removeChannel(channel);
  channel = null;
  resetOnlineCombat();
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
  configureOnlineCombat((event, payload) => { void send(event, payload); });
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
    .on('broadcast', { event: 'input' }, ({ payload }) => receiveOnlineInput(payload))
    .on('broadcast', { event: 'frame' }, ({ payload }) => receiveOnlineFrame(payload))
    .on('broadcast', { event: 'result' }, ({ payload }) => receiveOnlineResult(payload))
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
