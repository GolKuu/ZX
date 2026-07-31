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

function drawBraids(canvas, pose) {
  const [hx, hy] = pose.head;
  const sweep = pose.braidSweep;
  for (const [index, spec] of [
    { drop: 1, reach: 21, sag: 7 },
    { drop: 4, reach: 25, sag: 10 },
    { drop: 7, reach: 20, sag: 13 },
    { drop: 9, reach: 15, sag: 15 },
  ].entries()) {
    let previous = [hx - 2, hy + spec.drop];
    for (let step = 1; step <= 7; step += 1) {
      const t = step / 7;
      const point = [
        hx - 2 - spec.reach * t * Math.cos(sweep),
        hy + spec.drop + spec.sag * t * t - spec.reach * t * Math.sin(sweep),
      ];
      canvas.capsule(
        previous[0], previous[1], point[0], point[1],
        1.6 - t * 0.5,
        step % 2 === 0 ? 'navy' : 'navyDeep',
      );
      previous = point;
    }
    canvas.set(previous[0], previous[1], index % 2 === 0 ? 'cyan' : 'cyanDeep');
  }
}

function drawSash(canvas, pose) {
  const [wx, wy] = pose.waist;
  const sweep = pose.sashSweep;
  let previous = [wx - 3, wy + 2];
  for (let step = 1; step <= 9; step += 1) {
    const t = step / 9;
    const point = [
      wx - 3 - 28 * t * Math.cos(sweep),
      wy + 2 + 18 * t * t - 28 * t * Math.sin(sweep),
    ];
    canvas.capsule(
      previous[0], previous[1], point[0], point[1],
      3.2 - t * 2,
      step % 3 === 0 ? 'cyanDeep' : 'violetDeep',
    );
    if (step === 3 || step === 6) canvas.set(point[0], point[1] - 1, 'violet');
    previous = point;
  }
}

function drawArm(canvas, limb, side) {
  const cloth = side === 'front' ? 'cloth' : 'clothMid';
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
  canvas.polygon([
    [wx - 7, wy + 1], [wx + 8, wy + 1], [wx + 7, wy + 10], [wx - 6, wy + 10],
  ], 'navy');
  canvas.polygon([
    [wx - 7, wy + 2], [wx - 2, wy + 3], [wx - 4, wy + 17], [wx - 9, wy + 13],
  ], 'cloth');
  canvas.polygon([
    [wx + 4, wy + 2], [wx + 8, wy + 2], [wx + 7, wy + 12], [wx + 4, wy + 10],
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
  canvas.capsule(nx, ny, hx, hy, 2, 'skinShade');
  canvas.polygon([
    [hx - 8, hy + 2], [hx - 2, hy - 6], [hx + 3, hy - 4],
    [hx + 4, hy + 8], [hx - 6, hy + 10],
  ], 'navyDeep');
  canvas.ellipse(hx, hy, 6, 7.5, 'maskLit');
  canvas.polygon([
    [hx - 6, hy + 1], [hx - 1, hy + 8], [hx - 6, hy + 7],
  ], 'maskShade');
  drawGlyph(canvas, hx, hy);
}

/**
 * The mask mark: a slashed diamond over the eye line.
 *
 * It has to be a shape, not a dot — at fighting-game size a single cyan pixel
 * reads as noise, and the mask is the one place MIM must stay recognisable.
 */
function drawGlyph(canvas, hx, hy) {
  canvas.set(hx + 2, hy - 3, 'cyanDeep');
  canvas.set(hx + 1, hy - 2, 'cyan');
  canvas.set(hx + 2, hy - 2, 'cyanGlow');
  canvas.set(hx + 3, hy - 2, 'cyan');
  canvas.set(hx + 2, hy - 1, 'cyanGlow');
  canvas.set(hx + 3, hy, 'cyan');
  canvas.set(hx + 4, hy + 1, 'cyanDeep');
  // Second, quieter mark on the far cheek keeps the mask asymmetric.
  canvas.set(hx - 2, hy - 1, 'cyanDeep');
  canvas.set(hx - 2, hy, 'cyanDeep');
}
