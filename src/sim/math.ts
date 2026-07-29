export const FIXED_SCALE = 1_000;

export interface FixedVector {
  readonly x: number;
  readonly y: number;
}

export interface FixedBox {
  readonly offset: FixedVector;
  readonly halfSize: FixedVector;
}

export interface Ratio {
  readonly numerator: number;
  readonly denominator: number;
}

export function fixed(value: number): number {
  return Math.round(value * FIXED_SCALE);
}

export function scaleInteger(value: number, ratio: Ratio): number {
  return Math.trunc((value * ratio.numerator) / ratio.denominator);
}

export function assertInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value)) {
    throw new Error(`${label} must be a safe integer; received ${value}`);
  }
}

export function assertNonNegativeInteger(value: number, label: string): void {
  assertInteger(value, label);
  if (value < 0) {
    throw new Error(`${label} must be non-negative; received ${value}`);
  }
}

export function assertRatio(ratio: Ratio, label: string): void {
  assertNonNegativeInteger(ratio.numerator, `${label}.numerator`);
  assertInteger(ratio.denominator, `${label}.denominator`);
  if (ratio.denominator <= 0) {
    throw new Error(`${label}.denominator must be positive`);
  }
}

export function clampInteger(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
