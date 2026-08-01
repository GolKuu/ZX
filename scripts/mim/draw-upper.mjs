import { JOINTS, THICKNESS, fromCrown } from './rig-spec.mjs';

/**
 * Head, braids, torso and arms.
 *
 * MIM reads as a mask on a long neck over a bright asymmetric jacket: the white
 * chest panel is the brightest cluster on the character, so the eye finds the
 * torso first and the limbs read as motion around it.
 */
export function drawHead(canvas) {
  const [cx, cy] = JOINTS.headCentre;
  // Purple hood collar behind the sunny mask, so the face never floats.
  canvas.polygon([
    [cx - 8, cy + 2], [cx - 2, cy - 6], [cx + 3, cy - 4],
    [cx + 4, cy + 8], [cx - 6, cy + 10],
  ], 'navyDeep');
  canvas.ellipse(cx, cy, 6, 7.5, 'maskLit');
  // Light comes from the front and above: the shade sits low and back.
  canvas.polygon([
    [cx - 6, cy + 1], [cx - 1, cy + 8], [cx - 6, cy + 7],
  ], 'maskShade');
  canvas.rect(cx - 5, cy + 6, 9, 2, 'maskShade');
  // Two vertical eye slots are MIM's friendly, unmistakable signature.
  canvas.rect(cx - 3, cy - 2, 1, 4, 'ink');
  canvas.rect(cx + 2, cy - 2, 1, 4, 'ink');
  // Neck.
  canvas.capsule(cx, cy + 7, cx, fromCrown(18), 2, 'skinShade');
}

export function drawBraids(canvas) {
  const [rx, ry] = JOINTS.braidRoot;
  const strands = [
    { drop: 4, reach: 25, sag: 7, width: 3.8 },
    { drop: 8, reach: 30, sag: 12, width: 3.2 },
  ];
  for (const [index, strand] of strands.entries()) {
    let previous = [rx, ry + strand.drop];
    const segments = 7;
    for (let step = 1; step <= segments; step += 1) {
      const t = step / segments;
      const point = [
        rx - strand.reach * t,
        ry + strand.drop + strand.sag * t * t,
      ];
      canvas.capsule(
        previous[0], previous[1], point[0], point[1],
        strand.width - t * 1.8,
        step % 3 === 0 ? 'maskShade' : 'maskLit',
      );
      previous = point;
    }
    canvas.set(previous[0], previous[1], index % 2 === 0 ? 'cyan' : 'cyanDeep');
  }
}

export function drawTorso(canvas) {
  const shoulder = fromCrown(19);
  const waist = fromCrown(46);
  const cx = JOINTS.waist[0];
  // Dark underlayer first — the jacket is cut away over it.
  canvas.polygon([
    [cx - 8, shoulder], [cx + 8, shoulder],
    [cx + 6, waist], [cx - 6, waist],
  ], 'navyDeep');
  // Oversized purple hoodie, asymmetric enough to preserve the fighting silhouette.
  canvas.polygon([
    [cx - 7, shoulder + 1], [cx + 8, shoulder],
    [cx + 7, waist - 2], [cx + 1, waist],
    [cx - 5, waist - 6], [cx - 8, shoulder + 9],
  ], 'cloth');
  canvas.polygon([
    [cx - 7, shoulder + 2], [cx - 3, shoulder + 3],
    [cx - 4, waist - 7], [cx - 8, shoulder + 10],
  ], 'clothShade');
  canvas.polygon([
    [cx + 4, shoulder + 1], [cx + 8, shoulder + 1],
    [cx + 7, waist - 4],
  ], 'clothLit');
  // Yellow drawstrings and chest badge connect the torso to the mask and scarf.
  canvas.line(cx - 6, shoulder + 1, cx + 7, shoulder, 'cyan');
  canvas.set(cx + 2, shoulder + 8, 'cyanGlow');
  canvas.set(cx + 3, shoulder + 9, 'cyan');
  canvas.set(cx + 2, shoulder + 10, 'cyan');
  canvas.set(cx + 1, shoulder + 9, 'cyanDeep');
  // Belt.
  canvas.rect(cx - 7, waist - 3, 15, 3, 'ink');
  canvas.rect(cx + 1, waist - 2, 2, 1, 'cyan');
}

export function drawHips(canvas) {
  const top = fromCrown(45);
  const cx = JOINTS.waist[0];
  canvas.polygon([
    [cx - 7, top], [cx + 8, top], [cx + 7, top + 9], [cx - 6, top + 9],
  ], 'navy');
  // Coat tails: two white panels, the rear one longer so the back reads long.
  canvas.polygon([
    [cx - 7, top + 1], [cx - 2, top + 2], [cx - 4, top + 17], [cx - 9, top + 13],
  ], 'cloth');
  canvas.polygon([
    [cx - 7, top + 1], [cx - 5, top + 2], [cx - 6, top + 14], [cx - 9, top + 13],
  ], 'clothShade');
  canvas.polygon([
    [cx + 4, top + 1], [cx + 8, top + 1], [cx + 7, top + 12], [cx + 4, top + 10],
  ], 'cloth');
  canvas.line(cx - 4, top + 16, cx - 8, top + 13, 'cyanDeep');
}

export function drawSash(canvas) {
  const [rx, ry] = JOINTS.sashRoot;
  let previous = [rx, ry];
  const segments = 9;
  for (let step = 1; step <= segments; step += 1) {
    const t = step / segments;
    const point = [rx - 30 * t, ry + 20 * t * t - 4 * t];
    canvas.capsule(
      previous[0], previous[1], point[0], point[1],
      3.2 - t * 2,
      step % 3 === 0 ? 'cyanDeep' : 'violetDeep',
    );
    previous = point;
  }
  // Diamond glyphs along the cloth, in the reference's violet-to-cyan drift.
  for (const [index, t] of [0.25, 0.5, 0.75].entries()) {
    const x = rx - 30 * t;
    const y = ry + 20 * t * t - 4 * t;
    canvas.set(x, y - 1, index === 1 ? 'cyan' : 'violet');
    canvas.set(x - 1, y, 'violet');
    canvas.set(x + 1, y, 'violet');
    canvas.set(x, y + 1, 'cyanDeep');
  }
}

export function drawUpperArm(canvas, side) {
  const shoulder = side === 'front' ? JOINTS.shoulderFront : JOINTS.shoulderBack;
  const elbow = side === 'front' ? JOINTS.elbowFront : JOINTS.elbowBack;
  const tone = side === 'front' ? 'cloth' : 'clothMid';
  canvas.capsule(
    shoulder[0], shoulder[1], elbow[0], elbow[1],
    THICKNESS.upperArm, tone,
  );
  canvas.capsule(
    shoulder[0] - 1, shoulder[1] + 2, elbow[0] - 1, elbow[1],
    1, side === 'front' ? 'clothShade' : 'clothDeep',
  );
  // Shoulder cap.
  canvas.disc(shoulder[0], shoulder[1], 3.2, side === 'front' ? 'clothLit' : 'cloth');
  canvas.set(shoulder[0] + 2, shoulder[1] + 1, 'cyanDeep');
}

export function drawForearm(canvas, side) {
  const elbow = side === 'front' ? JOINTS.elbowFront : JOINTS.elbowBack;
  const wrist = side === 'front' ? JOINTS.wristFront : JOINTS.wristBack;
  const tone = side === 'front' ? 'navy' : 'navyDeep';
  canvas.capsule(elbow[0], elbow[1], wrist[0], wrist[1], THICKNESS.forearm, tone);
  canvas.capsule(
    elbow[0] + 1, elbow[1] + 2, wrist[0] + 1, wrist[1] - 2,
    0.6, 'navyLit',
  );
  // Cyan cuff band, then the fingerless glove and bare fingers.
  canvas.rect(wrist[0] - 2, wrist[1] - 4, 5, 1, 'cyan');
  canvas.disc(wrist[0], wrist[1], THICKNESS.hand, tone);
  canvas.disc(wrist[0], wrist[1] + 2, 1.8, side === 'front' ? 'skin' : 'skinShade');
}
