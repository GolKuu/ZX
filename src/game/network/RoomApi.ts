import type { RoomApiError, RoomCredentials } from './protocol';
import {
  MatchServerConfigurationError,
  matchServerHttpUrl,
} from './matchServerUrl';

export async function createPrivateRoom() {
  return roomRequest('/rooms', { method: 'POST', body: '{}' });
}

export async function joinPrivateRoom(roomCode: string) {
  return roomRequest(`/rooms/${encodeURIComponent(roomCode)}/join`, {
    method: 'POST',
    body: '{}',
  });
}

export async function createTeamPrivateRoom() {
  return roomRequest('/team-rooms', { method: 'POST', body: '{}' });
}

export async function joinTeamPrivateRoom(roomCode: string) {
  return roomRequest(`/team-rooms/${encodeURIComponent(roomCode)}/join`, {
    method: 'POST',
    body: '{}',
  });
}

async function roomRequest(path: string, init: RequestInit): Promise<RoomCredentials> {
  let response: Response;
  try {
    response = await fetch(`${matchServerHttpUrl()}${path}`, {
      ...init,
      headers: { 'content-type': 'application/json', ...init.headers },
    });
  } catch (reason) {
    if (reason instanceof MatchServerConfigurationError) {
      throw new OnlineRoomApiError(reason.code, reason.message);
    }
    throw new OnlineRoomApiError(
      'SERVER_UNAVAILABLE',
      'Сервер матчей временно недоступен. Попробуйте позже или сыграйте против ИИ.',
    );
  }
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = isApiError(body)
      ? body
      : { code: 'ROOM_REQUEST_FAILED', message: 'Не удалось открыть комнату.' };
    throw new OnlineRoomApiError(error.code, error.message);
  }
  if (!isCredentials(body)) {
    throw new OnlineRoomApiError('INVALID_RESPONSE', 'Сервер вернул неверный ответ.');
  }
  return body;
}

export class OnlineRoomApiError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
  }
}

function isCredentials(value: unknown): value is RoomCredentials {
  if (!isRecord(value)) return false;
  return (
    typeof value.matchId === 'string' &&
    typeof value.roomCode === 'string' &&
    (value.playerId === 'player1' || value.playerId === 'player2') &&
    typeof value.playerToken === 'string'
  );
}

function isApiError(value: unknown): value is RoomApiError {
  return isRecord(value) &&
    typeof value.code === 'string' &&
    typeof value.message === 'string';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
