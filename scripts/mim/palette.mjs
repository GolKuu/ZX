/**
 * MIM's palette — sixteen colours, no more.
 *
 * MIM's refreshed identity is sunshine yellow over royal purple, with white
 * sneakers and an ink outline. A tight ramp keeps clusters readable at fighting-game
 * sizes; every additional hue costs silhouette clarity.
 */
export const PALETTE = {
  none: [0, 0, 0, 0],

  ink: [6, 9, 18, 255],
  // The trousers carry most of the body area, so their ramp has to stay well
  // clear of the arena's dark background or the legs vanish in silhouette.
  navyDeep: [45, 16, 91, 255],
  navy: [91, 35, 169, 255],
  navyLit: [139, 76, 219, 255],

  clothLit: [184, 115, 255, 255],
  cloth: [119, 50, 205, 255],
  clothMid: [85, 31, 156, 255],
  clothShade: [65, 24, 126, 255],
  clothDeep: [36, 13, 76, 255],

  maskLit: [255, 221, 42, 255],
  maskShade: [224, 159, 16, 255],

  cyanGlow: [255, 244, 132, 255],
  cyan: [255, 211, 30, 255],
  cyanDeep: [205, 126, 9, 255],

  violet: [255, 226, 53, 255],
  violetDeep: [230, 165, 14, 255],

  skin: [255, 218, 36, 255],
  skinShade: [211, 143, 11, 255],
};

/** Translucent plane fills, drawn by the renderer rather than baked. */
export const WALL_COLOURS = {
  standard: '#45d9f5',
  shield: '#9df3ff',
  moving: '#8b7ce4',
  rear: '#1b8fbe',
  platform: '#ccd7ea',
  run: '#45d9f5',
  prison: '#5b4fa8',
  ultimate: '#ffffff',
};

export function rgba(name) {
  const colour = PALETTE[name];
  if (colour === undefined) throw new Error(`Unknown palette colour "${name}"`);
  return colour;
}
