import type { FighterSnapshot } from '@/src/sim';
import { GLITCH_DEFENSE_STATES } from '@/src/data/glitch/character';

export type GlitchDefenseState = (typeof GLITCH_DEFENSE_STATES)[number];

interface DefenseMemory {
  guarding: boolean;
  crouching: boolean;
  facing: -1 | 1;
}

const memory = new Map<string, DefenseMemory>();

/**
 * Runtime defense clip selector. The simulation owns timing; this only names
 * the visual reaction selected from the current and previous snapshots.
 */
export function readGlitchDefenseState(
  fighter: FighterSnapshot,
): GlitchDefenseState | null {
  const previous = memory.get(fighter.id);
  memory.set(fighter.id, {
    guarding: fighter.guarding,
    crouching: fighter.crouching,
    facing: fighter.facing,
  });

  if (fighter.action?.moveId.includes('throw-escape') === true) {
    return 'throw-escape';
  }
  if (!fighter.guarding) {
    if (fighter.guardHealth <= 45 && fighter.hitstun > 0) return 'guard-break';
    if (previous?.guarding === true) {
      return fighter.hitstun > 0 ? 'block-stun-recovery' : release(previous);
    }
    return null;
  }
  if (!fighter.grounded) return 'air-block';
  if (previous !== undefined && previous.facing !== fighter.facing) {
    return 'cross-up-block-turn';
  }
  if (fighter.hitstun > 0 && fighter.guardFrames <= 3) return 'perfect-block';
  if (fighter.guardHealth <= 18) return 'guard-crush';
  if (fighter.hitstun <= 6 && fighter.hitstun > 0) return 'chip-reaction';
  if (fighter.crouching) {
    if (fighter.guardFrames <= 4) return 'crouch-block-start';
    if (fighter.hitstun > 14) return 'crouch-block-heavy-impact';
    if (fighter.hitstun > 0) return 'crouch-block-light-impact';
    return 'crouch-block-hold';
  }
  if (fighter.guardFrames <= 4) return 'stand-block-start';
  if (fighter.hitstun > 14) return 'stand-block-heavy-impact';
  if (fighter.hitstun > 0) return 'stand-block-light-impact';
  return 'stand-block-hold';
}

function release(memoryState: DefenseMemory): GlitchDefenseState {
  return memoryState.crouching
    ? 'crouch-block-release'
    : 'stand-block-release';
}
