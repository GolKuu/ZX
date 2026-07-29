import {
  assertInteger,
  assertNonNegativeInteger,
  type FixedBox,
} from './math.js';

export function validateBoxes(
  boxes: readonly FixedBox[],
  label: string,
): void {
  if (boxes.length === 0) {
    throw new Error(`${label} must contain at least one box`);
  }
  boxes.forEach((box, index) => {
    assertInteger(box.offset.x, `${label}[${index}].offset.x`);
    assertInteger(box.offset.y, `${label}[${index}].offset.y`);
    assertInteger(box.halfSize.x, `${label}[${index}].halfSize.x`);
    assertInteger(box.halfSize.y, `${label}[${index}].halfSize.y`);
    if (box.halfSize.x <= 0 || box.halfSize.y <= 0) {
      throw new Error(`${label}[${index}].halfSize must be positive`);
    }
  });
}

export function validateRange(
  from: number,
  toExclusive: number,
  label: string,
): void {
  assertNonNegativeInteger(from, `${label}.frames.from`);
  assertNonNegativeInteger(toExclusive, `${label}.frames.toExclusive`);
  if (from >= toExclusive) {
    throw new Error(`${label}.frames must be a non-empty half-open range`);
  }
}
