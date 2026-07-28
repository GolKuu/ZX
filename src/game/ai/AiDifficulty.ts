import type { FighterModifier } from '../core/SimulationStateFactory';

export const AI_DIFFICULTIES = [
  {
    id: 'EASY',
    label: 'Лёгкий',
    description: 'Текущий спокойный ИИ: редкие атаки и простые решения.',
  },
  {
    id: 'MEDIUM',
    label: 'Средний',
    description: 'Быстрее сближается, чаще атакует и раньше замечает угрозы.',
  },
  {
    id: 'HARD',
    label: 'Сложный',
    description: 'Агрессивно держит дистанцию и почти не оставляет пауз.',
  },
  {
    id: 'VERY_HARD',
    label: 'Очень сложный',
    description: 'Максимальная реакция, +25% здоровья и 35 стартовой энергии.',
  },
] as const;

export type AiDifficulty = (typeof AI_DIFFICULTIES)[number]['id'];

export type AiTuning = {
  approachDistance: number;
  attackRange: number;
  defenseRange: number;
  jumpInterval: number;
  lightAttackInterval: number;
  heavyAttackInterval: number;
  specialAttackInterval: number;
  fighterModifier?: FighterModifier;
};

export const AI_TUNING: Record<AiDifficulty, AiTuning> = {
  EASY: {
    approachDistance: 108,
    attackRange: 125,
    defenseRange: 155,
    jumpInterval: 173,
    lightAttackInterval: 31,
    heavyAttackInterval: 79,
    specialAttackInterval: 131,
  },
  MEDIUM: {
    approachDistance: 100,
    attackRange: 135,
    defenseRange: 175,
    jumpInterval: 127,
    lightAttackInterval: 23,
    heavyAttackInterval: 59,
    specialAttackInterval: 101,
  },
  HARD: {
    approachDistance: 92,
    attackRange: 145,
    defenseRange: 195,
    jumpInterval: 97,
    lightAttackInterval: 17,
    heavyAttackInterval: 43,
    specialAttackInterval: 73,
  },
  VERY_HARD: {
    approachDistance: 82,
    attackRange: 155,
    defenseRange: 220,
    jumpInterval: 71,
    lightAttackInterval: 11,
    heavyAttackInterval: 29,
    specialAttackInterval: 47,
    fighterModifier: { maxHealthMultiplier: 1.25, startingEnergy: 35 },
  },
};
