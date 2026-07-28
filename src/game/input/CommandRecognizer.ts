import { balanceConfig } from '../config/balanceConfig';
import type { GameAction, PlayerId, PlayerInputFrame } from '../core/types';

type PressRecord = { action: GameAction; tick: number };

export type RecognizedInput = {
  frame: PlayerInputFrame;
  toward: boolean;
  away: boolean;
  defenseCombo: (action: GameAction, window?: number) => boolean;
  recentlyPressed: (action: GameAction, window: number) => boolean;
  sequence: (actions: readonly GameAction[], window?: number) => boolean;
  doubleTapped: 'MOVE_LEFT' | 'MOVE_RIGHT' | null;
};

export class CommandRecognizer {
  private readonly history = new Map<PlayerId, PressRecord[]>();

  recognize(
    playerId: PlayerId,
    tick: number,
    frame: PlayerInputFrame,
    facing: -1 | 1,
  ): RecognizedInput {
    const history = this.history.get(playerId) ?? [];
    frame.pressed.forEach((action) => {
      if (isGameAction(action)) history.push({ action, tick });
    });
    const oldest = tick - balanceConfig.inputBufferWindow;
    const recent = history.filter((entry) => entry.tick >= oldest);
    this.history.set(playerId, recent);

    const towardAction = facing === 1 ? 'MOVE_RIGHT' : 'MOVE_LEFT';
    const awayAction = facing === 1 ? 'MOVE_LEFT' : 'MOVE_RIGHT';
    const holdingBothDirections =
      frame.held.includes('MOVE_LEFT') && frame.held.includes('MOVE_RIGHT');
    return {
      frame,
      toward: !holdingBothDirections && frame.held.includes(towardAction),
      away: !holdingBothDirections && frame.held.includes(awayAction),
      defenseCombo: (action, window = balanceConfig.simultaneousInputWindow) =>
        frame.held.includes('DEFENSE') &&
        frame.pressed.includes(action) &&
        this.areSimultaneous(recent, 'DEFENSE', action, window),
      recentlyPressed: (action, window) =>
        recent.some((entry) => entry.action === action && tick - entry.tick <= window),
      sequence: (actions, window = balanceConfig.inputBufferWindow) =>
        hasSequence(recent, actions, tick - window),
      doubleTapped: holdingBothDirections ? null : this.findDoubleTap(recent, tick),
    };
  }

  reset() {
    this.history.clear();
  }

  private areSimultaneous(
    history: PressRecord[],
    first: GameAction,
    second: GameAction,
    window: number,
  ) {
    const firstTick = lastTick(history, first);
    const secondTick = lastTick(history, second);
    return firstTick !== null && secondTick !== null &&
      Math.abs(firstTick - secondTick) <= window;
  }

  private findDoubleTap(history: PressRecord[], tick: number) {
    for (const action of ['MOVE_LEFT', 'MOVE_RIGHT'] as const) {
      const taps = history.filter((entry) => entry.action === action);
      const previous = taps[taps.length - 2];
      const latest = taps[taps.length - 1];
      if (previous && latest?.tick === tick &&
        latest.tick - previous.tick <= balanceConfig.doubleTapWindow) return action;
    }
    return null;
  }
}

function lastTick(history: PressRecord[], action: GameAction) {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (history[index].action === action) return history[index].tick;
  }
  return null;
}

function isGameAction(action: string): action is GameAction {
  return [
    'MOVE_LEFT', 'MOVE_RIGHT', 'JUMP', 'LIGHT_ATTACK',
    'HEAVY_ATTACK', 'SPECIAL_ATTACK', 'DEFENSE', 'PAUSE',
  ].includes(action);
}

function hasSequence(
  history: PressRecord[],
  actions: readonly GameAction[],
  oldestTick: number,
) {
  let actionIndex = 0;
  for (const entry of history) {
    if (entry.tick < oldestTick || entry.action !== actions[actionIndex]) continue;
    actionIndex += 1;
    if (actionIndex === actions.length) return true;
  }
  return actions.length === 0;
}
