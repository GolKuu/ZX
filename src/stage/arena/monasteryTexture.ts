import { CanvasTexture, NearestFilter, SRGBColorSpace } from 'three';

const WIDTH = 512;
const HEIGHT = 288;

export function createMonasteryTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext('2d');
  if (context === null) throw new Error('Canvas 2D is required for the monastery arena.');
  paintSky(context);
  paintMountains(context);
  paintMonastery(context);
  paintArcade(context);
  paintForeground(context);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

function paintSky(context: CanvasRenderingContext2D): void {
  const sky = context.createLinearGradient(0, 0, 0, 220);
  sky.addColorStop(0, '#231d27');
  sky.addColorStop(0.45, '#6f4b45');
  sky.addColorStop(0.78, '#d08a56');
  sky.addColorStop(1, '#e4b66e');
  context.fillStyle = sky;
  context.fillRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = '#f5ce77';
  context.beginPath();
  context.arc(390, 64, 27, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = 'rgba(255, 224, 151, .16)';
  context.beginPath();
  context.arc(390, 64, 48, 0, Math.PI * 2);
  context.fill();
}

function paintMountains(context: CanvasRenderingContext2D): void {
  const layers = [
    { base: 190, color: '#554549', points: [0, 112, 80, 58, 164, 125, 250, 72, 344, 125, 430, 68, 512, 130] },
    { base: 211, color: '#3a3438', points: [0, 154, 94, 91, 182, 164, 278, 106, 370, 157, 454, 103, 512, 148] },
  ];
  for (const layer of layers) {
    context.fillStyle = layer.color;
    context.beginPath();
    context.moveTo(layer.points[0]!, layer.base);
    for (let index = 0; index < layer.points.length; index += 2) {
      context.lineTo(layer.points[index]!, layer.points[index + 1]!);
    }
    context.lineTo(WIDTH, layer.base);
    context.closePath();
    context.fill();
  }
}

function paintMonastery(context: CanvasRenderingContext2D): void {
  for (const [x, y, width, height, color] of [
    [151, 102, 210, 111, '#8d7764'], [177, 79, 158, 134, '#b49a78'], [201, 63, 110, 150, '#d0b68b'],
  ] as const) {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
  }
  context.fillStyle = '#5a493f';
  context.beginPath();
  context.arc(256, 74, 48, Math.PI, 0);
  context.lineTo(304, 91);
  context.lineTo(208, 91);
  context.fill();
  context.fillStyle = '#b18845';
  context.beginPath();
  context.arc(256, 58, 25, Math.PI, 0);
  context.lineTo(281, 69);
  context.lineTo(231, 69);
  context.fill();
  context.fillRect(252, 31, 8, 27);
  context.fillRect(245, 38, 22, 6);
  context.fillStyle = '#332b29';
  context.beginPath();
  context.arc(256, 158, 27, Math.PI, 0);
  context.fillRect(229, 158, 54, 55);
  context.fill();
  for (const x of [190, 218, 294, 322]) paintWindow(context, x, 126);
}

function paintWindow(context: CanvasRenderingContext2D, x: number, y: number): void {
  context.fillStyle = '#352c2b';
  context.beginPath();
  context.arc(x, y, 8, Math.PI, 0);
  context.fillRect(x - 8, y, 16, 27);
  context.fill();
  context.fillStyle = '#d99142';
  context.fillRect(x - 4, y + 5, 8, 14);
}

function paintArcade(context: CanvasRenderingContext2D): void {
  context.fillStyle = '#6f5e50';
  context.fillRect(0, 176, WIDTH, 74);
  for (let x = -20; x < WIDTH; x += 58) {
    context.fillStyle = '#2b2625';
    context.beginPath();
    context.arc(x + 29, 211, 20, Math.PI, 0);
    context.fillRect(x + 9, 211, 40, 39);
    context.fill();
    context.fillStyle = '#a58d6f';
    context.fillRect(x + 1, 177, 8, 73);
    context.fillRect(x + 49, 177, 8, 73);
    context.fillRect(x, 174, 58, 6);
  }
}

function paintForeground(context: CanvasRenderingContext2D): void {
  const floor = context.createLinearGradient(0, 230, 0, HEIGHT);
  floor.addColorStop(0, '#4b4037');
  floor.addColorStop(1, '#201c19');
  context.fillStyle = floor;
  context.fillRect(0, 246, WIDTH, 42);
  context.strokeStyle = 'rgba(211, 181, 128, .28)';
  context.lineWidth = 2;
  for (let x = -60; x < WIDTH + 60; x += 36) {
    context.beginPath();
    context.moveTo(256, 238);
    context.lineTo(x, HEIGHT);
    context.stroke();
  }
  for (const y of [255, 268, 282]) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(WIDTH, y);
    context.stroke();
  }
}
