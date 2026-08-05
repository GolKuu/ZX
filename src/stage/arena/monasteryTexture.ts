import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three';

const WIDTH = 768;
const HEIGHT = 432;
type Point = readonly [number, number];

export function createMonasteryTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext('2d');
  if (context === null) throw new Error('Canvas 2D is required for the monastery arena.');
  paintCloudRealm(context);
  paintCliff(context);
  paintWalls(context);
  paintRoofs(context);
  paintGate(context);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

function paintCloudRealm(context: CanvasRenderingContext2D): void {
  const sky = context.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, '#9db9ce');
  sky.addColorStop(0.48, '#d8dbe0');
  sky.addColorStop(1, '#f1d5bc');
  context.fillStyle = sky;
  context.fillRect(0, 0, WIDTH, HEIGHT);
  for (let index = 0; index < 24; index += 1) {
    const x = (index * 137) % 840 - 40;
    const y = 42 + ((index * 67) % 250);
    const radius = 28 + (index % 5) * 9;
    context.fillStyle = index % 3 === 0 ? '#f4f0ed' : '#d9e0e5';
    context.beginPath();
    context.ellipse(x, y, radius * 1.8, radius * 0.62, 0, 0, Math.PI * 2);
    context.ellipse(x + radius, y - 8, radius, radius * 0.65, 0, 0, Math.PI * 2);
    context.fill();
  }
  context.fillStyle = 'rgba(255, 244, 223, .68)';
  context.fillRect(0, 330, WIDTH, 102);
}

function paintCliff(context: CanvasRenderingContext2D): void {
  polygon(context, [[55, 420], [104, 295], [166, 260], [226, 292], [286, 241], [352, 284], [420, 242], [486, 290], [555, 253], [624, 293], [704, 420]], '#3b4146');
  polygon(context, [[89, 420], [130, 310], [173, 280], [202, 420]], '#596066');
  polygon(context, [[570, 420], [605, 303], [650, 286], [695, 420]], '#242b31');
  context.strokeStyle = '#798087';
  context.lineWidth = 5;
  for (const x of [135, 217, 314, 462, 594, 655]) {
    context.beginPath();
    context.moveTo(x, 298);
    context.lineTo(x - 24, 420);
    context.stroke();
  }
}

function paintWalls(context: CanvasRenderingContext2D): void {
  context.fillStyle = '#e1ded3';
  context.fillRect(95, 175, 578, 153);
  context.fillStyle = '#b7b5ad';
  context.fillRect(95, 306, 578, 22);
  context.fillStyle = '#a52724';
  context.fillRect(95, 173, 578, 10);
  for (const x of [105, 167, 239, 311, 457, 529, 601, 663]) {
    context.fillRect(x, 176, 13, 152);
    context.fillRect(x - 6, 219, 25, 9);
  }
  for (const x of [142, 203, 274, 493, 565, 632]) paintWindow(context, x, 220);
  context.fillStyle = '#9b8d78';
  context.fillRect(122, 315, 524, 13);
}

function paintRoofs(context: CanvasRenderingContext2D): void {
  roof(context, [[62, 183], [116, 124], [282, 124], [332, 184]], [[47, 185], [336, 185], [303, 158], [92, 158]]);
  roof(context, [[432, 184], [483, 122], [657, 122], [714, 184]], [[415, 186], [729, 186], [684, 158], [460, 158]]);
  roof(context, [[259, 130], [331, 77], [437, 77], [506, 130]], [[241, 133], [523, 133], [476, 105], [286, 105]]);
  context.fillStyle = '#b72b25';
  context.fillRect(351, 64, 66, 75);
  pagodaTier(context, 384, 69, 74);
  pagodaTier(context, 384, 42, 52);
  context.fillStyle = '#1d2628';
  polygon(context, [[373, 25], [384, 8], [395, 25]], '#1d2628');
  context.fillRect(381, 21, 6, 20);
}

function roof(context: CanvasRenderingContext2D, body: readonly Point[], eaves: readonly Point[]): void {
  polygon(context, body, '#253236');
  context.strokeStyle = '#556468';
  context.lineWidth = 3;
  for (let x = body[0]![0] + 18; x < body[2]![0]; x += 16) {
    context.beginPath();
    context.moveTo(x, body[0]![1] + 5);
    context.lineTo(x + 14, body[3]![1] - 6);
    context.stroke();
  }
  polygon(context, eaves, '#151e21');
  context.strokeStyle = '#b72b25';
  context.lineWidth = 5;
  context.stroke();
}

function pagodaTier(context: CanvasRenderingContext2D, x: number, y: number, width: number): void {
  polygon(context, [[x - width / 2, y + 18], [x - width / 3, y], [x + width / 3, y], [x + width / 2, y + 18]], '#202d30');
  context.strokeStyle = '#c03a29';
  context.lineWidth = 4;
  context.stroke();
}

function paintGate(context: CanvasRenderingContext2D): void {
  context.fillStyle = '#9f2723';
  context.fillRect(337, 201, 94, 128);
  context.fillStyle = '#5b1d19';
  context.beginPath();
  context.arc(384, 244, 39, Math.PI, 0);
  context.fillRect(345, 244, 78, 85);
  context.fill();
  context.strokeStyle = '#d4a83d';
  context.lineWidth = 6;
  context.strokeRect(350, 246, 68, 83);
  context.beginPath();
  context.arc(384, 246, 34, Math.PI, 0);
  context.stroke();
  context.fillStyle = '#d9b74c';
  context.beginPath();
  context.arc(384, 184, 24, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#171c1d';
  context.beginPath();
  context.arc(384, 184, 10, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#d9b74c';
  context.beginPath();
  context.arc(390, 178, 7, 0, Math.PI * 2);
  context.fill();
}

function paintWindow(context: CanvasRenderingContext2D, x: number, y: number): void {
  context.fillStyle = '#253337';
  context.fillRect(x, y, 29, 42);
  context.fillStyle = '#c69b49';
  context.fillRect(x + 13, y, 3, 42);
  context.fillRect(x, y + 19, 29, 3);
}

function polygon(context: CanvasRenderingContext2D, points: readonly Point[], color: string): void {
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(...points[0]!);
  for (const point of points.slice(1)) context.lineTo(...point);
  context.closePath();
  context.fill();
}
