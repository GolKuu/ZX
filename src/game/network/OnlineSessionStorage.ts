import type { RoomCredentials } from './protocol';

const PREFIX = 'circle-clash-online:';

export function saveRoomCredentials(credentials: RoomCredentials) {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(
    `${PREFIX}${credentials.roomCode}`,
    JSON.stringify(credentials),
  );
}

export function loadRoomCredentials(roomCode: string) {
  if (typeof sessionStorage === 'undefined') return null;
  const raw = sessionStorage.getItem(`${PREFIX}${roomCode.toUpperCase()}`);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as RoomCredentials;
    return value.roomCode === roomCode.toUpperCase() ? value : null;
  } catch {
    return null;
  }
}

export function clearRoomCredentials(roomCode: string) {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(`${PREFIX}${roomCode.toUpperCase()}`);
}
