import type { CharacterId } from './characterRoster';

export interface ZonePalette {
  readonly lit: string;
  readonly shade: string;
  readonly rim: number;
  readonly shadow: number;
}

export interface CharacterPalette {
  readonly hair: ZonePalette;
  readonly skin: ZonePalette;
  readonly coat: ZonePalette;
  readonly trousers: ZonePalette;
  readonly boot: ZonePalette;
  readonly eye: ZonePalette;
  readonly body: ZonePalette;
}

function zone(
  lit: string,
  shade: string,
  rim = 0.85,
  shadow = 0.85,
): ZonePalette {
  return { lit, shade, rim, shadow };
}

const MIM: CharacterPalette = {
  hair: zone('#ffd52a', '#ee8f2c', 1, 0.72),
  skin: zone('#ffd52a', '#ee8f2c', 0.8, 0.72),
  coat: zone('#6f35cf', '#35156f', 1, 0.82),
  trousers: zone('#5b2db6', '#2b145f', 0.82, 0.82),
  boot: zone('#faf9ff', '#c8b7eb', 1, 0.68),
  eye: zone('#3c176f', '#210c43', 0, 0),
  body: zone('#6f35cf', '#35156f', 1, 0.82),
};

const ECHO: CharacterPalette = {
  hair: zone('#f7fbff', '#8fd7eb', 1.05, 0.72),
  skin: zone('#eef8ff', '#87bfd3', 0.72, 0.68),
  coat: zone('#f4f8fb', '#6fa9c2', 1.1, 0.72),
  trousers: zone('#0d2744', '#155777', 0.82, 0.78),
  boot: zone('#102b49', '#1d6683', 0.95, 0.74),
  eye: zone('#54e7ff', '#1b83a4', 0, 0),
  body: zone('#f4f8fb', '#6fa9c2', 1.1, 0.72),
};

const GLITCH: CharacterPalette = {
  hair: zone('#080a0f', '#511052', 1.15, 0.82),
  skin: zone('#10131a', '#7d176b', 0.9, 0.78),
  coat: zone('#06080d', '#4a0f50', 1.1, 0.88),
  trousers: zone('#080a10', '#183e63', 1, 0.84),
  boot: zone('#030409', '#30103d', 1.2, 0.82),
  eye: zone('#16e6ff', '#ff2bd6', 0, 0),
  body: zone('#07090e', '#61105e', 1.15, 0.86),
};

const CHRONO: CharacterPalette = {
  hair: zone('#e7edf5', '#8296b5', 1.05, 0.78),
  skin: zone('#e2b89d', '#9a677f', 0.62, 0.7),
  coat: zone('#111725', '#1c3156', 1.05, 0.82),
  trousers: zone('#172b48', '#102033', 0.82, 0.8),
  boot: zone('#cbd7e6', '#607898', 1.18, 0.75),
  eye: zone('#42b9ff', '#236d9d', 0, 0),
  body: zone('#111725', '#1c3156'),
};

const LUCKY: CharacterPalette = {
  hair: zone('#181712', '#070806', 0.82, 0.9),
  skin: zone('#c58b72', '#7b4d46', 0.62, 0.76),
  coat: zone('#194f39', '#081b13', 1.08, 0.84),
  trousers: zone('#151b17', '#080b09', 0.76, 0.9),
  boot: zone('#0b0e0c', '#030403', 0.72, 0.92),
  eye: zone('#e5bc4e', '#8f1b31', 0, 0),
  body: zone('#194f39', '#081b13', 1.08, 0.84),
};

const VORGH: CharacterPalette = {
  hair: zone('#171111', '#050303', 0.95, 0.92),
  skin: zone('#c8a07e', '#6d3e34', 0.62, 0.78),
  coat: zone('#2a1012', '#080405', 1.15, 0.9),
  trousers: zone('#181313', '#050505', 0.84, 0.92),
  boot: zone('#160e0d', '#030202', 0.9, 0.94),
  eye: zone('#ff6a1a', '#8c0f0f', 0, 0),
  body: zone('#4b1516', '#090405', 1.18, 0.9),
};

const PALETTES: Record<CharacterId, CharacterPalette> = {
  mim: MIM,
  echo: ECHO,
  glitch: GLITCH,
  chrono: CHRONO,
  lucky: LUCKY,
  vorgh: VORGH,
};

export function paletteFor(characterId: CharacterId): CharacterPalette {
  return PALETTES[characterId];
}

export const ZONE_HEIGHTS = {
  boot: 0.075,
  trousers: 0.5,
  coat: 0.8,
  skin: 0.915,
  hair: 1,
} as const satisfies Readonly<Record<string, number>>;

export interface PaletteBand {
  readonly upTo: number;
  readonly lit: string;
  readonly shade: string;
}

export function bandsFor(palette: CharacterPalette): readonly PaletteBand[] {
  return [
    { upTo: ZONE_HEIGHTS.boot, ...pair(palette.boot) },
    { upTo: ZONE_HEIGHTS.trousers, ...pair(palette.trousers) },
    { upTo: ZONE_HEIGHTS.coat, ...pair(palette.coat) },
    { upTo: ZONE_HEIGHTS.skin, ...pair(palette.skin) },
    { upTo: ZONE_HEIGHTS.hair, ...pair(palette.hair) },
  ];
}

function pair({ lit, shade }: ZonePalette): { lit: string; shade: string } {
  return { lit, shade };
}
