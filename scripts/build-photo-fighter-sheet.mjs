import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { renderPixelFighter } from './photo-fighters/pixel-art.mjs';

const source = path.resolve('public/sprites/photo-fighters/source.png');
const output = path.resolve('public/sprites/photo-fighters');
const columns = 6;
const rows = 8;
const cellSize = 40;
const detailScale = 2;
const renderScale = 2;
const left = 21;
const top = 5;
const framePadding = 1;

await mkdir(output, { recursive: true });
const { data, info } = await sharp(source)
  .extract({ left, top, width: columns * cellSize, height: rows * cellSize })
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const sourcePixels = Buffer.alloc(info.width * info.height * 4);

for (let pixel = 0; pixel < info.width * info.height; pixel += 1) {
  const input = pixel * 3;
  const outputPixel = pixel * 4;
  const red = Math.max(0, data[input] - 8);
  const green = Math.max(0, data[input + 1] - 11);
  const blue = Math.max(0, data[input + 2] - 20);
  const brightness = Math.max(data[input], data[input + 1], data[input + 2]);
  // The source has soft antialiased fringe pixels. They turn into a grey halo
  // when a 40 px fighter is enlarged in WebGL, so author a hard pixel mask.
  const alpha = brightness >= 36 ? 255 : 0;

  sourcePixels[outputPixel] = red;
  sourcePixels[outputPixel + 1] = green;
  sourcePixels[outputPixel + 2] = blue;
  sourcePixels[outputPixel + 3] = alpha;
}

// A one-pixel guide survives at the left edge of the supplied sheet. It is not
// part of frame 0 and would otherwise prevent the first column from enlarging.
for (let y = 0; y < info.height; y += 1) {
  sourcePixels[(y * info.width) * 4 + 3] = 0;
}

// The supplied sheet leaves a lot of empty space around upright poses. Lucky's
// authored atlas uses almost the complete 40 px cell, so normalize every pose
// to the same usable bounds before coloring it. Wide attack poses are scaled
// only as far as the cell permits, which keeps every animation coordinate safe.
const normalized = normalizeFrames(sourcePixels, info.width);
const mim = renderPixelFighter(normalized, info.width, info.height, {
  columns,
  rows,
  cellSize,
  detailScale,
  kind: 'mim',
});
const glitch = renderPixelFighter(normalized, info.width, info.height, {
  columns,
  rows,
  cellSize,
  detailScale,
  kind: 'glitch',
});
const detailedWidth = info.width * detailScale;
const detailedHeight = info.height * detailScale;

await Promise.all([
  saveAtlas('mim-atlas.png', mim, detailedWidth, detailedHeight),
  saveAtlas('glitch-atlas.png', glitch, detailedWidth, detailedHeight),
  writeFile(path.join(output, 'manifest.json'), `${JSON.stringify({
    columns,
    rows,
    cellSize,
    detailCellSize: cellSize * detailScale,
    renderScale,
    frameCount: columns * rows,
    ground: 0.91,
    facesRight: true,
  }, null, 2)}\n`),
]);

console.log(`Built ${String(columns * rows)} photo-animation frames for Mim and Glitch.`);

function saveAtlas(name, pixels, width, height) {
  return sharp(pixels, { raw: { width, height, channels: 4 } })
    .resize(width * renderScale, height * renderScale, { kernel: 'nearest' })
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(output, name));
}

function normalizeFrames(pixels, width) {
  const normalized = Buffer.alloc(pixels.length);
  for (let frame = 0; frame < columns * rows; frame += 1) {
    const cellX = (frame % columns) * cellSize;
    const cellY = Math.floor(frame / columns) * cellSize;
    const bounds = alphaBounds(pixels, width, cellX, cellY);
    if (bounds === null) continue;

    const sourceWidth = bounds.right - bounds.left + 1;
    const sourceHeight = bounds.bottom - bounds.top + 1;
    const available = cellSize - framePadding * 2;
    const scale = Math.min(1.2, available / sourceWidth, available / sourceHeight);
    const targetWidth = Math.max(sourceWidth, Math.round(sourceWidth * scale));
    const targetHeight = Math.max(sourceHeight, Math.round(sourceHeight * scale));
    const centerX = (bounds.left + bounds.right) / 2;
    const centerY = (bounds.top + bounds.bottom) / 2;
    const targetLeft = clampToCell(Math.round(centerX - targetWidth / 2), targetWidth);
    const targetTop = clampToCell(Math.round(centerY - targetHeight / 2), targetHeight);

    for (let y = 0; y < targetHeight; y += 1) {
      const sourceY = bounds.top + Math.min(sourceHeight - 1, Math.floor(y * sourceHeight / targetHeight));
      for (let x = 0; x < targetWidth; x += 1) {
        const sourceX = bounds.left + Math.min(sourceWidth - 1, Math.floor(x * sourceWidth / targetWidth));
        const sourceOffset = ((cellY + sourceY) * width + cellX + sourceX) * 4;
        if (pixels[sourceOffset + 3] === 0) continue;
        const targetOffset = ((cellY + targetTop + y) * width + cellX + targetLeft + x) * 4;
        pixels.copy(normalized, targetOffset, sourceOffset, sourceOffset + 4);
      }
    }
  }
  return normalized;
}

function alphaBounds(pixels, width, cellX, cellY) {
  let leftBound = cellSize;
  let rightBound = -1;
  let topBound = cellSize;
  let bottomBound = -1;
  for (let y = 0; y < cellSize; y += 1) {
    for (let x = 0; x < cellSize; x += 1) {
      if (pixels[((cellY + y) * width + cellX + x) * 4 + 3] === 0) continue;
      leftBound = Math.min(leftBound, x);
      rightBound = Math.max(rightBound, x);
      topBound = Math.min(topBound, y);
      bottomBound = Math.max(bottomBound, y);
    }
  }
  return rightBound < leftBound
    ? null
    : { left: leftBound, right: rightBound, top: topBound, bottom: bottomBound };
}

function clampToCell(value, size) {
  return Math.max(framePadding, Math.min(cellSize - framePadding - size, value));
}
