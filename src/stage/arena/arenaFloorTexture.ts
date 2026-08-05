import {
  CanvasTexture,
  LinearFilter,
  SRGBColorSpace,
} from 'three';

const WIDTH = 1024;
const HEIGHT = 768;

export function createArenaFloorTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext('2d');
  if (context === null) throw new Error('Canvas 2D is required for the arena floor.');

  paintStoneField(context);
  paintSanctuaryMosaic(context);
  paintWear(context);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

function paintStoneField(context: CanvasRenderingContext2D): void {
  const gradient = context.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, '#506f62');
  gradient.addColorStop(0.45, '#8e9d85');
  gradient.addColorStop(1, '#b2b394');
  context.fillStyle = gradient;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  let seed = 48721;
  const random = (): number => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let row = 0; row < 13; row += 1) {
    const stoneHeight = 58 + Math.floor(random() * 18);
    const offset = row % 2 === 0 ? -42 : 8;
    for (let column = 0; column < 12; column += 1) {
      const x = offset + column * 96 + random() * 10;
      const y = row * 62 + random() * 8;
      const width = 82 + random() * 26;
      context.fillStyle = row % 3 === 0 ? '#879681' : column % 3 === 0 ? '#a5a78b' : '#96a18a';
      context.fillRect(x, y, width, stoneHeight);
      context.strokeStyle = 'rgba(48, 82, 72, .58)';
      context.lineWidth = 3;
      context.strokeRect(x, y, width, stoneHeight);
    }
  }
}

function paintSanctuaryMosaic(context: CanvasRenderingContext2D): void {
  const centerX = WIDTH * 0.5;
  const centerY = HEIGHT * 0.43;
  context.fillStyle = '#aeb294';
  context.beginPath();
  context.arc(centerX, centerY, 340, 0, Math.PI * 2);
  context.fill();

  const rings = [66, 126, 188, 252, 318];
  rings.forEach((radius, index) => {
    context.strokeStyle = index % 2 === 0 ? '#e7d89b' : '#4e786a';
    context.lineWidth = index % 2 === 0 ? 10 : 7;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.stroke();
  });

  for (let index = 0; index < 20; index += 1) {
    const angle = index * Math.PI / 10;
    context.strokeStyle = index % 5 === 0 ? '#eadb9e' : '#627f70';
    context.lineWidth = index % 5 === 0 ? 8 : 4;
    context.beginPath();
    context.moveTo(centerX + Math.cos(angle) * 52, centerY + Math.sin(angle) * 52);
    context.lineTo(centerX + Math.cos(angle) * 330, centerY + Math.sin(angle) * 330);
    context.stroke();
  }

  context.fillStyle = '#557d69';
  context.beginPath();
  for (let point = 0; point < 12; point += 1) {
    const angle = -Math.PI / 2 + point * Math.PI / 6;
    const radius = point % 2 === 0 ? 58 : 28;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    if (point === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
  context.fill();
  context.strokeStyle = '#f1dda0';
  context.lineWidth = 9;
  context.stroke();
}

function paintWear(context: CanvasRenderingContext2D): void {
  let seed = 9187;
  const random = (): number => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return seed / 4294967296;
  };
  for (let index = 0; index < 90; index += 1) {
    const x = random() * WIDTH;
    const y = random() * HEIGHT;
    const width = 8 + random() * 34;
    context.fillStyle = index % 4 === 0 ? 'rgba(181, 199, 86, .68)' : 'rgba(69, 130, 78, .46)';
    context.beginPath();
    context.ellipse(x, y, width, 3 + random() * 9, random() * Math.PI, 0, Math.PI * 2);
    context.fill();
  }
  for (let index = 0; index < 24; index += 1) {
    const x = random() * WIDTH;
    const y = random() * HEIGHT;
    context.strokeStyle = 'rgba(45, 76, 67, .62)';
    context.lineWidth = 2 + random() * 2;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + 12 + random() * 26, y + 4 + random() * 22);
    context.lineTo(x + 4 + random() * 18, y + 18 + random() * 30);
    context.stroke();
  }
}
