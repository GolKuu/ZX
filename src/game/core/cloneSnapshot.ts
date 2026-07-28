import type { FighterSnapshot, SimulationSnapshot } from './types';

function cloneFighter(fighter: FighterSnapshot): FighterSnapshot {
  return {
    ...fighter,
    defense: { ...fighter.defense },
    attack: fighter.attack
      ? { ...fighter.attack, hitHitboxes: [...fighter.attack.hitHitboxes] }
      : null,
  };
}

export function cloneSnapshot(snapshot: SimulationSnapshot): SimulationSnapshot {
  return {
    ...snapshot,
    wins: { ...snapshot.wins },
    fighters: {
      player1: cloneFighter(snapshot.fighters.player1),
      player2: cloneFighter(snapshot.fighters.player2),
    },
    combos: {
      player1: { ...snapshot.combos.player1 },
      player2: { ...snapshot.combos.player2 },
    },
  };
}
