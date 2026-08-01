import { THICKNESS } from './rig-spec.mjs';

/**
 * Draw a whole figure from a solved skeleton, in the same visual language as
 * the cut-out parts: white jacket brightest, navy trousers widest, cyan only on
 * edges and tips.
 */
export function drawPose(canvas, pose) {
  drawFigure(canvas, pose);
  // Cold key light from the front and above, then the contour.
  canvas.rim(0, -1, 'cyanDeep', 'clothLit');
  canvas.rim(1, 0, 'cyan', 'clothLit');
}

function drawFigure(canvas, pose) {
  drawBraids(canvas, pose);
  drawArm(canvas, pose.back, 'back');
  drawLeg(canvas, pose.back, 'back');
  drawSash(canvas, pose);
  drawCoat(canvas, pose);
  drawTorso(canvas, pose);
  drawHead(canvas, pose);
  drawLeg(canvas, pose.front, 'front');
  drawArm(canvas, pose.front, 'front');
}

/**
 * Cloth cannot hang below the ground it is standing on.
 *
 * In the deep capoeira squat the waist drops close to the floor, and a coat
 * tail authored as a rigid panel would pass straight through it. Folding the
 * cloth at the floor row is both the physically honest reading and the only way
 * the low poses keep a clean ground line.
 */
function folded(pose) {
  const limit = pose.floor ?? Number.POSITIVE_INFINITY;
  return (x, y) => [x, Math.min(y, limit)];
}

function drawBraids(canvas, pose) {
  const [hx, hy] = pose.head;
  const sweep = pose.braidSweep;
  const fold = folded(pose);
  for (const [index, spec] of [
    { drop: 3, reach: 25, sag: 8, width: 3.8 },
    { drop: 7, reach: 30, sag: 12, width: 3.2 },
  ].entries()) {
    // Fan the strands apart. Swinging all four through the same angle collapses
    // them into one slab exactly when the pose is most extreme, and the braid
    // cluster is the character's signature silhouette element.
    const strandSweep = sweep + index * 0.15 - 0.22;
    let previous = fold(hx - 2, hy + spec.drop);
    for (let step = 1; step <= 7; step += 1) {
      const t = step / 7;
      const point = fold(
        hx - 2 - spec.reach * t * Math.cos(strandSweep),
        hy + spec.drop + spec.sag * t * t - spec.reach * t * Math.sin(strandSweep),
      );
      canvas.capsule(
        previous[0], previous[1], point[0], point[1],
        spec.width - t * 1.8,
        step % 3 === 0 ? 'maskShade' : 'maskLit',
      );
      previous = point;
    }
    canvas.set(previous[0], previous[1], index % 2 === 0 ? 'cyan' : 'cyanDeep');
  }
}

/**
 * The sash, with a lag pass.
 *
 * The length is driven by how hard the pose is swinging, not just its angle.
 * Parented rigidly to the pelvis the cloth only ever rotates, so it is at its
 * shortest on the very frames it should be longest — trailing cloth reaches its
 * full extension at contact and through the follow-through, which is the whole
 * reason a fighter wears any.
 */
function drawSash(canvas, pose) {
  const [wx, wy] = pose.waist;
  const sweep = pose.sashSweep;
  const fold = folded(pose);
  const reach = 26 + Math.abs(sweep) * 20;
  let previous = fold(wx - 3, wy + 2);
  for (let step = 1; step <= 9; step += 1) {
    const t = step / 9;
    const point = fold(
      wx - 3 - reach * t * Math.cos(sweep),
      wy + 2 + 18 * t * t - reach * t * Math.sin(sweep),
    );
    canvas.capsule(
      previous[0], previous[1], point[0], point[1],
      3.2 - t * 2,
      step % 3 === 0 ? 'cyanDeep' : 'violetDeep',
    );
    // The reference's lighter violet lives on the upper edge of the cloth.
    if (step % 2 === 1) canvas.set(point[0], point[1] - 1, 'violet');
    previous = point;
  }
}

function drawArm(canvas, limb, side) {
  const cloth = side === 'front' ? 'maskLit' : 'maskShade';
  const dark = side === 'front' ? 'navy' : 'navyDeep';
  canvas.capsule(
    limb.shoulder[0], limb.shoulder[1], limb.elbow[0], limb.elbow[1],
    THICKNESS.upperArm, cloth,
  );
  canvas.disc(limb.shoulder[0], limb.shoulder[1], 3.2, cloth);
  canvas.capsule(
    limb.elbow[0], limb.elbow[1], limb.wrist[0], limb.wrist[1],
    THICKNESS.forearm, dark,
  );
  // Cyan cuff, glove, then two pixels of bare finger — the fingerless glove
  // reads at this size only if the skin stays smaller than the cuff.
  const cuff = [
    limb.wrist[0] - (limb.wrist[0] - limb.elbow[0]) * 0.28,
    limb.wrist[1] - (limb.wrist[1] - limb.elbow[1]) * 0.28,
  ];
  canvas.disc(cuff[0], cuff[1], 2.4, 'cyanDeep');
  canvas.disc(limb.wrist[0], limb.wrist[1], THICKNESS.hand, dark);
  canvas.disc(
    limb.wrist[0] + (limb.wrist[0] - limb.elbow[0]) * 0.1,
    limb.wrist[1] + (limb.wrist[1] - limb.elbow[1]) * 0.1,
    1.1,
    side === 'front' ? 'skin' : 'skinShade',
  );
  canvas.disc(limb.shoulder[0], limb.shoulder[1], 1.4, 'cyanDeep');
}

function drawLeg(canvas, limb, side) {
  const dark = side === 'front' ? 'navy' : 'navyDeep';
  const cloth = side === 'front' ? 'cloth' : 'clothMid';
  canvas.capsule(
    limb.hip[0], limb.hip[1], limb.knee[0], limb.knee[1],
    THICKNESS.thigh, dark,
  );
  canvas.capsule(
    limb.knee[0], limb.knee[1], limb.ankle[0], limb.ankle[1],
    THICKNESS.shin, dark,
  );
  // Ankle band and shoe, oriented along the shin so the foot never detaches.
  const dx = limb.ankle[0] - limb.knee[0];
  const dy = limb.ankle[1] - limb.knee[1];
  const length = Math.hypot(dx, dy) || 1;
  // The knee break.
  //
  // An extended leg puts thigh and shin nearly in line, and without a joint mark
  // the two capsules render as one uniform tube — a plank, which reads as longer
  // and slower than the leg actually is. A dark line across the limb at the knee
  // restores the two-segment read exactly when the leg is straightest.
  const acrossX = -(dy / length);
  const acrossY = dx / length;
  canvas.line(
    limb.knee[0] - acrossX * 3.4, limb.knee[1] - acrossY * 3.4,
    limb.knee[0] + acrossX * 3.4, limb.knee[1] + acrossY * 3.4,
    'ink',
  );
  canvas.set(
    limb.knee[0] + acrossX * 1.6, limb.knee[1] + acrossY * 1.6,
    side === 'front' ? 'cyan' : 'cyanDeep',
  );
  const toe = [
    limb.ankle[0] - (dy / length) * 5,
    limb.ankle[1] + (dx / length) * 5,
  ];
  canvas.capsule(
    limb.knee[0] + (dx / length) * (length - 5),
    limb.knee[1] + (dy / length) * (length - 5),
    limb.ankle[0], limb.ankle[1], 2.9, 'cyan',
  );
  canvas.capsule(limb.ankle[0], limb.ankle[1], toe[0], toe[1], 2.9, cloth);
  canvas.capsule(
    limb.ankle[0], limb.ankle[1] + 1, toe[0], toe[1] + 1, 1.1, 'cyanDeep',
  );
}

function drawCoat(canvas, pose) {
  const [wx, wy] = pose.waist;
  const fold = folded(pose);
  canvas.polygon([
    fold(wx - 7, wy + 1), fold(wx + 8, wy + 1),
    fold(wx + 7, wy + 10), fold(wx - 6, wy + 10),
  ], 'navy');
  canvas.polygon([
    fold(wx - 7, wy + 2), fold(wx - 2, wy + 3),
    fold(wx - 4, wy + 17), fold(wx - 9, wy + 13),
  ], 'cloth');
  canvas.polygon([
    fold(wx + 4, wy + 2), fold(wx + 8, wy + 2),
    fold(wx + 7, wy + 12), fold(wx + 4, wy + 10),
  ], 'clothMid');
}

function drawTorso(canvas, pose) {
  const [wx, wy] = pose.waist;
  const [nx, ny] = pose.neck;
  canvas.capsule(wx, wy, nx, ny, THICKNESS.torso, 'navyDeep');
  const dx = (nx - wx) / 4;
  const dy = (ny - wy) / 4;
  canvas.polygon([
    [nx - 7 + dx, ny + 1], [nx + 8, ny], [wx + 7, wy - 1], [wx - 5, wy],
  ], 'cloth');
  canvas.polygon([
    [nx - 7 + dx, ny + 2], [nx - 3, ny + 3], [wx - 4, wy - 1], [wx - 6, wy],
  ], 'clothShade');
  canvas.line(nx - 6, ny + 1, nx + 7, ny, 'cyan');
  canvas.set(nx + 2 - dx, ny + 8 - dy, 'cyanGlow');
  canvas.set(nx + 2 - dx, ny + 9 - dy, 'cyan');
  canvas.rect(wx - 7, wy - 3, 15, 3, 'ink');
  canvas.set(wx + 1, wy - 2, 'cyan');
}

function drawHead(canvas, pose) {
  const [hx, hy] = pose.head;
  const [nx, ny] = pose.neck;
  // A dark collar shaft and a dark rim around the mask.
  //
  // The mask and the jacket are both near-white, so in any leaned or horizontal
  // pose they merge into one mass and the character loses its head — worst of
  // all on the contact frames, where the pose is most extreme. These two marks
  // cost a few pixels and guarantee the break in every orientation, instead of
  // relying on the upright silhouette to provide it.
  canvas.capsule(nx, ny, hx, hy, 3.4, 'ink');
  canvas.capsule(nx, ny, hx, hy, 2, 'skinShade');
  canvas.polygon([
    [hx - 8, hy + 2], [hx - 2, hy - 6], [hx + 3, hy - 4],
    [hx + 4, hy + 8], [hx - 6, hy + 10],
  ], 'navyDeep');
  canvas.ellipse(hx, hy, 7, 8.6, 'ink');
  canvas.ellipse(hx, hy, 6, 7.5, 'maskLit');
  canvas.polygon([
    [hx - 6, hy + 1], [hx - 1, hy + 8], [hx - 6, hy + 7],
  ], 'maskShade');
  drawGlyph(canvas, hx, hy);
}

/**
 * MIM's two simple eye slots stay readable in every pose and facing.
 */
function drawGlyph(canvas, hx, hy) {
  canvas.rect(hx - 3, hy - 2, 1, 4, 'ink');
  canvas.rect(hx + 2, hy - 2, 1, 4, 'ink');
}
