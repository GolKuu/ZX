import { describe, expect, it } from 'vitest';
import { getModelStrokeWidth } from '../rendering/fighters/modelStyle';

describe('character visual styling', () => {
  it('uses stronger strokes for limbs so they remain readable during attacks', () => {
    expect(getModelStrokeWidth(4, 'limb')).toBe(6);
    expect(getModelStrokeWidth(5, 'body')).toBe(5);
    expect(getModelStrokeWidth(3, 'joint')).toBe(4);
  });
});
