import type {
  CombatAction,
  PlayerId,
  PlayerInputFrame,
  SimulationSnapshot,
} from '../core/types';
import { AI_TUNING, type AiDifficulty } from './AiDifficulty';

const EMPTY_INPUT: PlayerInputFrame = { held: [], pressed: [], released: [] };
const ACTIONABLE_MODES = new Set(['idle', 'walking', 'dashing', 'jumping']);

export class SoloAiController {
  constructor(private readonly difficulty: AiDifficulty = 'EASY') {}

  frame(aiId: PlayerId, snapshot: SimulationSnapshot): PlayerInputFrame {
    if (snapshot.roundPhase !== 'ACTIVE') return EMPTY_INPUT;

    const opponentId = aiId === 'player1' ? 'player2' : 'player1';
    const fighter = snapshot.fighters[aiId];
    const opponent = snapshot.fighters[opponentId];
    if (!ACTIONABLE_MODES.has(fighter.mode)) return EMPTY_INPUT;

    const tuning = AI_TUNING[this.difficulty];
    const distance = Math.abs(fighter.x - opponent.x);
    if (fighter.rhythmLockTicks > 0 || fighter.rhythmPressure >= 76) {
      return this.recoverRhythm(fighter.x, opponent.x, distance, tuning.defenseRange);
    }
    if (this.shouldDefend(distance, opponent.mode, tuning.defenseRange)) {
      return { held: ['DEFENSE'], pressed: [], released: [] };
    }
    if (opponent.rhythmLockTicks > 0 && distance <= tuning.attackRange) {
      const punish = fighter.energy >= 35 ? 'SPECIAL_ATTACK' : 'HEAVY_ATTACK';
      return { held: [punish], pressed: [punish], released: [] };
    }

    const held: CombatAction[] = [];
    const pressed: CombatAction[] = [];
    if (distance > tuning.approachDistance) {
      held.push(fighter.x < opponent.x ? 'MOVE_RIGHT' : 'MOVE_LEFT');
    }
    if (
      fighter.grounded &&
      distance > 210 &&
      snapshot.tick % tuning.jumpInterval === 0
    ) {
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

  private shouldDefend(distance: number, opponentMode: string, defenseRange: number) {
    return (
      distance < defenseRange &&
      (opponentMode === 'attackStartup' || opponentMode === 'attackActive')
    );
  }

  private recoverRhythm(
    fighterX: number,
    opponentX: number,
    distance: number,
    defenseRange: number,
  ): PlayerInputFrame {
    if (distance <= defenseRange) {
      return { held: ['DEFENSE'], pressed: [], released: [] };
    }
    const retreat = fighterX < opponentX ? 'MOVE_LEFT' : 'MOVE_RIGHT';
    return { held: [retreat], pressed: [], released: [] };
  }

  private attackFor(tick: number, distance: number, energy: number): CombatAction | null {
    const tuning = AI_TUNING[this.difficulty];
    if (distance > tuning.attackRange) return null;
    if (energy >= 35 && tick % tuning.specialAttackInterval === 0) {
      return 'SPECIAL_ATTACK';
    }
    if (tick % tuning.heavyAttackInterval === 0) return 'HEAVY_ATTACK';
    if (tick % tuning.lightAttackInterval === 0) return 'LIGHT_ATTACK';
    return null;
  }
}
