import type { HeroSurfaceOptions } from './heroSurfaceLighting';

export type HeroKind = 'glitch' | 'lucky' | 'mim' | 'titan' | 'vorgh';

/**
 * Per-fighter relight palette.
 *
 * The key stays close to the stage's own warm key for every character, because
 * a fighter lit by a different sun than the room is the single most obvious
 * way a composite falls apart. What changes per character is the *fill*, the
 * *rim* and the *accent glint* — the cool or warm bias their costume sits in,
 * and the colour their plates throw back. That is enough to tell them apart at
 * a glance without any of them leaving the stage's light.
 *
 * `exposure` is per-character on purpose. The atlases were authored at
 * different densities: MIM is near-white armour that clips the moment it is
 * lifted, VORGH is dark hide that disappears without a lift.
 */
export const HERO_SURFACE_PALETTES: Record<HeroKind, HeroSurfaceOptions> = {
  glitch: {
    keyColor: '#e8f4ff',
    fillColor: '#26354f',
    bounceColor: '#1d4460',
    rimColor: '#48dfff',
    accentColor: '#7ef0ff',
    // The darkest costume on the roster after VORGH: a near-black bodysuit with
    // cyan piping. It needs the most key of anyone or it reads as a hole.
    keyStrength: 1.5,
    fillStrength: 0.5,
    exposure: 1.12,
    rimStrength: 1.15,
    specularStrength: 0.34,
  },
  lucky: {
    keyColor: '#fff0d4',
    fillColor: '#33304a',
    bounceColor: '#5c3a1c',
    rimColor: '#ffc46a',
    accentColor: '#e8ba62',
    keyStrength: 1.22,
    fillStrength: 0.4,
    exposure: 1.04,
    rimStrength: 0.86,
    specularStrength: 0.5,
  },
  mim: {
    keyColor: '#fdf3ff',
    fillColor: '#2e2b46',
    bounceColor: '#3a2350',
    rimColor: '#bb6dff',
    accentColor: '#d9b6ff',
    // Bright armour: the least headroom on the roster.
    keyStrength: 1.02,
    fillStrength: 0.34,
    exposure: 1.0,
    rimStrength: 0.95,
    specularStrength: 0.5,
  },
  titan: {
    keyColor: '#ffeacd',
    fillColor: '#3a2c28',
    bounceColor: '#6b3113',
    rimColor: '#ff8c42',
    accentColor: '#ffb066',
    keyStrength: 1.26,
    fillStrength: 0.42,
    exposure: 1.05,
    rimStrength: 0.9,
    specularStrength: 0.58,
  },
  vorgh: {
    keyColor: '#ffe2d8',
    fillColor: '#3b2733',
    bounceColor: '#5e1c26',
    rimColor: '#ff3d5e',
    accentColor: '#ff7a8c',
    // Dark hide: needs the most lift to stay off the background.
    keyStrength: 1.5,
    fillStrength: 0.52,
    exposure: 1.14,
    rimStrength: 1.0,
    specularStrength: 0.44,
  },
};
