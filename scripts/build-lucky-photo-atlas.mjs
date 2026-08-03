import path from 'node:path';
import { PixelCanvas } from './mim/canvas.mjs';

const COLUMNS = 6;
const ROWS = 8;
const CELL = 40;
const SCALE = 4;
const FLOOR = 35;

const P = {
  ink: [4, 9, 8, 255],
  black: [13, 24, 21, 255],
  blackLit: [28, 45, 38, 255],
  greenDeep: [10, 55, 40, 255],
  green: [16, 105, 72, 255],
  greenLit: [36, 165, 113, 255],
  gold: [205, 148, 31, 255],
  goldLit: [255, 222, 117, 255],
  hair: [231, 239, 235, 255],
  hairShade: [151, 174, 165, 255],
  skin: [195, 128, 91, 255],
  skinShade: [126, 76, 56, 255],
  visor: [31, 211, 197, 255],
  visorLit: [159, 255, 239, 255],
};

const atlas = new PixelCanvas(COLUMNS * CELL, ROWS * CELL);
for (let frame = 0; frame < COLUMNS * ROWS; frame += 1) {
  atlas.blit(drawFrame(frame), (frame % COLUMNS) * CELL, Math.floor(frame / COLUMNS) * CELL);
}

await atlas.scaled(SCALE).write(path.resolve('public/sprites/photo-fighters/lucky-atlas.png'));
console.log(`Built ${String(COLUMNS * ROWS)} Lucky animation frames in the shared fighter style.`);

function drawFrame(frame) {
  const canvas = new PixelCanvas(CELL, CELL);
  const pose = poseFor(frame);
  drawCoat(canvas, pose);
  drawLimb(canvas, pose.backLeg, false, true);
  drawLimb(canvas, pose.backArm, false, false);
  drawBody(canvas, pose);
  drawLimb(canvas, pose.frontLeg, true, true);
  drawLimb(canvas, pose.frontArm, true, false);
  canvas.rim(0, -1, P.greenLit, P.hair);
  canvas.rim(1, 0, P.gold, P.goldLit);
  canvas.outline(P.ink);
  return canvas;
}

function poseFor(frame) {
  const bob = frame % 2;
  const pose = {
    hip: [19, 24 + bob], shoulder: [20, 14 + bob], head: [22, 8 + bob],
    backArm: [[18, 15], [15, 20], [17, 24]],
    frontArm: [[23, 15], [27, 19], [25, 23]],
    backLeg: [[17, 24], [14, 30], [13, FLOOR]],
    frontLeg: [[21, 24], [24, 30], [25, FLOOR]],
    coat: [[17, 21], [12, 27], [8, 32]],
  };
  if ([1, 2].includes(frame)) {
    pose.frontArm = frame === 1
      ? [[23, 15], [29, 14], [34, 15]]
      : [[23, 15], [18, 19], [15, 23]];
  } else if (frame === 3) {
    pose.frontLeg = [[21, 24], [27, 27], [33, 24]];
  } else if ([4, 22].includes(frame)) {
    pose.hip = [18, 23];
    pose.frontLeg = frame === 4
      ? [[21, 23], [26, 17], [30, 7]]
      : [[21, 23], [27, 20], [32, 15]];
  } else if ([5, 25].includes(frame)) {
    pose.hip = [18, 29]; pose.shoulder = [20, 21]; pose.head = [22, 15];
    pose.backLeg = [[17, 29], [13, 33], [9, FLOOR]];
    pose.frontLeg = [[20, 29], [26, 32], [32, 34]];
  } else if ([7, 10].includes(frame)) {
    const crouch = frame === 10 ? 6 : 0;
    pose.hip = [18, 24 + crouch]; pose.shoulder = [20, 15 + crouch];
    pose.head = [21, 9 + crouch];
    pose.frontArm = [[22, 16 + crouch], [26, 13 + crouch], [29, 9 + crouch]];
    pose.backArm = [[18, 16 + crouch], [22, 19 + crouch], [27, 17 + crouch]];
  } else if ([13, 20].includes(frame)) {
    pose.hip = [20, 29]; pose.shoulder = [17, 24]; pose.head = [13, 21];
    pose.frontLeg = [[21, 29], [27, 31], [32, 34]];
    pose.backLeg = [[19, 29], [14, 33], [8, FLOOR]];
  } else if ([14, 15].includes(frame)) {
    pose.backLeg = [[17, 24], [13, 29], [18, 32]];
    pose.frontLeg = [[21, 24], [26, 28], [30, 23]];
  } else if ([30, 32].includes(frame)) {
    pose.hip = [18, 27]; pose.shoulder = [20, 18]; pose.head = [21, 12];
    pose.frontArm = [[23, 18], [29, 13], [frame === 32 ? 35 : 31, 7]];
  } else if ([33, 34].includes(frame)) {
    pose.frontArm = frame === 34
      ? [[23, 16], [29, 18], [34, 21]]
      : [[23, 16], [18, 18], [14, 21]];
  } else if ([36, 37, 38].includes(frame)) {
    const step = frame === 37 ? 3 : frame === 38 ? -2 : 0;
    pose.backLeg = [[17, 24], [14 - step, 30], [13 - step, FLOOR]];
    pose.frontLeg = [[21, 24], [24 + step, 30], [25 + step, FLOOR]];
    pose.coat = [[17, 21], [10, 24], [5, 26]];
  }
  return pose;
}

function drawBody(canvas, pose) {
  const [hx, hy] = pose.hip;
  const [sx, sy] = pose.shoulder;
  const [headX, headY] = pose.head;
  canvas.polygon([[sx - 5, sy - 2], [sx + 6, sy - 1], [hx + 4, hy], [hx - 4, hy]], P.greenDeep);
  canvas.polygon([[sx + 1, sy - 1], [sx + 6, sy], [hx + 4, hy - 1], [hx + 1, hy - 1]], P.green);
  canvas.line(sx - 2, sy, hx + 1, hy - 2, P.gold);
  canvas.set(hx + 2, hy - 4, P.goldLit);
  canvas.rect(hx - 5, hy - 1, 10, 3, P.black);
  canvas.capsule(sx, sy - 1, headX, headY + 3, 2, P.skinShade);
  canvas.ellipse(headX, headY + 1, 4.5, 5, P.skin);
  canvas.polygon([[headX - 6, headY - 5], [headX + 2, headY - 6], [headX + 5, headY - 2], [headX - 4, headY]], P.hair);
  canvas.polygon([[headX - 6, headY - 3], [headX - 9, headY], [headX - 6, headY + 3], [headX - 3, headY]], P.hairShade);
  canvas.rect(headX - 4, headY, 9, 3, P.visor);
  canvas.rect(headX + 1, headY, 4, 1, P.visorLit);
  canvas.set(headX - 5, headY + 1, P.gold);
}

function drawLimb(canvas, points, front, leg) {
  const [a, b, c] = points;
  const base = front ? P.greenDeep : P.black;
  canvas.capsule(a[0], a[1], b[0], b[1], leg ? 2.7 : 2.1, base);
  canvas.disc(b[0], b[1], leg ? 2.8 : 2.4, front ? P.green : P.blackLit);
  canvas.capsule(b[0], b[1], c[0], c[1], leg ? 2.3 : 1.9, base);
  if (leg) {
    canvas.capsule(c[0] - 1, c[1], c[0] + 4, c[1], 1.8, P.blackLit);
    canvas.set(c[0] + 2, c[1] - 1, P.gold);
  } else {
    canvas.disc(c[0], c[1], 1.8, P.skin);
    canvas.set(b[0], b[1] - 1, P.goldLit);
  }
}

function drawCoat(canvas, pose) {
  const [a, b, c] = pose.coat;
  canvas.polygon([[a[0] - 3, a[1] - 2], [a[0] + 2, a[1]], [c[0] + 3, c[1] + 2], [c[0] - 2, c[1]]], P.black);
  canvas.capsule(a[0], a[1], b[0], b[1], 2.3, P.greenDeep);
  canvas.capsule(b[0], b[1], c[0], c[1], 1.7, P.green);
  canvas.set(c[0], c[1], P.gold);
}
