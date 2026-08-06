'use client';

import { useEffect, useMemo } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';

function createSunsetTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 900;
  const context = canvas.getContext('2d');
  if (context === null) return new CanvasTexture(canvas);

  const sky = context.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, '#080b24');
  sky.addColorStop(0.3, '#25235b');
  sky.addColorStop(0.58, '#a44567');
  sky.addColorStop(0.78, '#f28c55');
  sky.addColorStop(1, '#291827');
  context.fillStyle = sky;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const sun = context.createRadialGradient(1170, 470, 8, 1170, 470, 190);
  sun.addColorStop(0, 'rgba(255,249,194,1)');
  sun.addColorStop(0.12, 'rgba(255,224,135,.95)');
  sun.addColorStop(0.45, 'rgba(255,159,84,.28)');
  sun.addColorStop(1, 'rgba(255,116,65,0)');
  context.fillStyle = sun;
  context.fillRect(930, 230, 480, 480);
  context.fillStyle = '#fff4c4';
  context.beginPath();
  context.arc(1170, 470, 38, 0, Math.PI * 2);
  context.fill();

  drawClouds(context, 0.18, '#161638', 0.42);
  drawClouds(context, 0.48, '#6d3157', 0.22);
  drawMountainRange(context, 0.59, '#251c3c', 0.9, 46);
  drawMountainRange(context, 0.68, '#19192e', 1.1, 83);
  drawMountainRange(context, 0.79, '#0c1220', 1.25, 137);

  const haze = context.createLinearGradient(0, 510, 0, 690);
  haze.addColorStop(0, 'rgba(255,167,107,.22)');
  haze.addColorStop(1, 'rgba(255,167,107,0)');
  context.fillStyle = haze;
  context.fillRect(0, 480, canvas.width, 240);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function drawMountainRange(
  context: CanvasRenderingContext2D,
  horizon: number,
  color: string,
  detail: number,
  seed: number,
) {
  const width = context.canvas.width;
  const height = context.canvas.height;
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(0, height * horizon);
  for (let x = 0; x <= width; x += 18) {
    const wave = Math.sin((x + seed) * 0.008) * 28 * detail
      + Math.sin((x + seed) * 0.021) * 13 * detail
      + Math.sin((x + seed) * 0.047) * 6 * detail;
    const peak = (x % 220) / 220;
    const snow = Math.max(0, 1 - Math.abs(peak - 0.5) * 2);
    context.lineTo(x, height * horizon - 62 * snow * detail + wave);
  }
  context.lineTo(width, height);
  context.lineTo(0, height);
  context.closePath();
  context.fill();
}

function drawClouds(
  context: CanvasRenderingContext2D,
  y: number,
  color: string,
  alpha: number,
) {
  context.fillStyle = color;
  context.globalAlpha = alpha;
  for (let index = 0; index < 9; index += 1) {
    const x = 80 + index * 205;
    const width = 150 + (index % 3) * 70;
    context.beginPath();
    context.ellipse(x, context.canvas.height * y, width, 18 + (index % 2) * 10, 0, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;
}

export function StormSunsetBackdrop() {
  const texture = useMemo(() => createSunsetTexture(), []);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={[0, 4.6, -22]} renderOrder={-20}>
      <planeGeometry args={[64, 36]} />
      <meshBasicMaterial depthWrite={false} fog={false} map={texture} toneMapped={false} />
    </mesh>
  );
}
