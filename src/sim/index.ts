export { CombatEngine, type CombatEngineOptions, type CombatTickResult } from './combat-engine.js';
export { DEFAULT_WORLD_CONFIG, type CombatWorldConfig } from './config.js';
export { DASH_FRAMES, DASH_SPEED_MULTIPLIER, dashPhase } from './dash.js';
export type { CombatEvent, FighterDebugFrame, WorldBox } from './events.js';
export {
  movePhaseAt,
  totalMoveFrames,
  type AuthoredHitbox,
  type AuthoredHurtbox,
  type BlockData,
  type CancelWindow,
  type GroundBounceData,
  type HitData,
  type MoveFrameData,
  type MovePhase,
  type WallBounceData,
} from './frame-data.js';
export {
  FixedStepRunner,
  SIMULATION_FPS,
  type FixedStepResult,
} from './fixed-step.js';
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
  WorldSnapshot,
} from './state.js';
