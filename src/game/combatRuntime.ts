import type { FighterSnapshot, WorldSnapshot } from '@/src/sim';

interface CombatRenderFrame {
  world: WorldSnapshot | null;
  interpolationAlpha: number;
}

export const combatRenderFrame: CombatRenderFrame = {
  world: null,
  interpolationAlpha: 0,
};

let requestedReset = 0;

export function publishCombatFrame(
  world: WorldSnapshot,
  interpolationAlpha: number,
): void {
  combatRenderFrame.world = world;
  combatRenderFrame.interpolationAlpha = interpolationAlpha;
}

export function requestCombatReset(): void {
  requestedReset += 1;
}

export function readCombatResetVersion(): number {
  return requestedReset;
}

export function readCombatFighter(id: string): FighterSnapshot | null {
  const fighters = combatRenderFrame.world?.fighters;
  if (fighters === undefined) return null;
  for (const fighter of fighters) {
    if (fighter.id === id) return fighter;
  }
  return null;
}
