import type { CombatAction, PlayerInputFrame } from '../core/types';
import type { GameplayInputPacket } from './protocol';

export const ONLINE_ACTION_BITS = {
  JUMP: 1 << 0,
  LIGHT_ATTACK: 1 << 1,
  HEAVY_ATTACK: 1 << 2,
  SPECIAL_ATTACK: 1 << 3,
  DEFENSE: 1 << 4,
} as const;

export const ALL_ONLINE_ACTION_BITS = Object.values(ONLINE_ACTION_BITS)
  .reduce((mask, bit) => mask | bit, 0);

const BIT_ACTIONS = Object.entries(ONLINE_ACTION_BITS) as Array<
  [keyof typeof ONLINE_ACTION_BITS, number]
>;

export type RawNetworkInput = {
  actionBitmask: number;
  direction: -1 | 0 | 1;
};

export function encodePlayerInput(input: PlayerInputFrame): RawNetworkInput {
  const held = new Set(input.held);
  const direction = held.has('MOVE_LEFT') === held.has('MOVE_RIGHT')
    ? 0
    : held.has('MOVE_LEFT') ? -1 : 1;
  const actionBitmask = BIT_ACTIONS.reduce(
    (mask, [action, bit]) => held.has(action) ? mask | bit : mask,
    0,
  );
  return { actionBitmask, direction };
}

export function decodeNetworkInput(
  current: RawNetworkInput,
  previous: RawNetworkInput,
): PlayerInputFrame {
  const held = actionsFor(current);
  const before = new Set(actionsFor(previous));
  const now = new Set(held);
  return {
    held,
    pressed: held.filter((action) => !before.has(action)),
    released: [...before].filter((action) => !now.has(action)),
  };
}

export function parseGameplayInputPacket(value: unknown) {
  if (!isRecord(value)) return invalid('INPUT_NOT_OBJECT');
  const keys = Object.keys(value);
  const allowed = [
    'matchId', 'tick', 'sequence', 'actionBitmask', 'direction', 'acknowledgedTick',
  ];
  if (keys.some((key) => !allowed.includes(key)) || keys.length !== allowed.length) {
    return invalid('INPUT_FIELDS');
  }
  if (typeof value.matchId !== 'string' || !/^[a-f0-9]{32}$/.test(value.matchId)) {
    return invalid('MATCH_ID');
  }
  if (!isSafeTick(value.tick) || !isSafeTick(value.acknowledgedTick)) {
    return invalid('INPUT_TICK');
  }
  if (
    typeof value.sequence !== 'number' ||
    !Number.isSafeInteger(value.sequence) ||
    value.sequence < 1
  ) {
    return invalid('INPUT_SEQUENCE');
  }
  if (
    typeof value.actionBitmask !== 'number' ||
    !Number.isInteger(value.actionBitmask) ||
    value.actionBitmask < 0 ||
    (value.actionBitmask & ~ALL_ONLINE_ACTION_BITS) !== 0
  ) return invalid('ACTION_BITMASK');
  if (value.direction !== -1 && value.direction !== 0 && value.direction !== 1) {
    return invalid('DIRECTION');
  }
  return { ok: true as const, value: value as GameplayInputPacket };
}

function actionsFor(input: RawNetworkInput): CombatAction[] {
  const actions: CombatAction[] = [];
  if (input.direction < 0) actions.push('MOVE_LEFT');
  if (input.direction > 0) actions.push('MOVE_RIGHT');
  BIT_ACTIONS.forEach(([action, bit]) => {
    if ((input.actionBitmask & bit) !== 0) actions.push(action);
  });
  return actions;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isSafeTick(value: unknown) {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}

function invalid(reason: string) {
  return { ok: false as const, reason };
}
