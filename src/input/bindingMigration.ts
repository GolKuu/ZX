import {
  DEFAULT_BINDINGS,
  type Button,
  type KeyBindings,
} from './bindings.js';

const DIRECTIONS = ['up', 'down', 'left', 'right'] as const;

/**
 * Upgrade an older saved layout without discarding the player's custom keys.
 * Missing controls receive their current defaults; malformed values are ignored.
 */
export function migrateKeyBindings(value: unknown): KeyBindings | null {
  if (typeof value !== 'object' || value === null || !('buttons' in value)) {
    return null;
  }
  const candidate = value as {
    readonly buttons?: unknown;
    readonly [key: string]: unknown;
  };
  const savedButtons = typeof candidate.buttons === 'object'
    && candidate.buttons !== null
    ? candidate.buttons as Readonly<Record<string, unknown>>
    : {};
  const migrated = {
    ...DEFAULT_BINDINGS,
    buttons: { ...DEFAULT_BINDINGS.buttons },
  };

  for (const direction of DIRECTIONS) {
    const code = candidate[direction];
    if (typeof code === 'string') migrated[direction] = code;
  }
  for (const button of Object.keys(DEFAULT_BINDINGS.buttons) as Button[]) {
    const code = savedButtons[button];
    if (typeof code === 'string') migrated.buttons[button] = code;
  }
  return migrated;
}
