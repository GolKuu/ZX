import { ControlStorage } from '../game/input/ControlStorage';
import type { KeyboardProfiles } from '../game/input/InputProfile';
import { settingsStore, type GameSettings } from '../stores/settingsStore';
import { loadCloudSettings, saveCloudSettings } from './accountApi';
import type { CloudPlayerSettings } from './accountTypes';

const controls = new ControlStorage();

export async function loadAndApplyCloudSettings(userId: string) {
  try {
    const cloud = await loadCloudSettings(userId);
    const settings = settingsFromCloud(cloud);
    settingsStore.save(settings);
    applyLocalAccessibility(settings);
    controls.importCloud(cloud.control_layout);
  } catch {
    // Offline play continues with the last safe local copy.
  }
}

export async function syncCurrentSettings(userId: string) {
  const local = settingsStore.load();
  return saveCloudSettings({
    user_id: userId,
    control_layout: controls.load() as unknown as Record<string, unknown>,
    graphics: { quality: local.graphicsQuality },
    master_volume: local.masterVolume,
    music_volume: local.musicVolume,
    effects_volume: local.effectsVolume,
    blood_level: local.bloodLevel,
    accessibility: {
      reducedMotion: local.reducedMotion,
      highContrast: local.highContrast,
      largeText: local.largeText,
      showCombatHints: local.showCombatHints,
    },
  });
}

export function applySettings(settings: GameSettings, profiles?: KeyboardProfiles) {
  settingsStore.save(settings);
  applyLocalAccessibility(settings);
  if (profiles) controls.save(profiles);
}

export function applyLocalAccessibility(settings: GameSettings) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('reduced-motion', settings.reducedMotion);
  document.documentElement.classList.toggle('high-contrast', settings.highContrast);
  document.documentElement.classList.toggle('large-text', settings.largeText);
}

function settingsFromCloud(cloud: CloudPlayerSettings): GameSettings {
  const accessibility = cloud.accessibility;
  const quality = cloud.graphics.quality;
  return {
    masterVolume: cloud.master_volume,
    musicVolume: cloud.music_volume,
    effectsVolume: cloud.effects_volume,
    graphicsQuality:
      quality === 'low' || quality === 'medium' || quality === 'high' ? quality : 'high',
    bloodLevel:
      cloud.blood_level === 0 || cloud.blood_level === 2 ? cloud.blood_level : 1,
    reducedMotion: accessibility.reducedMotion === true,
    highContrast: accessibility.highContrast === true,
    largeText: accessibility.largeText === true,
    showCombatHints: accessibility.showCombatHints !== false,
  };
}
