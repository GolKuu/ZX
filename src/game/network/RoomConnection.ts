import { onlineRoomStore } from '../../stores/onlineRoomStore';
import {
  createPrivateRoom,
  createTeamPrivateRoom,
  joinPrivateRoom,
  joinTeamPrivateRoom,
} from './RoomApi';
import {
  loadRoomCredentials,
  saveRoomCredentials,
} from './OnlineSessionStorage';

const pendingConnections = new Map<string, ReturnType<typeof joinAndConnect>>();
const pendingTeamConnections = new Map<string, ReturnType<typeof joinTeamAndConnect>>();

export async function createRoomConnection() {
  const credentials = await createPrivateRoom();
  saveRoomCredentials(credentials);
  return onlineRoomStore.connect(credentials);
}

export function ensureRoomConnection(roomCode: string) {
  const code = roomCode.trim().toUpperCase();
  const active = onlineRoomStore.get();
  if (active?.credentials.roomCode === code) {
    active.connect();
    return Promise.resolve(active);
  }
  const stored = loadRoomCredentials(code);
  if (stored) return Promise.resolve(onlineRoomStore.connect(stored));
  const pending = pendingConnections.get(code);
  if (pending) return pending;
  const connection = joinAndConnect(code).finally(() => {
    pendingConnections.delete(code);
  });
  pendingConnections.set(code, connection);
  return connection;
}

export async function createTeamRoomConnection() {
  const credentials = await createTeamPrivateRoom();
  saveRoomCredentials(credentials);
  return onlineRoomStore.connect(credentials);
}

export function ensureTeamRoomConnection(roomCode: string) {
  const code = roomCode.trim().toUpperCase();
  const active = onlineRoomStore.get();
  if (active?.credentials.roomCode === code) {
    active.connect();
    return Promise.resolve(active);
  }
  const stored = loadRoomCredentials(code);
  if (stored) return Promise.resolve(onlineRoomStore.connect(stored));
  const pending = pendingTeamConnections.get(code);
  if (pending) return pending;
  const connection = joinTeamAndConnect(code).finally(() => {
    pendingTeamConnections.delete(code);
  });
  pendingTeamConnections.set(code, connection);
  return connection;
}

async function joinAndConnect(roomCode: string) {
  const credentials = await joinPrivateRoom(roomCode);
  saveRoomCredentials(credentials);
  return onlineRoomStore.connect(credentials);
}

async function joinTeamAndConnect(roomCode: string) {
  const credentials = await joinTeamPrivateRoom(roomCode);
  saveRoomCredentials(credentials);
  return onlineRoomStore.connect(credentials);
}
