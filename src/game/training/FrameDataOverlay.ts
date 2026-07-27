import type { AttackDefinition } from '../data/attacks/basicAttacks';

export type FrameData = {
  startup: number;
  active: number;
  recovery: number;
  total: number;
};

export function getFrameData(attack: AttackDefinition): FrameData {
  return {
    startup: attack.startupTicks,
    active: attack.activeTicks,
    recovery: attack.recoveryTicks,
    total: attack.startupTicks + attack.activeTicks + attack.recoveryTicks,
  };
}
