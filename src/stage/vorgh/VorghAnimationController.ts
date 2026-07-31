import type { FighterSnapshot } from '../../sim/state.js';
import { visualTier } from './vorghPose.js';

export interface VorghPlayback {
  readonly clipId: string;
  readonly frame: number;
}

export interface VorghAnimationState {
  tier: 'low' | 'medium' | 'high';
  clipId: string;
  frame: number;
  wasGuarding: boolean;
  releaseFrames: number;
  lastSimulationFrame: number;
}

export function createVorghAnimationState(): VorghAnimationState {
  return {
    tier: 'low',
    clipId: 'idle-low',
    frame: 0,
    wasGuarding: false,
    releaseFrames: 0,
    lastSimulationFrame: -1,
  };
}

export function advanceVorghAnimation(
  state: VorghAnimationState,
  fighter: FighterSnapshot,
  simulationFrame = state.lastSimulationFrame + 1,
): VorghPlayback {
  if (simulationFrame === state.lastSimulationFrame) {
    return { clipId: state.clipId, frame: state.frame };
  }
  state.lastSimulationFrame = simulationFrame;
  const tier = visualTier(fighter.resource);
  if (state.wasGuarding && !fighter.guarding) state.releaseFrames = 8;
  const requested = chooseClip(state, fighter, tier);
  if (requested !== state.clipId) {
    state.clipId = requested;
    state.frame = 0;
  } else {
    state.frame += 1;
  }
  state.wasGuarding = fighter.guarding;
  if (state.releaseFrames > 0 && !fighter.guarding) state.releaseFrames -= 1;
  const frames = clipFrames(state.clipId);
  const looping = state.clipId.includes('idle-') || state.clipId.includes('-hold');
  state.frame = looping
    ? state.frame % frames
    : Math.min(state.frame, frames - 1);
  return { clipId: state.clipId, frame: state.frame };
}

function chooseClip(
  state: VorghAnimationState,
  fighter: FighterSnapshot,
  tier: VorghAnimationState['tier'],
): string {
  if (fighter.health === 0) return 'defeat';
  if (fighter.hitstun > 0) {
    if (fighter.resourceLockFrames > 0) return 'guard-break';
    return fighter.hitstun > 22 ? 'pain-to-power' : 'hurt-light';
  }
  if (fighter.guarding) {
    if (!fighter.grounded) return 'air-block';
    if (fighter.guardMode === 'pain') return 'pain-guard';
    const family = fighter.crouching ? 'crouch-block' : 'stand-block';
    if (fighter.hitstop > 0) return `${family}-${fighter.hitstop > 6 ? 'heavy' : 'light'}`;
    return fighter.guardFrames <= 3 ? `${family}-start` : `${family}-hold`;
  }
  if (state.releaseFrames > 0) {
    return fighter.crouching ? 'crouch-block-release' : 'stand-block-release';
  }
  if (fighter.action !== null) return fighter.action.moveId;
  if (!fighter.grounded) return fighter.velocity.y > 0 ? 'jump' : 'fall';
  if (state.clipId.startsWith('rage-')) {
    if (state.frame < clipFrames(state.clipId) - 1) return state.clipId;
    state.tier = stepTier(state.tier, tier);
  }
  if (tier !== state.tier) return transitionId(state.tier, tier);
  return `idle-${tier}`;
}

function stepTier(
  from: VorghAnimationState['tier'],
  target: VorghAnimationState['tier'],
): VorghAnimationState['tier'] {
  if (from === target) return from;
  if (from === 'low') return 'medium';
  if (from === 'high') return 'medium';
  return target === 'high' ? 'high' : 'low';
}

function transitionId(
  from: VorghAnimationState['tier'],
  to: VorghAnimationState['tier'],
): string {
  if (from === 'low') return 'rage-low-medium';
  if (to === 'low') return 'rage-medium-low';
  if (to === 'high') return 'rage-medium-high';
  return 'rage-high-medium';
}

function clipFrames(id: string): number {
  if (id.startsWith('idle-') || id.endsWith('-hold')) return 18;
  if (id === 'rage-medium-high' || id === 'rage-high-medium') return 14;
  if (id.startsWith('rage-')) return 12;
  return 8;
}
