export type PlayerId = 'player1' | 'player2';
export type Facing = -1 | 1;

export type GameAction =
  | 'moveLeft'
  | 'moveRight'
  | 'jump'
  | 'lightAttack'
  | 'block'
  | 'pause'
  | 'exit';

export type FighterMode =
  | 'idle'
  | 'walking'
  | 'jumping'
  | 'attacking'
  | 'blocking'
  | 'hitstun'
  | 'knockout';

export type FighterSnapshot = {
  id: PlayerId;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  facing: Facing;
  health: number;
  mode: FighterMode;
  modeTicksRemaining: number;
  attackCooldownTicks: number;
  grounded: boolean;
};

export type InputFrame = Record<PlayerId, readonly GameAction[]>;

export type SimulationSnapshot = {
  tick: number;
  paused: boolean;
  winner: PlayerId | null;
  roundTicksRemaining: number;
  fighters: Record<PlayerId, FighterSnapshot>;
};

export type AttackHit = {
  attackerId: PlayerId;
  defenderId: PlayerId;
  damage: number;
  hitstunTicks: number;
};
