import type { RigPose } from '../types';

const RESET = {
  root: 'translate(0px, 0px) rotate(0deg)',
  body: 'translate(0px, 0px) rotate(0deg)',
  head: 'translate(0px, 0px) rotate(0deg)',
  frontArm: 'translate(0px, 0px) rotate(0deg)',
  backArm: 'translate(0px, 0px) rotate(0deg)',
  frontLeg: 'translate(0px, 0px) rotate(0deg)',
  backLeg: 'translate(0px, 0px) rotate(0deg)',
  staff: 'translate(0px, 0px) rotate(0deg)',
} as const;

export function resetPose(at: number): RigPose {
  return { at, transforms: RESET };
}
