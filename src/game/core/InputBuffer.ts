import type { GameAction, InputFrame, PlayerId } from './types';

const PLAYERS: readonly PlayerId[] = ['player1', 'player2'];

export class InputBuffer {
  private held = new Map<PlayerId, Set<GameAction>>(PLAYERS.map((id) => [id, new Set()]));
  private pressed = new Map<PlayerId, Set<GameAction>>(PLAYERS.map((id) => [id, new Set()]));

  press(playerId: PlayerId, action: GameAction) {
    const held = this.held.get(playerId)!;
    if (!held.has(action)) this.pressed.get(playerId)!.add(action);
    held.add(action);
  }

  release(playerId: PlayerId, action: GameAction) {
    this.held.get(playerId)!.delete(action);
  }

  consumePressed(playerId: PlayerId, action: GameAction) {
    return this.pressed.get(playerId)!.delete(action);
  }

  snapshot(): InputFrame {
    return {
      player1: [...this.held.get('player1')!],
      player2: [...this.held.get('player2')!],
    };
  }

  clearPressed() {
    this.pressed.forEach((actions) => actions.clear());
  }

  clear() {
    this.held.forEach((actions) => actions.clear());
    this.clearPressed();
  }
}
