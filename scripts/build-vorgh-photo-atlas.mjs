import path from 'node:path';
import sharp from 'sharp';
import { PixelCanvas } from './mim/canvas.mjs';

const COLUMNS = 6;
const ROWS = 8;
const CELL = 40;
const SCALE = 4;
const FLOOR = 35;

const P = {
  ink: [5, 4, 8, 255],
  armourDeep: [38, 18, 25, 255],
  armour: [82, 35, 44, 255],
  armourLit: [143, 61, 67, 255],
  steel: [99, 98, 112, 255],
  steelLit: [181, 179, 190, 255],
  skin: [185, 126, 106, 255],
  skinShade: [111, 69, 65, 255],
  hair: [27, 20, 31, 255],
  hairLit: [69, 53, 70, 255],
  scarf: [191, 37, 43, 255],
  scarfLit: [244, 83, 67, 255],
  rage: [255, 68, 24, 255],
  rageHot: [255, 175, 66, 255],
  rageCore: [255, 239, 183, 255],
};

const atlas = new PixelCanvas(COLUMNS * CELL, ROWS * CELL);
for (let frame = 0; frame < COLUMNS * ROWS; frame += 1) {
  const cell = drawFrame(frame);
  atlas.blit(cell, (frame % COLUMNS) * CELL, Math.floor(frame / COLUMNS) * CELL);
}

const output = path.resolve('public/sprites/photo-fighters/vorgh-atlas.png');
const enlarged = atlas.scaled(SCALE);
await sharp(Buffer.from(enlarged.data), {
  raw: { width: enlarged.width, height: enlarged.height, channels: 4 },
})
  .png({ palette: true, compressionLevel: 9, effort: 10 })
  .toFile(output);

console.log(`Built ${String(COLUMNS * ROWS)} pixel-animation frames for Vorgh.`);

function drawFrame(frame) {
  const canvas = new PixelCanvas(CELL, CELL);
  const pose = poseFor(frame);
  drawScarf(canvas, pose);
  drawLimb(canvas, pose.backLeg, false, true);
  drawLimb(canvas, pose.backArm, false, false);
  drawBody(canvas, pose);
  drawLimb(canvas, pose.frontLeg, true, true);
  drawLimb(canvas, pose.frontArm, true, false);
  canvas.rim(0, -1, P.armourLit, P.rageCore);
  canvas.rim(1, 0, P.rage, P.rageHot);
  canvas.outline(P.ink);
  return canvas;
}

function poseFor(frame) {
  const bob = frame % 2;
  const base = {
    hip: [19, 24 + bob], shoulder: [20, 14 + bob], head: [22, 8 + bob],
    backArm: [[17, 15], [14, 21], [18, 24]],
    frontArm: [[23, 15], [27, 19], [25, 23]],
    backLeg: [[17, 24], [14, 30], [13, FLOOR]],
    frontLeg: [[21, 24], [24, 30], [25, FLOOR]],
    scarf: [[18, 13], [12, 15], [7, 18]], lean: 0,
  };

  if ([1, 2].includes(frame)) {
    base.hip = [18, 24]; base.shoulder = [20, 14]; base.head = [22, 8];
    base.frontArm = frame === 1
      ? [[23, 15], [29, 14], [33, 15]]
      : [[23, 15], [18, 19], [16, 23]];
  } else if (frame === 3) {
    base.hip = [18, 24]; base.frontLeg = [[21, 24], [27, 27], [31, 24]];
    base.frontArm = [[23, 15], [26, 20], [23, 23]];
  } else if ([4, 22].includes(frame)) {
    base.hip = [18, 23]; base.shoulder = [20, 14];
    base.frontLeg = frame === 4
      ? [[21, 23], [26, 17], [30, 8]]
      : [[21, 23], [26, 21], [30, 16]];
  } else if ([5, 25].includes(frame)) {
    base.hip = [18, 29]; base.shoulder = [20, 21]; base.head = [22, 15];
    base.backLeg = [[17, 29], [13, 33], [10, FLOOR]];
    base.frontLeg = frame === 5
      ? [[20, 29], [27, 33], [31, 34]]
      : [[20, 29], [24, 32], [28, FLOOR]];
  } else if ([7, 10].includes(frame)) {
    const crouch = frame === 10 ? 6 : 0;
    base.hip = [18, 24 + crouch]; base.shoulder = [20, 15 + crouch];
    base.head = [21, 9 + crouch];
    base.frontArm = [[22, 16 + crouch], [26, 13 + crouch], [28, 9 + crouch]];
    base.backArm = [[18, 16 + crouch], [22, 19 + crouch], [26, 17 + crouch]];
  } else if ([13, 20].includes(frame)) {
    base.hip = [20, 29]; base.shoulder = [17, 24]; base.head = [13, 21];
    base.frontLeg = [[21, 29], [27, 31], [30, 34]];
    base.backLeg = [[19, 29], [14, 33], [9, 35]];
  } else if ([14, 15].includes(frame)) {
    // The world-space fighter root already performs the jump. Keeping the
    // drawing inside its cell prevents the crown leaking into another frame.
    const rise = 0;
    base.hip = [19, 24 + rise]; base.shoulder = [20, 14 + rise]; base.head = [22, 8 + rise];
    base.backLeg = [[17, 24 + rise], [13, 29 + rise], [18, 32 + rise]];
    base.frontLeg = [[21, 24 + rise], [26, 28 + rise], [29, 23 + rise]];
  } else if ([30, 32].includes(frame)) {
    base.hip = [18, 27]; base.shoulder = [20, 18]; base.head = [21, 12];
    base.frontArm = frame === 30
      ? [[23, 18], [28, 13], [29, 7]]
      : [[23, 18], [30, 9], [34, 6]];
  } else if ([33, 34].includes(frame)) {
    base.hip = [17, 25]; base.shoulder = [20, 15]; base.head = [22, 9];
    base.frontArm = frame === 34
      ? [[23, 16], [29, 18], [33, 21]]
      : [[23, 16], [18, 18], [15, 21]];
  } else if ([36, 37, 38].includes(frame)) {
    const step = frame === 37 ? 3 : frame === 38 ? -2 : 0;
    base.backLeg = [[17, 24], [14 - step, 30], [13 - step, FLOOR]];
    base.frontLeg = [[21, 24], [24 + step, 30], [25 + step, FLOOR]];
    base.scarf = [[18, 13], [11, 14], [5, 15]];
  }
  return base;
}

function drawBody(canvas, pose) {
  const [hx, hy] = pose.hip;
  const [sx, sy] = pose.shoulder;
  const [headX, headY] = pose.head;
  canvas.capsule(hx, hy, sx, sy, 5.3, P.armourDeep);
  canvas.polygon([[sx - 5, sy - 2], [sx + 7, sy - 1], [hx + 5, hy], [hx - 4, hy]], P.armour);
  canvas.polygon([[sx + 2, sy - 1], [sx + 7, sy], [hx + 5, hy - 1], [hx + 2, hy - 1]], P.armourLit);
  canvas.rect(hx - 5, hy - 1, 10, 3, P.ink);
  canvas.line(sx, sy, hx + 1, hy - 3, P.rage);
  canvas.set(sx + 1, sy + 2, P.rageCore);

  canvas.capsule(sx, sy - 1, headX, headY + 3, 2.2, P.skinShade);
  canvas.ellipse(headX, headY, 4.8, 5.3, P.skin);
  canvas.polygon([[headX - 5, headY - 5], [headX + 2, headY - 6], [headX + 5, headY - 2], [headX - 4, headY - 1]], P.hair);
  canvas.polygon([[headX - 5, headY + 1], [headX + 4, headY + 2], [headX + 4, headY + 5], [headX - 3, headY + 4]], P.steel);
  canvas.set(headX + 3, headY, P.rageCore);
  canvas.set(headX + 4, headY, P.rage);
  for (const [dx, dy] of [[-4, -2], [-6, 1], [-7, 4]]) {
    canvas.capsule(headX + dx, headY - 3, headX + dx - 3, headY + dy + 5, 1.2, P.hairLit);
  }
}

function drawLimb(canvas, points, front, leg) {
  const [a, b, c] = points;
  const base = front ? P.armour : P.armourDeep;
  const trim = front ? P.steel : P.armour;
  canvas.capsule(a[0], a[1], b[0], b[1], leg ? 3 : 2.3, base);
  canvas.disc(b[0], b[1], leg ? 3.2 : 2.6, trim);
  canvas.capsule(b[0], b[1], c[0], c[1], leg ? 2.6 : 2.1, base);
  if (leg) {
    canvas.capsule(c[0] - 1, c[1], c[0] + 4, c[1], 2.1, P.steel);
  } else {
    const dx = c[0] - b[0];
    const dy = c[1] - b[1];
    const length = Math.hypot(dx, dy) || 1;
    const ux = dx / length;
    const uy = dy / length;
    for (const spread of [-1.2, 0, 1.2]) {
      canvas.line(c[0], c[1] + spread, c[0] + ux * 4, c[1] + uy * 4 + spread, P.steelLit);
    }
  }
  if (front) canvas.set(b[0] + 1, b[1] - 1, P.rageHot);
}

function drawScarf(canvas, pose) {
  const [a, b, c] = pose.scarf;
  canvas.capsule(a[0], a[1], b[0], b[1], 2.3, P.scarf);
  canvas.capsule(b[0], b[1], c[0], c[1], 1.6, P.scarf);
  canvas.line(a[0], a[1] - 1, c[0], c[1] - 1, P.scarfLit);
}
