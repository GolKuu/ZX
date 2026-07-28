import type { CombatAction, InputFrame, PlayerId } from './types';

const PLAYERS: readonly PlayerId[] = ['player1', 'player2'];

export class InputBuffer {
  private held = new Map<PlayerId, Set<CombatAction>>(PLAYERS.map((id) => [id, new Set()]));
  private pressed = new Map<PlayerId, Set<CombatAction>>(PLAYERS.map((id) => [id, new Set()]));
  private released = new Map<PlayerId, Set<CombatAction>>(PLAYERS.map((id) => [id, new Set()]));

  press(playerId: PlayerId, action: CombatAction) {
    const held = this.held.get(playerId)!;
    if (!held.has(action)) this.pressed.get(playerId)!.add(action);
    held.add(action);
  }

  release(playerId: PlayerId, action: CombatAction) {
    if (this.held.get(playerId)!.delete(action)) this.released.get(playerId)!.add(action);
  }

  consumePressed(playerId: PlayerId, action: CombatAction) {
    return this.pressed.get(playerId)!.delete(action);
  }

  snapshot(): InputFrame {
    return {
      player1: this.playerSnapshot('player1'),
      player2: this.playerSnapshot('player2'),
    };
  }

  clearEdges() {
    this.pressed.forEach((actions) => actions.clear());
    this.released.forEach((actions) => actions.clear());
  }

  clearPlayer(playerId: PlayerId) {
    this.held.get(playerId)!.clear();
    this.pressed.get(playerId)!.clear();
    this.released.get(playerId)!.clear();
  }

  clear() {
    PLAYERS.forEach((playerId) => this.clearPlayer(playerId));
  }

  private playerSnapshot(playerId: PlayerId) {
    return {
      held: [...this.held.get(playerId)!],
      pressed: [...this.pressed.get(playerId)!],
      released: [...this.released.get(playerId)!],
    };
  }
}
