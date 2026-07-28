import {
  cloneKeyboardProfiles,
  defaultKeyboardProfiles,
} from '../config/defaultControls';
import type { KeyboardProfiles } from './InputProfile';
import { findMissingActions } from './inputValidation';

const STORAGE_KEY = 'circle-clash-controls-v2';

export class ControlStorage {
  load(): KeyboardProfiles {
    if (typeof localStorage === 'undefined') return cloneKeyboardProfiles();

    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '') as KeyboardProfiles;
      const profiles = cloneKeyboardProfiles(parsed);
      return findMissingActions(profiles).length === 0 ? profiles : cloneKeyboardProfiles();
    } catch {
      return cloneKeyboardProfiles();
    }
  }

  save(profiles: KeyboardProfiles) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    }
  }

  reset() {
    const defaults = cloneKeyboardProfiles(defaultKeyboardProfiles);
    if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
    return defaults;
  }
}
