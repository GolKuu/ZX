import { onlineRoomStore } from '../../stores/onlineRoomStore';
import { createPrivateRoom, joinPrivateRoom } from './RoomApi';
import {
  loadRoomCredentials,
  saveRoomCredentials,
} from './OnlineSessionStorage';

const pendingConnections = new Map<string, ReturnType<typeof joinAndConnect>>();

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

async function joinAndConnect(roomCode: string) {
  const credentials = await joinPrivateRoom(roomCode);
  saveRoomCredentials(credentials);
  return onlineRoomStore.connect(credentials);
}
