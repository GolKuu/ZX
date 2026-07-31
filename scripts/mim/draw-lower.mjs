import { JOINTS, THICKNESS, fromCrown } from './rig-spec.mjs';

/**
 * Legs. The trousers are deliberately the widest cluster below the belt: baggy
 * capoeira cloth is what sells rotation, and it keeps the thin calf from
 * reading as a stick when the leg extends.
 */
export function drawThigh(canvas, side) {
  const hip = side === 'front' ? JOINTS.hipFront : JOINTS.hipBack;
  const knee = side === 'front' ? JOINTS.kneeFront : JOINTS.kneeBack;
  const tone = side === 'front' ? 'navy' : 'navyDeep';
  // Baggy: wide at the hip, still loose at the knee.
  canvas.capsule(hip[0], hip[1], knee[0], knee[1] - 4, THICKNESS.thigh, tone);
  canvas.capsule(hip[0], knee[1] - 6, knee[0], knee[1], 4.1, tone);
  canvas.capsule(
    hip[0] + 2, hip[1] + 3, knee[0] + 2, knee[1] - 5,
    1, side === 'front' ? 'navyLit' : 'navy',
  );
  // Fold lines: two dark creases keep the wide cloth from reading as a slab.
  canvas.line(hip[0] - 3, hip[1] + 8, knee[0] - 2, knee[1] - 8, 'ink');
  canvas.set(knee[0] + 3, knee[1] - 3, 'cyanDeep');
}

export function drawShin(canvas, side) {
  const knee = side === 'front' ? JOINTS.kneeFront : JOINTS.kneeBack;
  const ankle = side === 'front' ? JOINTS.ankleFront : JOINTS.ankleBack;
  const tone = side === 'front' ? 'navy' : 'navyDeep';
  const cloth = side === 'front' ? 'cloth' : 'clothMid';
  canvas.capsule(knee[0], knee[1], ankle[0], ankle[1] - 4, THICKNESS.shin, tone);
  canvas.capsule(
    knee[0] + 1, knee[1] + 2, ankle[0] + 1, ankle[1] - 6,
    0.8, 'navyLit',
  );
  // Cyan ankle band, then the shoe.
  canvas.rect(ankle[0] - 3, ankle[1] - 5, 6, 1, 'cyan');
  drawShoe(canvas, ankle, cloth, side);
}

function drawShoe(canvas, ankle, cloth, side) {
  const [ax] = ankle;
  const floor = fromCrown(96);
  canvas.polygon([
    [ax - 3, floor - 6], [ax + 3, floor - 6],
    [ax + 6, floor - 2], [ax + 6, floor - 1],
    [ax - 4, floor - 1], [ax - 4, floor - 5],
  ], cloth);
  canvas.polygon([
    [ax - 4, floor - 3], [ax + 6, floor - 2],
    [ax + 6, floor - 1], [ax - 4, floor - 1],
  ], side === 'front' ? 'clothShade' : 'clothDeep');
  // Sole light.
  canvas.line(ax - 4, floor - 1, ax + 5, floor - 1, 'cyanDeep');
  canvas.set(ax + 2, floor - 4, 'cyan');
}
