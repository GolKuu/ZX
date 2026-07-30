import { rasterisePolygon, unionMasks } from './sheet-mask.mjs';

const NAVY = [13, 31, 54];
const DARK = [32, 63, 88];
const SLATE = [91, 121, 137];
const LIGHT = [181, 205, 214];
const ARMOUR = [234, 244, 247];
const CYAN = [71, 166, 218];

/**
 * Rebuild ECHO's attack drawing from the blue hurtbox study on the source sheet.
 *
 * The blue layer follows the fighter's silhouette, so it is useful as a precise
 * alpha mask. Red and green diagram layers are discarded. Where a red hitbox
 * covers the striking hand or foot, the pose config supplies a small recovery
 * polygon and the source luminance restores the line work beneath the tint.
 */
export function cleanEchoAttack(data, width, height, spec, groundInCrop) {
  const recoveryMasks = (spec.recover ?? [])
    .map((polygon) => rasterisePolygon(polygon, width, height));
  const recovery = recoveryMasks.length === 0
    ? new Uint8Array(width * height)
    : unionMasks(recoveryMasks, width, height);
  const keep = new Uint8Array(width * height);
  const levels = new Uint8Array(width * height);
  const cyan = new Uint8Array(width * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixel = y * width + x;
      const offset = pixel * 4;
      const red = data[offset];
      const green = data[offset + 1];
      const blue = data[offset + 2];
      const chroma = Math.max(red, green, blue) - Math.min(red, green, blue);
      const paper = red > 210 && green > 210 && blue > 210 && chroma < 18;
      const redLayer = red > green + 20 && red > blue + 16;
      const greenLayer = green > red + 10 && green > blue + 4;
      const recovered = recovery[pixel] !== 0;
      const onFoot = (spec.feet ?? [])
        .some(([start, end]) => x >= start && x < end);
      const belowFloor = y >= groundInCrop - 14 && !onFoot;

      if (
        belowFloor
        || data[offset + 3] === 0
        || (!recovered && (paper || redLayer || greenLayer))
      ) {
        continue;
      }

      keep[pixel] = 1;
      const level = redLayer
        ? Math.min(255, Math.max(green, blue) * 1.7)
        : blue > red + 22
          ? Math.min(255, red * 1.55 + green * 0.28)
          : red * 0.24 + green * 0.68 + blue * 0.08;
      levels[pixel] = Math.round(level);
      cyan[pixel] = (
        !redLayer
        && blue > red + 72
        && green > red + 24
        && level > 92
        && level < 190
      ) ? 1 : 0;
    }
  }

  const output = Buffer.alloc(data.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixel = y * width + x;
      if (keep[pixel] === 0) continue;
      const edge = (
        x === 0
        || y === 0
        || x === width - 1
        || y === height - 1
        || keep[pixel - 1] === 0
        || keep[pixel + 1] === 0
        || keep[pixel - width] === 0
        || keep[pixel + width] === 0
      );
      const colour = edge ? NAVY : colourFor(levels[pixel], cyan[pixel] !== 0);
      const offset = pixel * 4;
      output[offset] = colour[0];
      output[offset + 1] = colour[1];
      output[offset + 2] = colour[2];
      output[offset + 3] = 255;
    }
  }
  return output;
}

function colourFor(level, isCyan) {
  if (level < 58) return NAVY;
  if (level < 103) return DARK;
  if (isCyan) return CYAN;
  if (level < 150) return SLATE;
  if (level < 205) return LIGHT;
  return ARMOUR;
}
