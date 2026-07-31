export interface VorghClip {
  readonly id: string;
  readonly frames: number;
  readonly loop: boolean;
  readonly category: 'idle' | 'transition' | 'move' | 'defense' | 'reaction';
}

const defense = [
  'stand-block-start', 'stand-block-hold', 'stand-block-light',
  'stand-block-heavy', 'stand-block-release', 'crouch-block-start',
  'crouch-block-hold', 'crouch-block-light', 'crouch-block-heavy',
  'crouch-block-release', 'air-block', 'cross-up-turn', 'chip-reaction',
  'guard-crush', 'guard-break', 'throw-escape', 'perfect-block',
  'pain-guard', 'block-stun-recovery',
] as const;

const reactions = [
  'hurt-light', 'hurt-heavy', 'pain-to-power', 'launch', 'knockdown',
  'grounded', 'get-up', 'defeat', 'victory', 'walk', 'dash', 'jump',
  'fall', 'land', 'turn',
] as const;

export const VORGH_ANIMATION_CLIPS: readonly VorghClip[] = [
  clip('idle-low', 18, true, 'idle'),
  clip('idle-medium', 18, true, 'idle'),
  clip('idle-high', 18, true, 'idle'),
  clip('rage-low-medium', 12, false, 'transition'),
  clip('rage-medium-low', 12, false, 'transition'),
  clip('rage-medium-high', 14, false, 'transition'),
  clip('rage-high-medium', 14, false, 'transition'),
  ...defense.map((id) => clip(id, id.includes('hold') ? 18 : 8, id.includes('hold'), 'defense')),
  ...reactions.map((id) => clip(id, id === 'walk' || id === 'grounded', id === 'walk' ? 18 : 12, 'reaction')),
] as const;

function clip(
  id: string,
  frames: number,
  loop: boolean,
  category: VorghClip['category'],
): VorghClip {
  return { id, frames, loop, category };
}
