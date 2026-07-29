export type PlayerId = 'player1' | 'player2';
export type Facing = -1 | 1;

export const GAME_ACTIONS = [
  'MOVE_LEFT',
  'MOVE_RIGHT',
  'JUMP',
  'CROUCH',
  'LIGHT_ATTACK',
  'HEAVY_ATTACK',
  'SPECIAL_ATTACK',
  'BLOCK',
  'GRAB',
  'SUPER_ATTACK',
  'COMBO_ESCAPE',
  'MOMENTUM_REVERSAL',
  'PAUSE',
] as const;

export type GameAction = (typeof GAME_ACTIONS)[number];

export type FighterMode =
  | 'idle'
  | 'walking'
  | 'dashing'
  | 'jumping'
  | 'crouching'
  | 'blocking'
  | 'attackStartup'
  | 'attackActive'
  | 'attackRecovery'
  | 'hitstun'
  | 'blockstun'
  | 'knockdown'
  | 'wakeup'
  | 'knockout';

export type AttackRuntimeSnapshot = {
  id: string;
  frame: number;
  phase: 'startup' | 'active' | 'recovery';
  hitHitboxes: number[];
  connected: boolean;
};

export type FighterSnapshot = {
  id: PlayerId;
  characterId: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  facing: Facing;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  blockMeter: number;
  maxBlockMeter: number;
  guard: 'standing' | 'crouching' | null;
  mode: FighterMode;
  modeTicksRemaining: number;
  attack: AttackRuntimeSnapshot | null;
  dashTicksRemaining: number;
  dashDirection: Facing;
  lastMoveTapAction: 'MOVE_LEFT' | 'MOVE_RIGHT' | null;
  lastMoveTapTick: number;
  grounded: boolean;
};

export type ComboSnapshot = {
  hits: number;
  damage: number;
  targetId: PlayerId | null;
  remainingTicks: number;
};

export type PlayerInputFrame = {
  held: readonly GameAction[];
  pressed: readonly GameAction[];
  released: readonly GameAction[];
};

export type InputFrame = Record<PlayerId, PlayerInputFrame>;

export type RoundPhase = 'COUNTDOWN' | 'ACTIVE' | 'ROUND_OVER' | 'MATCH_OVER';

export type SimulationSnapshot = {
  tick: number;
  paused: boolean;
  roundNumber: number;
  roundPhase: RoundPhase;
  phaseTicksRemaining: number;
  roundWinner: PlayerId | null;
  matchWinner: PlayerId | null;
  wins: Record<PlayerId, number>;
  roundTicksRemaining: number;
  fighters: Record<PlayerId, FighterSnapshot>;
  combos: Record<PlayerId, ComboSnapshot>;
};
