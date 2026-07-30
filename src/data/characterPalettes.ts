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

const IDOL: CharacterPalette = {
  hair: zone('#f04f91', '#9d3e8d', 1, 0.76),
  skin: zone('#efc3aa', '#a76686', 0.62, 0.7),
  coat: zone('#f04f91', '#a73d86'),
  trousers: zone('#fff8f1', '#c48ab1', 0.72, 0.76),
  boot: zone('#fffaf3', '#b77ca8', 1, 0.72),
  eye: zone('#fff8d7', '#d6a237', 0, 0),
  body: zone('#f04f91', '#a73d86'),
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

const PALETTES: Record<CharacterId, CharacterPalette> = {
  mim: MIM,
  echo: ECHO,
  idol: IDOL,
  glitch: GLITCH,
  chrono: CHRONO,
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
