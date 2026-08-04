export { CombatEngine, type CombatEngineOptions, type CombatTickResult } from './combat-engine.js';
export { DEFAULT_WORLD_CONFIG, type CombatWorldConfig } from './config.js';
export {
  DASH_FRAMES,
  DASH_SPEED_MULTIPLIER,
  LUNGE_FRAMES,
  dashPhase,
} from './dash.js';
export type {
  CombatEvent,
  FighterDebugFrame,
  WallContactEvent,
  WallRunEvent,
  WallShatteredEvent,
  WallSpawnedEvent,
  WorldBox,
} from './events.js';
export {
  WallField,
  WALL_BLOCKING_LIMIT,
  WALL_RUN_MAX_FRAMES,
  WALL_SHATTER_FRAMES,
  WALL_TOTAL_LIMIT,
  isBlockingKind,
  type WallEntity,
  type WallKind,
  type WallSnapshot,
  type WallSpawnData,
  type WallState,
} from './walls/index.js';
export {
  movePhaseAt,
  totalMoveFrames,
  type AuthoredHitbox,
  type AuthoredHurtbox,
  type BlockData,
  type CancelWindow,
  type FrameRange,
  type GroundBounceData,
  type HitData,
  type MoveFrameData,
  type MoveObstacleData,
  type MovePhase,
  type WallBounceData,
} from './frame-data.js';
export {
  FixedStepRunner,
  SIMULATION_FPS,
  type FixedStepResult,
} from './fixed-step.js';
export {
  DEFAULT_IMPACT_ARMOUR,
  KNOCKDOWN_COOLDOWN_FRAMES,
  KNOCKDOWN_DOWN_FRAMES,
  KNOCKDOWN_FRAMES,
  KNOCKDOWN_GETUP_FRAMES,
  calculateImpactForce,
  knockdownPoseAmount,
} from './knockdown.js';
export {
  FIXED_SCALE,
  fixed,
  type FixedBox,
  type FixedVector,
  type Ratio,
} from './math.js';
export type {
  CombatInputs,
  FighterDefinition,
  FighterInput,
  FighterMovementData,
  FighterSnapshot,
  KnockdownPhase,
  WallRunPhase,
  WallRunState,
  WorldSnapshot,
} from './state.js';
