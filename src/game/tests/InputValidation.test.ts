import { describe, expect, it } from 'vitest';
import { cloneKeyboardProfiles } from '../config/defaultControls';
import {
  createMatchConfig,
  validateMatchConfig,
} from '../../stores/localPvpStore';

describe('LOCAL_PVP validation', () => {
  it('requires two visually distinct characters', () => {
    const keyboard = { kind: 'keyboard' as const, id: 'keyboard' as const };
    const config = createMatchConfig(
      { player1: keyboard, player2: keyboard },
      cloneKeyboardProfiles(),
      { player1: 'granite', player2: 'granite' },
      { player1: true, player2: true },
    );
    expect(validateMatchConfig(config)).toContain('разные персонажи');
  });

  it('rejects one gamepad selected by both players', () => {
    const gamepad = {
      kind: 'gamepad' as const,
      id: 'pad-0',
      gamepadIndex: 0,
      gamepadLabel: 'Pad',
    };
    const config = createMatchConfig(
      { player1: gamepad, player2: gamepad },
      cloneKeyboardProfiles(),
      { player1: 'granite', player2: 'shira' },
      { player1: true, player2: true },
    );
    expect(validateMatchConfig(config)).toContain('один и тот же геймпад');
  });

  it('requires Player 2 readiness', () => {
    const keyboard = { kind: 'keyboard' as const, id: 'keyboard' as const };
    const config = createMatchConfig(
      { player1: keyboard, player2: keyboard },
      cloneKeyboardProfiles(),
      { player1: 'granite', player2: 'shira' },
      { player1: true, player2: false },
    );
    expect(validateMatchConfig(config)).toContain('Player 2');
  });

  it('rejects critical keyboard conflicts but allows shared pause', () => {
    const profiles = cloneKeyboardProfiles();
    profiles.player2.bindings.LIGHT_ATTACK = profiles.player1.bindings.MOVE_LEFT;
    const keyboard = { kind: 'keyboard' as const, id: 'keyboard' as const };
    const config = createMatchConfig(
      { player1: keyboard, player2: keyboard },
      profiles,
      { player1: 'granite', player2: 'shira' },
      { player1: true, player2: true },
    );
    expect(validateMatchConfig(config)).toContain('конфликты');

    profiles.player2.bindings.LIGHT_ATTACK = 'Numpad1';
    expect(
      validateMatchConfig(
        createMatchConfig(
          { player1: keyboard, player2: keyboard },
          profiles,
          { player1: 'granite', player2: 'shira' },
          { player1: true, player2: true },
        ),
      ),
    ).toBeNull();
  });
});
