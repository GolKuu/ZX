export type LocalProfile = {
  nickname: string;
  avatarUrl: string | null;
  region: string;
  language: string;
  favoriteCharacterIds: string[];
  createdAt: string;
};

const STORAGE_KEY = 'circle-clash-profile';
const defaultProfile: LocalProfile = {
  nickname: 'Гость Circle Clash',
  avatarUrl: null,
  region: 'KZ',
  language: 'ru',
  favoriteCharacterIds: [],
  createdAt: new Date(0).toISOString(),
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
