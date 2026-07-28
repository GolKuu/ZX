import type { AttackDefinition } from '../data/attacks/basicAttacks';

export type FrameData = {
  startup: number;
  active: number;
  recovery: number;
  total: number;
};

export function getFrameData(attack: AttackDefinition): FrameData {
  return {
    startup: attack.startupFrames,
    active: attack.activeFrames,
    recovery: attack.recoveryFrames,
    total: attack.startupFrames + attack.activeFrames + attack.recoveryFrames,
  };
}
