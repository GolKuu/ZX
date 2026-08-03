const PALETTES = {
  mim: {
    ink: [14, 10, 24], shadow: [45, 24, 72], mid: [105, 58, 140],
    light: [218, 218, 236], shine: [255, 248, 255], accent: [196, 61, 255],
  },
  glitch: {
    ink: [3, 12, 25], shadow: [7, 39, 68], mid: [16, 86, 120],
    light: [134, 210, 229], shine: [236, 250, 255], accent: [16, 231, 255],
  },
};

export function renderPixelFighter(source, sourceWidth, sourceHeight, spec) {
  const width = sourceWidth * spec.detailScale;
  const height = sourceHeight * spec.detailScale;
  const output = Buffer.alloc(width * height * 4);
  enlarge(source, sourceWidth, sourceHeight, output, width, spec.detailScale);
  for (let frame = 0; frame < spec.columns * spec.rows; frame += 1) {
    styleFrame(output, width, frame, spec);
  }
  return output;
}

function enlarge(source, sourceWidth, sourceHeight, output, width, scale) {
  for (let y = 0; y < sourceHeight; y += 1) {
    for (let x = 0; x < sourceWidth; x += 1) {
      const from = (y * sourceWidth + x) * 4;
      if (source[from + 3] === 0) continue;
      for (let oy = 0; oy < scale; oy += 1) {
        for (let ox = 0; ox < scale; ox += 1) {
          const to = (((y * scale + oy) * width) + x * scale + ox) * 4;
          source.copy(output, to, from, from + 4);
        }
      }
    }
  }
}

function styleFrame(pixels, width, frame, spec) {
  const size = spec.cellSize * spec.detailScale;
  const cellX = (frame % spec.columns) * size;
  const cellY = Math.floor(frame / spec.columns) * size;
  const bounds = findBounds(pixels, width, cellX, cellY, size);
  if (bounds === null) return;
  const palette = PALETTES[spec.kind];
  const sourceLight = new Uint8Array(size * size);

  forEachOpaque(pixels, width, cellX, cellY, size, (x, y, offset) => {
    const light = Math.max(pixels[offset], pixels[offset + 1], pixels[offset + 2]);
    sourceLight[y * size + x] = light;
    const nx = (x - bounds.left) / Math.max(1, bounds.right - bounds.left);
    const ny = (y - bounds.top) / Math.max(1, bounds.bottom - bounds.top);
    let tone = light > 185 ? palette.shine : light > 115 ? palette.light
      : light > 62 ? palette.mid : light > 31 ? palette.shadow : palette.ink;
    if (spec.kind === 'mim' && ny > 0.28 && ny < 0.72 && (nx < 0.3 || nx > 0.7)) {
      tone = light > 82 ? palette.light : palette.shadow;
    }
    if (spec.kind === 'glitch' && ny > 0.25 && light > 38 && light < 128
      && ((x * 3 + y + frame) % 37 === 0)) {
      tone = palette.accent;
    }
    paint(pixels, offset, tone);
  });

  const head = findHead(sourceLight, size, bounds);
  if (head === null) return;
  drawFace(pixels, width, cellX, cellY, size, head, spec.kind, palette);
}

function findHead(light, size, bounds) {
  const bright = [];
  const limit = bounds.top + Math.max(14, Math.round((bounds.bottom - bounds.top) * 0.46));
  for (let y = bounds.top; y <= Math.min(bounds.bottom, limit); y += 1) {
    for (let x = bounds.left; x <= bounds.right; x += 1) {
      if (light[y * size + x] >= 142) bright.push({ x, y });
    }
  }
  if (bright.length < 4) return null;
  const crown = Math.min(...bright.map((pixel) => pixel.y));
  const candidates = bright.filter((pixel) => pixel.y <= crown + 6);
  const centerX = Math.round(candidates.reduce((sum, pixel) => sum + pixel.x, 0) / candidates.length);
  const centerY = crown + 4;
  return { x: centerX, y: centerY, radius: 3 };
}

function drawFace(pixels, width, cellX, cellY, size, head, kind, palette) {
  const faceX = head.x + Math.max(1, Math.floor(head.radius * 0.35));
  const faceY = head.y + 1;
  if (kind === 'mim') {
    fillPatch(pixels, width, cellX, cellY, size, faceX, faceY, head.radius, palette.shine);
    setPixel(pixels, width, cellX, cellY, size, faceX - 2, faceY - 1, palette.ink);
    setPixel(pixels, width, cellX, cellY, size, faceX - 1, faceY, palette.accent);
    setPixel(pixels, width, cellX, cellY, size, faceX + 1, faceY - 1, palette.ink);
    setPixel(pixels, width, cellX, cellY, size, faceX + 2, faceY, palette.accent);
    setPixel(pixels, width, cellX, cellY, size, faceX, faceY + 2, palette.ink);
    setPixel(pixels, width, cellX, cellY, size, faceX + 1, faceY + 2, palette.ink);
  } else {
    fillPatch(pixels, width, cellX, cellY, size, faceX, faceY, head.radius, palette.shadow);
    setPixel(pixels, width, cellX, cellY, size, faceX - 2, faceY, palette.accent);
    setPixel(pixels, width, cellX, cellY, size, faceX - 1, faceY, palette.shine);
    setPixel(pixels, width, cellX, cellY, size, faceX, faceY, palette.accent);
    setPixel(pixels, width, cellX, cellY, size, faceX + 1, faceY, palette.accent);
    setPixel(pixels, width, cellX, cellY, size, faceX + 2, faceY, palette.shine);
    setPixel(pixels, width, cellX, cellY, size, faceX + 1, faceY + 2, palette.light);
  }
}

function fillPatch(pixels, width, cellX, cellY, size, cx, cy, radius, color) {
  for (let y = cy - radius; y <= cy + radius; y += 1) {
    for (let x = cx - radius; x <= cx + radius; x += 1) {
      if (((x - cx) ** 2) / (radius ** 2) + ((y - cy) ** 2) / ((radius + 1) ** 2) > 1) continue;
      setPixel(pixels, width, cellX, cellY, size, x, y, color, true);
    }
  }
}

function setPixel(pixels, width, cellX, cellY, size, x, y, color, preserveAlpha = false) {
  if (x < 0 || y < 0 || x >= size || y >= size) return;
  const offset = ((cellY + y) * width + cellX + x) * 4;
  if (pixels[offset + 3] === 0 && preserveAlpha) return;
  if (pixels[offset + 3] === 0) return;
  paint(pixels, offset, color);
}

function paint(pixels, offset, color) {
  pixels[offset] = color[0];
  pixels[offset + 1] = color[1];
  pixels[offset + 2] = color[2];
  pixels[offset + 3] = 255;
}

function forEachOpaque(pixels, width, cellX, cellY, size, visit) {
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const offset = ((cellY + y) * width + cellX + x) * 4;
      if (pixels[offset + 3] !== 0) visit(x, y, offset);
    }
  }
}

function findBounds(pixels, width, cellX, cellY, size) {
  let left = size; let right = -1; let top = size; let bottom = -1;
  forEachOpaque(pixels, width, cellX, cellY, size, (x, y) => {
    left = Math.min(left, x); right = Math.max(right, x);
    top = Math.min(top, y); bottom = Math.max(bottom, y);
  });
  return right < left ? null : { left, right, top, bottom };
}
