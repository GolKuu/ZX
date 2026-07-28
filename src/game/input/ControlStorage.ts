import {
  cloneKeyboardProfiles,
  defaultKeyboardProfiles,
} from '../config/defaultControls';
import type { GameAction, PlayerId } from '../core/types';
import { classicBindingsFor } from './controlSchemes';
import type { KeyboardInputProfile, KeyboardProfiles } from './InputProfile';
import { findMissingActions } from './inputValidation';

export const CONTROL_STORAGE_KEY = 'circle-clash-controls-v3';
const LEGACY_STORAGE_KEY = 'circle-clash-controls-v2';

export class ControlStorage {
  load(): KeyboardProfiles {
    if (typeof localStorage === 'undefined') return cloneKeyboardProfiles();
    const current = this.parse(localStorage.getItem(CONTROL_STORAGE_KEY));
    if (current && findMissingActions(current).length === 0) return current;

    const legacy = this.parseLegacy(localStorage.getItem(LEGACY_STORAGE_KEY));
    if (legacy) {
      this.save(legacy);
      return legacy;
    }
    return cloneKeyboardProfiles();
  }

  save(profiles: KeyboardProfiles) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CONTROL_STORAGE_KEY, JSON.stringify(profiles));
    }
  }

  reset() {
    const defaults = cloneKeyboardProfiles(defaultKeyboardProfiles);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(CONTROL_STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
    return defaults;
  }

  private parse(value: string | null) {
    try {
      return cloneKeyboardProfiles(JSON.parse(value ?? '') as KeyboardProfiles);
    } catch {
      return null;
    }
  }

  private parseLegacy(value: string | null): KeyboardProfiles | null {
    try {
      const parsed = JSON.parse(value ?? '') as Record<PlayerId, {
        bindings: Record<string, string>;
      }>;
      return {
        player1: migratePlayer('player1', parsed.player1),
        player2: migratePlayer('player2', parsed.player2),
      };
    } catch {
      return null;
    }
  }
}

function migratePlayer(
  playerId: PlayerId,
  legacy: { bindings: Record<string, string> },
): KeyboardInputProfile {
  const defaults = defaultKeyboardProfiles[playerId];
  const bindings = { ...defaults.bindings };
  (Object.keys(bindings) as GameAction[]).forEach((action) => {
    const legacyAction = action === 'DEFENSE' ? 'BLOCK' : action;
    bindings[action] = legacy.bindings[legacyAction] ?? bindings[action];
  });
  return {
    ...defaults,
    scheme: 'CLASSIC',
    bindings,
    classicBindings: {
      ...classicBindingsFor(playerId),
      GRAB: legacy.bindings.GRAB,
      SUPER_ATTACK: legacy.bindings.SUPER_ATTACK,
      COMBO_ESCAPE: legacy.bindings.COMBO_ESCAPE,
      MOMENTUM_REVERSAL: legacy.bindings.MOMENTUM_REVERSAL,
    },
  };
}
