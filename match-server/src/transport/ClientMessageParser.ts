import {
  parseGameplayInputPacket,
} from '../../../src/game/network/InputCodec.js';
import type {
  ClientControlMessage,
} from '../../../src/game/network/protocol.js';

const MAX_MESSAGE_BYTES = 1_024;

export function parseClientMessage(raw: unknown) {
  const text = messageText(raw);
  if (!text || Buffer.byteLength(text) > MAX_MESSAGE_BYTES) {
    return invalid('MESSAGE_SIZE');
  }
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return invalid('INVALID_JSON');
  }
  if (!isRecord(value) || typeof value.type !== 'string') {
    return invalid('MESSAGE_SHAPE');
  }
  if (value.type === 'input') {
    const parsed = parseGameplayInputPacket(value.payload);
    return parsed.ok
      ? valid({ type: 'input', payload: parsed.value })
      : invalid(parsed.reason);
  }
  if (value.type === 'selectCharacter' && typeof value.characterId === 'string') {
    return valid({ type: value.type, characterId: value.characterId });
  }
  if (value.type === 'setReady' && typeof value.ready === 'boolean') {
    return valid({ type: value.type, ready: value.ready });
  }
  if (value.type === 'rematch' && typeof value.ready === 'boolean') {
    return valid({ type: value.type, ready: value.ready });
  }
  if (
    value.type === 'ping' &&
    typeof value.clientTime === 'number' &&
    Number.isFinite(value.clientTime)
  ) return valid({ type: value.type, clientTime: value.clientTime });
  if (value.type === 'leave') return valid({ type: value.type });
  return invalid('UNKNOWN_MESSAGE');
}

export class MessageRateLimiter {
  private windowStartedAt = 0;
  private count = 0;

  allow(now: number) {
    if (now - this.windowStartedAt >= 1_000) {
      this.windowStartedAt = now;
      this.count = 0;
    }
    this.count += 1;
    return this.count <= 180;
  }
}

function messageText(raw: unknown) {
  if (typeof raw === 'string') return raw;
  if (Buffer.isBuffer(raw)) return raw.toString('utf8');
  if (raw instanceof ArrayBuffer) return Buffer.from(raw).toString('utf8');
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function valid(value: ClientControlMessage) {
  return { ok: true as const, value };
}

function invalid(reason: string) {
  return { ok: false as const, reason };
}
