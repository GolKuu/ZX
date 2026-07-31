/**
 * MIM's palette — sixteen colours, no more.
 *
 * Cold cyan, white, dark indigo and black, with violet reserved for the energy
 * cloth. A tight ramp is what keeps pixel clusters readable at fighting-game
 * sizes; every additional hue costs silhouette clarity.
 */
export const PALETTE = {
  none: [0, 0, 0, 0],

  ink: [7, 10, 20, 255],
  navyDeep: [16, 22, 42, 255],
  navy: [27, 37, 64, 255],
  navyLit: [42, 55, 87, 255],

  clothLit: [255, 255, 255, 255],
  cloth: [242, 246, 255, 255],
  clothMid: [204, 215, 234, 255],
  clothShade: [154, 169, 198, 255],
  clothDeep: [107, 120, 152, 255],

  maskLit: [247, 251, 255, 255],
  maskShade: [195, 205, 223, 255],

  cyanGlow: [157, 243, 255, 255],
  cyan: [69, 217, 245, 255],
  cyanDeep: [27, 143, 190, 255],

  violet: [139, 124, 228, 255],
  violetDeep: [91, 79, 168, 255],

  skin: [192, 141, 110, 255],
  skinShade: [142, 99, 80, 255],
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
