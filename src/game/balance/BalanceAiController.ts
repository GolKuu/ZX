import { balanceConfig } from '../config/balanceConfig';
import type {
  CombatAction,
  PlayerId,
  PlayerInputFrame,
  SimulationSnapshot,
} from '../core/types';
import { findCharacterAttack } from '../data/attacks/characterAttacks';
import { getCharacter } from '../data/characters/circleFighters';
import type { AiDifficulty } from '../ai/AiDifficulty';
import { SeededRandom } from './SeededRandom';

const EMPTY: PlayerInputFrame = { held: [], pressed: [], released: [] };

const PROFILES = {
  EASY: { block: 0.3, perfect: 0.05, combo: 0.18, defense: 0.12, delay: [30, 52] },
  MEDIUM: { block: 0.48, perfect: 0.16, combo: 0.36, defense: 0.28, delay: [22, 40] },
  HARD: { block: 0.66, perfect: 0.3, combo: 0.55, defense: 0.46, delay: [15, 30] },
  VERY_HARD: { block: 0.82, perfect: 0.48, combo: 0.72, defense: 0.64, delay: [10, 23] },
} as const;

export class BalanceAiController {
  private readonly random: SeededRandom;
  private nextAttackTick = 0;
  private blockUntilTick = -1;
  private lastDefenseAttack = '';
  private lastComboAttempt = '';

  constructor(seed: number, private readonly difficulty: AiDifficulty) {
    this.random = new SeededRandom(seed);
  }

  frame(aiId: PlayerId, snapshot: SimulationSnapshot): PlayerInputFrame {
    if (snapshot.roundPhase !== 'ACTIVE') return EMPTY;
    const opponentId = aiId === 'player1' ? 'player2' : 'player1';
    const fighter = snapshot.fighters[aiId];
    const opponent = snapshot.fighters[opponentId];
    const profile = PROFILES[this.difficulty];

    const defensive = this.defensiveAction(aiId, opponentId, snapshot);
    if (defensive) return actionFrame(defensive);
    const continuation = this.comboContinuation(fighter, profile.combo);
    if (continuation) return actionFrame(continuation);

    const block = this.blockInput(opponent, snapshot.tick, profile.block, profile.perfect);
    if (block) return block;
    if (isLocked(fighter.mode)) return EMPTY;

    const held = this.movement(aiId, opponentId, snapshot);
    if (snapshot.tick < this.nextAttackTick) return { held, pressed: [], released: [] };
    const distance = Math.abs(fighter.x - opponent.x);
    if (distance > attackDistance(fighter.characterId)) {
      return { held, pressed: [], released: [] };
    }

    this.nextAttackTick =
      snapshot.tick + this.random.integer(profile.delay[0], profile.delay[1]);
    const attack = this.chooseAttack(fighter.energy);
    return { held: [...held, attack], pressed: [attack], released: [] };
  }

  private defensiveAction(
    aiId: PlayerId,
    opponentId: PlayerId,
    snapshot: SimulationSnapshot,
  ): CombatAction | null {
    const fighter = snapshot.fighters[aiId];
    const combo = snapshot.combos[opponentId];
    const chance = PROFILES[this.difficulty].defense;
    if (fighter.mode === 'hitstun' && combo.hits > 0) {
      if (
        combo.breakAllowed &&
        combo.breakWindowTicksRemaining > 0 &&
        fighter.defense.segments > 0 &&
        this.random.chance(chance)
      ) return 'COMBO_BREAK';
      if (combo.escapeWindowTicksRemaining > 0 && this.random.chance(chance)) {
        return 'COMBO_ESCAPE';
      }
    }
    if (
      fighter.mode === 'wakeup' &&
      fighter.modeTicksRemaining <= 1 &&
      fighter.energy >= balanceConfig.reversalCost &&
      this.random.chance(chance)
    ) return 'MOMENTUM_REVERSAL';
    return null;
  }

  private comboContinuation(
    fighter: SimulationSnapshot['fighters']['player1'],
    chance: number,
  ) {
    const runtime = fighter.attack;
    if (!runtime?.connected) return null;
    const definition = findCharacterAttack(fighter.characterId, runtime.id);
    const window = definition?.cancelWindows[0];
    if (!window || runtime.frame < window.startFrame || runtime.frame > window.endFrame) {
      return null;
    }
    const attempt = `${runtime.id}:${window.startFrame}`;
    if (attempt === this.lastComboAttempt) return null;
    this.lastComboAttempt = attempt;
    if (!this.random.chance(chance)) return null;
    return definition?.category === 'heavy' ? 'HEAVY_ATTACK' : 'LIGHT_ATTACK';
  }

  private blockInput(
    opponent: SimulationSnapshot['fighters']['player1'],
    tick: number,
    blockChance: number,
    perfectChance: number,
  ): PlayerInputFrame | null {
    if (tick <= this.blockUntilTick) {
      return { held: ['DEFENSE'], pressed: [], released: [] };
    }
    const runtime = opponent.attack;
    if (!runtime || runtime.phase === 'recovery') return null;
    const definition = findCharacterAttack(opponent.characterId, runtime.id);
    if (!definition) return null;
    const attackKey = `${runtime.id}:${opponent.id}:${runtime.frame < 2 ? tick : tick - runtime.frame}`;
    if (attackKey === this.lastDefenseAttack) return null;
    const waitForPerfect = this.random.chance(perfectChance);
    const reactAt = waitForPerfect ? Math.max(0, definition.startupFrames - 1) : 0;
    if (runtime.frame < reactAt) return null;
    this.lastDefenseAttack = attackKey;
    if (!this.random.chance(blockChance)) return null;
    this.blockUntilTick = tick + definition.activeFrames + 4;
    return { held: ['DEFENSE'], pressed: ['DEFENSE'], released: [] };
  }

  private movement(aiId: PlayerId, opponentId: PlayerId, snapshot: SimulationSnapshot) {
    const fighter = snapshot.fighters[aiId];
    const opponent = snapshot.fighters[opponentId];
    const distance = Math.abs(fighter.x - opponent.x);
    const desired = 72 + getCharacter(fighter.characterId).stats.range * 10;
    if (distance <= desired) return [] as CombatAction[];
    return [fighter.x < opponent.x ? 'MOVE_RIGHT' : 'MOVE_LEFT'] as CombatAction[];
  }

  private chooseAttack(energy: number): CombatAction {
    const roll = this.random.next();
    if (energy >= 35 && roll < 0.24) return 'SPECIAL_ATTACK';
    if (roll < 0.55) return 'HEAVY_ATTACK';
    return 'LIGHT_ATTACK';
  }
}

function isLocked(mode: string) {
  return ['attackStartup', 'attackActive', 'attackRecovery', 'hitstun',
    'blockstun', 'knockdown', 'wakeup', 'knockout'].includes(mode);
}

function attackDistance(characterId: string) {
  return 98 + getCharacter(characterId).stats.range * 12;
}

function actionFrame(action: CombatAction): PlayerInputFrame {
  return { held: [action], pressed: [action], released: [] };
}
