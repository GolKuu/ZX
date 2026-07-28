import type {
  CombatAction,
  PlayerId,
  PlayerInputFrame,
  SimulationSnapshot,
} from '../core/types';

const EMPTY_INPUT: PlayerInputFrame = { held: [], pressed: [], released: [] };
const ACTIONABLE_MODES = new Set(['idle', 'walking', 'dashing', 'jumping']);

export class SoloAiController {
  frame(aiId: PlayerId, snapshot: SimulationSnapshot): PlayerInputFrame {
    if (snapshot.roundPhase !== 'ACTIVE') return EMPTY_INPUT;

    const opponentId = aiId === 'player1' ? 'player2' : 'player1';
    const fighter = snapshot.fighters[aiId];
    const opponent = snapshot.fighters[opponentId];
    if (!ACTIONABLE_MODES.has(fighter.mode)) return EMPTY_INPUT;

    const distance = Math.abs(fighter.x - opponent.x);
    if (this.shouldDefend(distance, opponent.mode)) {
      return { held: ['DEFENSE'], pressed: [], released: [] };
    }

    const held: CombatAction[] = [];
    const pressed: CombatAction[] = [];
    if (distance > 108) {
      held.push(fighter.x < opponent.x ? 'MOVE_RIGHT' : 'MOVE_LEFT');
    }
    if (fighter.grounded && distance > 210 && snapshot.tick % 173 === 0) {
      held.push('JUMP');
      pressed.push('JUMP');
    }

    const attack = this.attackFor(snapshot.tick, distance, fighter.energy);
    if (attack) {
      held.push(attack);
      pressed.push(attack);
    }
    return { held, pressed, released: [] };
  }

  private shouldDefend(distance: number, opponentMode: string) {
    return (
      distance < 155 &&
      (opponentMode === 'attackStartup' || opponentMode === 'attackActive')
    );
  }

  private attackFor(tick: number, distance: number, energy: number): CombatAction | null {
    if (distance > 125) return null;
    if (energy >= 35 && tick % 131 === 0) return 'SPECIAL_ATTACK';
    if (tick % 79 === 0) return 'HEAVY_ATTACK';
    if (tick % 31 === 0) return 'LIGHT_ATTACK';
    return null;
  }
}
