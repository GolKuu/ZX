export type LocalProfile = {
  displayName: string;
  favoriteCharacterId: string | null;
};

const STORAGE_KEY = 'circle-clash-profile';
const defaultProfile: LocalProfile = {
  displayName: 'Гость Circle Clash',
  favoriteCharacterId: null,
};

export const profileStore = {
  load(): LocalProfile {
    if (typeof localStorage === 'undefined') return defaultProfile;
    try {
      return { ...defaultProfile, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '') };
    } catch {
      return defaultProfile;
    }
  },
  save(profile: LocalProfile) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }
  },
};
