import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const source = path.resolve('public/sprites/photo-fighters/source.png');
const output = path.resolve('public/sprites/photo-fighters');
const columns = 6;
const rows = 8;
const cellSize = 40;
const renderScale = 4;
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
const mim = colorize(normalized, 'mim');
const glitch = colorize(normalized, 'glitch');

await Promise.all([
  saveAtlas('mim-atlas.png', mim, info.width, info.height),
  saveAtlas('glitch-atlas.png', glitch, info.width, info.height),
  writeFile(path.join(output, 'manifest.json'), `${JSON.stringify({
    columns,
    rows,
    cellSize,
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

function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function quantize(value) {
  return clamp(Math.round(value / 24) * 24);
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
    const scale = Math.min(available / sourceWidth, available / sourceHeight);
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

function colorize(pixels, kind) {
  const output = Buffer.alloc(pixels.length);
  for (let pixel = 0; pixel < pixels.length / 4; pixel += 1) {
    const input = pixel * 4;
    const alpha = pixels[input + 3];
    if (alpha === 0) continue;
    const red = pixels[input];
    const green = pixels[input + 1];
    const blue = pixels[input + 2];
    if (kind === 'mim') {
      output[input] = quantize(clamp(red * 1.9));
      output[input + 1] = quantize(clamp(green * 1.68));
      output[input + 2] = quantize(clamp(blue * 1.5));
    } else {
      const light = Math.max(red, green, blue);
      const cyan = Math.max(0, blue - red * 0.35);
      output[input] = quantize(clamp(light * 0.58 + cyan * 0.36));
      output[input + 1] = quantize(clamp(green * 0.84 + light * 0.2));
      output[input + 2] = quantize(clamp(light * 1.78));
    }
    output[input + 3] = alpha;
  }
  addFaceDetails(output, info.width, kind);
  return output;
}

function addFaceDetails(pixels, width, kind) {
  for (let frame = 0; frame < columns * rows; frame += 1) {
    const cellX = (frame % columns) * cellSize;
    const cellY = Math.floor(frame / columns) * cellSize;
    const bounds = alphaBounds(pixels, width, cellX, cellY);
    if (bounds === null) continue;
    const searchBottom = bounds.top + Math.max(5, Math.round((bounds.bottom - bounds.top) * 0.35));
    const lightPixels = [];
    for (let y = bounds.top; y <= Math.min(bounds.bottom, searchBottom); y += 1) {
      for (let x = bounds.left; x <= bounds.right; x += 1) {
        const offset = ((cellY + y) * width + cellX + x) * 4;
        if (pixels[offset + 3] === 0) continue;
        const luminance = pixels[offset] * 0.22 + pixels[offset + 1] * 0.7 + pixels[offset + 2] * 0.08;
        if (luminance >= (kind === 'mim' ? 150 : 95)) lightPixels.push([x, y]);
      }
    }
    if (lightPixels.length < 4) continue;
    const faceRight = Math.max(...lightPixels.map(([x]) => x));
    const faceTop = Math.min(...lightPixels.map(([, y]) => y));
    const faceBottom = Math.max(...lightPixels.map(([, y]) => y));
    const eyeY = Math.min(faceBottom - 1, faceTop + Math.max(2, Math.floor((faceBottom - faceTop) * 0.55)));
    paintEye(pixels, width, cellX, cellY, faceRight - 1, eyeY, kind);
    if (faceRight - Math.min(...lightPixels.map(([x]) => x)) >= 5) {
      paintEye(pixels, width, cellX, cellY, faceRight - 4, eyeY, kind);
    }
  }
}

function paintEye(pixels, width, cellX, cellY, x, y, kind) {
  const offset = ((cellY + y) * width + cellX + x) * 4;
  if (pixels[offset + 3] === 0) return;
  const color = kind === 'mim' ? [8, 12, 22] : [24, 240, 255];
  pixels[offset] = color[0];
  pixels[offset + 1] = color[1];
  pixels[offset + 2] = color[2];
}
