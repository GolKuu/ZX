import type { CharacterId } from '../data/characterRoster.js';
import { effectiveLoadout } from './purchases.js';
import type { ProgressionMode, ProgressionProfile } from './types.js';

export interface ModeProgression {
  readonly normalized: boolean; readonly persistent: boolean;
  readonly nodes: Readonly<Record<CharacterId, readonly string[]>>;
}
const FIGHTERS: readonly CharacterId[] = ['mim', 'glitch', 'lucky', 'titan', 'vorgh'];

export function resolveModeProgression(profile: ProgressionProfile, mode: ProgressionMode,
  training: 'purchased' | 'base' | 'all' | readonly string[] = 'purchased'): ModeProgression {
  return { normalized: mode === 'ranked', persistent: mode !== 'training',
    nodes: Object.fromEntries(FIGHTERS.map((id) => [id, effectiveLoadout(profile, id, mode, training)])) as Record<CharacterId, readonly string[]> };
}

export function casualBudgetsMatch(first: readonly string[], second: readonly string[]): boolean {
  return first.length === second.length;
}
