export const COMMAND_PRIORITY = [
  'SUPER_ATTACK',
  'COMBO_BREAK',
  'MOMENTUM_REVERSAL',
  'COMBO_ESCAPE',
  'GRAB',
  'AIR_SPECIAL',
  'DASH_ATTACK',
  'DIRECTIONAL_SPECIAL',
  'SPECIAL_ATTACK',
  'AIR_HEAVY',
  'AIR_LIGHT',
  'DIRECTIONAL_HEAVY',
  'DIRECTIONAL_LIGHT',
  'HEAVY_ATTACK',
  'LIGHT_ATTACK',
  'BLOCK',
  'MOVE',
] as const;

export type RecognizedCommand = (typeof COMMAND_PRIORITY)[number];

export function highestPriority(commands: Iterable<RecognizedCommand>) {
  const available = new Set(commands);
  return COMMAND_PRIORITY.find((command) => available.has(command)) ?? null;
}
