import type { FighterSnapshot, SimulationSnapshot } from './types';
import { cloneTeamBattle } from '../team/TeamSnapshotUtils';
import type { TeamSimulationSnapshot } from '../team/TeamTypes';

function cloneFighter(fighter: FighterSnapshot): FighterSnapshot {
  return {
    ...fighter,
    defense: { ...fighter.defense },
    attack: fighter.attack
      ? { ...fighter.attack, hitHitboxes: [...fighter.attack.hitHitboxes] }
      : null,
  };
}

export function cloneSnapshot<T extends SimulationSnapshot>(snapshot: T): T {
  const cloned: SimulationSnapshot & {
    teamBattle?: TeamSimulationSnapshot['teamBattle'];
  } = {
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
    traps: snapshot.traps.map((trap) => ({ ...trap })),
  };
  if ('teamBattle' in snapshot) {
    cloned.teamBattle = cloneTeamBattle(
      (snapshot as TeamSimulationSnapshot).teamBattle,
    );
  }
  return cloned as T;
}
