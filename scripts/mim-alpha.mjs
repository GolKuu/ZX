import sharp from 'sharp';

export async function recolourDarkRegions(image, regions = []) {
  if (regions.length === 0) return image;
  const { data, info } = await sharp(image)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (const { cx, cy, rx, ry, fill } of regions) {
    const left = Math.max(0, Math.floor(cx - rx));
    const right = Math.min(info.width - 1, Math.ceil(cx + rx));
    const top = Math.max(0, Math.floor(cy - ry));
    const bottom = Math.min(info.height - 1, Math.ceil(cy + ry));
    for (let y = top; y <= bottom; y += 1) {
      for (let x = left; x <= right; x += 1) {
        const ellipseX = (x - cx) / rx;
        const ellipseY = (y - cy) / ry;
        if (ellipseX * ellipseX + ellipseY * ellipseY > 1) continue;
        const offset = (y * info.width + x) * 4;
        if (data[offset + 3] < 8) continue;
        const luminance = (
          data[offset] * 0.2126
          + data[offset + 1] * 0.7152
          + data[offset + 2] * 0.0722
        );
        if (luminance >= 48) continue;
        [data[offset], data[offset + 1], data[offset + 2]] = fill;
      }
    }
  }

  return sharp(data, {
    raw: {
      channels: 4,
      height: info.height,
      width: info.width,
    },
  }).png().toBuffer();
}

export async function keepLargestOpaqueComponent(image) {
  const { data, info } = await sharp(image)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixels = info.width * info.height;
  const seen = new Uint8Array(pixels);
  const stack = [];
  let largest = [];

  for (let start = 0; start < pixels; start += 1) {
    if (seen[start] !== 0 || data[start * 4 + 3] < 8) continue;
    const component = [];
    seen[start] = 1;
    stack.push(start);

    while (stack.length > 0) {
      const pixel = stack.pop();
      component.push(pixel);
      const x = pixel % info.width;
      for (const neighbor of [
        pixel - 1,
        pixel + 1,
        pixel - info.width,
        pixel + info.width,
      ]) {
        if (
          neighbor < 0
          || neighbor >= pixels
          || seen[neighbor] !== 0
          || data[neighbor * 4 + 3] < 8
          || Math.abs((neighbor % info.width) - x) > 1
        ) {
          continue;
        }
        seen[neighbor] = 1;
        stack.push(neighbor);
      }
    }
    if (component.length > largest.length) largest = component;
  }

  const keep = new Uint8Array(pixels);
  for (const pixel of largest) keep[pixel] = 1;
  for (let pixel = 0; pixel < pixels; pixel += 1) {
    if (keep[pixel] === 0) data[pixel * 4 + 3] = 0;
  }
  return sharp(data, {
    raw: {
      channels: 4,
      height: info.height,
      width: info.width,
    },
  }).png().toBuffer();
}
