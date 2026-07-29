import { CombatAiAgent } from '@/src/ai';
import { KADE_AI_LOADOUT } from '@/src/data/combat-ai';
import { getCharacterDefinition } from '@/src/data/characterRoster';
import { KADE_HURTBOXES, KADE_MOVES } from '@/src/data/combat-moves';
import { HudBridge } from '@/src/hud';
import {
  CombatEngine,
  fixed,
  type WorldSnapshot,
} from '@/src/sim';
import { useHudStore } from '@/src/store/hudStore';

export function createCombatEngine(): CombatEngine {
  return new CombatEngine({
    moves: KADE_MOVES,
    fighters: [
      fighterDefinition('p1', 1, -1.55, 1),
      fighterDefinition('p2', 2, 1.55, -1),
    ],
    world: { leftWall: fixed(-4.8), rightWall: fixed(4.8) },
  });
}

export function createCombatAi(): CombatAiAgent {
  return new CombatAiAgent({
    fighterId: 'p2',
    opponentId: 'p1',
    difficulty: 'normal',
    moves: KADE_MOVES,
    loadout: KADE_AI_LOADOUT,
    seed: 29,
  });
}

export function createCombatHud(): HudBridge {
  const { fighterSelection, mode } = useHudStore.getState();
  const opponentTag = mode === 'ai' ? 'CPU' : 'P2';
  return new HudBridge(
    [
      {
        id: 'p1',
        displayName: getCharacterDefinition(fighterSelection[0]).displayName,
        playerTag: 'P1',
        side: 'left',
      },
      {
        id: 'p2',
        displayName: getCharacterDefinition(fighterSelection[1]).displayName,
        playerTag: opponentTag,
        side: 'right',
      },
    ],
    (snapshot) => useHudStore.getState().publishSnapshot(snapshot),
  );
}

export function readFighter(world: WorldSnapshot, id: string) {
  const result = world.fighters.find((entry) => entry.id === id);
  if (result === undefined) throw new Error(`Missing fighter "${id}"`);
  return result;
}

function fighterDefinition(
  id: string,
  team: number,
  x: number,
  facing: -1 | 1,
) {
  return {
    id,
    team,
    maxHealth: 1_000,
    spawn: { x: fixed(x), y: 0 },
    facing,
    hurtboxes: KADE_HURTBOXES,
  };
}
