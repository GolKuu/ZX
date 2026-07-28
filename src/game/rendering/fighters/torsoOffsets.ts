export type TorsoOffset = { x: number; y: number; scale: number };

export const TORSO_OFFSETS: Record<string, TorsoOffset> = {
  granite: { x: 0, y: -10, scale: 0.5 },
  shira: { x: 0, y: -12, scale: 0.52 },
  caliber: { x: -4, y: -8, scale: 0.5 },
  zephyr: { x: 4, y: -8, scale: 0.49 },
  volt: { x: 0, y: -9, scale: 0.5 },
};

export default TORSO_OFFSETS;
