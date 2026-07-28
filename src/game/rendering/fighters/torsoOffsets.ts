export type TorsoOffset = { x: number; y: number; scale: number };

export const TORSO_OFFSETS: Record<string, TorsoOffset> = {
  granite: { x: 0, y: -10, scale: 0.52 },
  caliber: { x: -6, y: -8, scale: 0.5 },
  volt: { x: 2, y: -9, scale: 0.5 },
  nocturne: { x: 0, y: -11, scale: 0.5 },
  ragnar: { x: -2, y: -12, scale: 0.53 },
  marina: { x: 1, y: -9, scale: 0.5 },
  zephyr: { x: 4, y: -8, scale: 0.49 },
  origami: { x: 0, y: -10, scale: 0.5 },
  poro: { x: 0, y: -6, scale: 0.48 },
  fenr: { x: -3, y: -11, scale: 0.51 },
  sylvan: { x: 0, y: -9, scale: 0.5 },
  adamant: { x: 0, y: -12, scale: 0.53 },
  vassa: { x: 2, y: -10, scale: 0.5 },
  shira: { x: 0, y: -12, scale: 0.54 },
  pyron: { x: -1, y: -9, scale: 0.5 },
};

export default TORSO_OFFSETS;
