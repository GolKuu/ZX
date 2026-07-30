import sharp from 'sharp';

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
