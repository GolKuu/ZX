import { defaultControls, type PlayerControls } from '../config/defaultControls';

const STORAGE_KEY = 'circle-clash-controls';

export class ControlStorage {
  load(): PlayerControls {
    if (typeof localStorage === 'undefined') return defaultControls;

    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '');
      return { ...defaultControls, ...saved } as PlayerControls;
    } catch {
      return defaultControls;
    }
  }

  save(controls: PlayerControls) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(controls));
    }
  }

  reset() {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
  }
}
