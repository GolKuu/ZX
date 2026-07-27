import { describe, expect, it } from 'vitest';
import { InputBuffer } from '../core/InputBuffer';

describe('InputBuffer', () => {
  it('stores abstract actions and detects the first press only once', () => {
    const buffer = new InputBuffer();
    buffer.press('player1', 'moveLeft');
    buffer.press('player1', 'moveLeft');

    expect(buffer.snapshot().player1).toEqual(['moveLeft']);
    expect(buffer.consumePressed('player1', 'moveLeft')).toBe(true);
    expect(buffer.consumePressed('player1', 'moveLeft')).toBe(false);
  });

  it('releases held actions', () => {
    const buffer = new InputBuffer();
    buffer.press('player2', 'block');
    buffer.release('player2', 'block');

    expect(buffer.snapshot().player2).toEqual([]);
  });
});
