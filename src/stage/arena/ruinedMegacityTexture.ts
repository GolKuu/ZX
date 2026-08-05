import {
  CanvasTexture,
  NearestFilter,
  SRGBColorSpace,
} from 'three';

const WIDTH = 384;
const HEIGHT = 216;

interface Tower {
  readonly x: number;
  readonly width: number;
  readonly top: number;
  readonly color: string;
  readonly accent: string;
  readonly damage: number;
}

const TOWERS: readonly Tower[] = [
  { x: -8, width: 47, top: 60, color: '#17152d', accent: '#35d7dd', damage: 8 },
  { x: 30, width: 39, top: 93, color: '#20163d', accent: '#7a55e8', damage: 3 },
  { x: 62, width: 54, top: 46, color: '#151b39', accent: '#24c8d4', damage: 12 },
  { x: 108, width: 36, top: 78, color: '#24143b', accent: '#ea4f83', damage: 6 },
  { x: 137, width: 50, top: 31, color: '#13182f', accent: '#4d6ad9', damage: 10 },
  { x: 180, width: 42, top: 71, color: '#21133a', accent: '#2bd4cf', damage: 4 },
  { x: 214, width: 55, top: 39, color: '#15172f', accent: '#8252e8', damage: 11 },
  { x: 261, width: 39, top: 84, color: '#25153c', accent: '#e74a83', damage: 5 },
  { x: 293, width: 53, top: 51, color: '#141a35', accent: '#2ed2dc', damage: 9 },
  { x: 338, width: 52, top: 76, color: '#21143a', accent: '#7957df', damage: 4 },
];

export function createRuinedMegacityTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext('2d');
  if (context === null) throw new Error('Canvas 2D is required for the megacity backdrop.');
  context.imageSmoothingEnabled = false;

  paintSky(context);
  paintSun(context);
  paintClouds(context);
  TOWERS.forEach((tower, index) => paintTower(context, tower, index));
  paintStreetHaze(context);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

function paintSky(context: CanvasRenderingContext2D): void {
  const gradient = context.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, '#09031d');
  gradient.addColorStop(0.58, '#19062d');
  gradient.addColorStop(1, '#482047');
  context.fillStyle = gradient;
  context.fillRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = '#36205b';
  for (let y = 30; y < 142; y += 13) context.fillRect(0, y, WIDTH, 1);
}

function paintSun(context: CanvasRenderingContext2D): void {
  context.fillStyle = '#ffcf31';
  context.beginPath();
  context.arc(WIDTH / 2, 75, 46, Math.PI, 0);
  context.lineTo(WIDTH / 2 + 46, 75);
  context.lineTo(WIDTH / 2 - 46, 75);
  context.fill();
  context.fillStyle = '#ff8b24';
  for (let y = 58; y < 76; y += 6) context.fillRect(148, y, 88, 2);
}

function paintClouds(context: CanvasRenderingContext2D): void {
  for (const [x, y, flip] of [[18, 34, 1], [288, 28, -1]] as const) {
    context.save();
    context.translate(x, y);
    context.scale(flip, 1);
    context.fillStyle = '#4f4ab1';
    context.fillRect(0, 8, 72, 5);
    context.fillStyle = '#e85b9b';
    context.fillRect(11, 4, 48, 6);
    context.fillStyle = '#ff8db2';
    context.fillRect(24, 0, 21, 7);
    context.fillStyle = '#ffd15d';
    context.fillRect(28, 0, 10, 2);
    context.restore();
  }
}

function paintTower(context: CanvasRenderingContext2D, tower: Tower, index: number): void {
  const base = 192;
  context.fillStyle = tower.color;
  context.beginPath();
  context.moveTo(tower.x, base);
  context.lineTo(tower.x, tower.top + tower.damage);
  context.lineTo(tower.x + tower.width * 0.2, tower.top);
  context.lineTo(tower.x + tower.width * 0.45, tower.top + tower.damage * 0.65);
  context.lineTo(tower.x + tower.width * 0.68, tower.top + 2);
  context.lineTo(tower.x + tower.width, tower.top + tower.damage * 0.35);
  context.lineTo(tower.x + tower.width, base);
  context.fill();

  context.fillStyle = tower.accent;
  context.fillRect(tower.x + 4, tower.top + 14, 2, base - tower.top - 19);
  const floorHeight = 8;
  for (let y = tower.top + 18; y < base - 8; y += floorHeight) {
    for (let x = tower.x + 10; x < tower.x + tower.width - 4; x += 9) {
      const lit = (x + y + index * 7) % 5 !== 0;
      context.fillStyle = lit ? tower.accent : '#30234d';
      context.fillRect(x, y, lit ? 4 : 3, 2);
    }
  }
  context.fillStyle = '#ff5c78';
  if (index % 2 === 0) context.fillRect(tower.x + tower.width * 0.55, tower.top - 5, 2, 9);
}

function paintStreetHaze(context: CanvasRenderingContext2D): void {
  const haze = context.createLinearGradient(0, 168, 0, HEIGHT);
  haze.addColorStop(0, 'rgba(76, 35, 88, 0)');
  haze.addColorStop(1, 'rgba(13, 7, 28, 0.94)');
  context.fillStyle = haze;
  context.fillRect(0, 168, WIDTH, 48);
  context.fillStyle = '#5d356e';
  context.fillRect(0, 191, WIDTH, 2);
  context.fillStyle = '#24162f';
  for (let x = 8; x < WIDTH; x += 22) context.fillRect(x, 197 + (x % 3), 14, 3);
}
