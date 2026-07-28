import { describe, expect, it } from 'vitest';
import { InputBuffer } from '../core/InputBuffer';

describe('InputBuffer', () => {
  it('stores abstract actions and detects the first press only once', () => {
    const buffer = new InputBuffer();
    buffer.press('player1', 'MOVE_LEFT');
    buffer.press('player1', 'MOVE_LEFT');

    expect(buffer.snapshot().player1.held).toEqual(['MOVE_LEFT']);
    expect(buffer.consumePressed('player1', 'MOVE_LEFT')).toBe(true);
    expect(buffer.consumePressed('player1', 'MOVE_LEFT')).toBe(false);
  });

  it('releases held actions', () => {
    const buffer = new InputBuffer();
    buffer.press('player2', 'BLOCK');
    buffer.release('player2', 'BLOCK');

    expect(buffer.snapshot().player2.held).toEqual([]);
    expect(buffer.snapshot().player2.released).toEqual(['BLOCK']);
  });
});
