import { CombatAiAgent, type AiDifficulty } from '@/src/ai';
import { KADE_AI_LOADOUT } from '@/src/data/combat-ai';
import {
  DEFAULT_CHARACTER_SELECTION,
  getCharacterDefinition,
  type CharacterSelection,
  type CharacterId,
} from '@/src/data/characterRoster';
import { KADE_HURTBOXES, KADE_MOVES } from '@/src/data/combat-moves';
import { glitchAiLoadout } from '@/src/data/glitch-ai';
import {
  GLITCH_HURTBOXES,
  GLITCH_DEFENSE_RULES,
  GLITCH_MAX_HEALTH,
  GLITCH_MOVEMENT,
  GLITCH_MOVES,
} from '@/src/data/glitch-combat-moves';
import { GLITCH_SUPER_MOVES } from '@/src/data/glitch-super-moves';
import { MIM_MOVES } from '@/src/data/mim-moves';
import { MIM_SPECIAL_MOVES } from '@/src/data/mim-special-moves';
import { MIM_SUPER_MOVES } from '@/src/data/mim-super-moves';
import {
  LUCKY_AI_LOADOUT,
  LUCKY_HURTBOXES,
  LUCKY_MAX_HEALTH,
  LUCKY_MOVEMENT,
  LUCKY_MOVES,
  LUCKY_RESOURCE,
  LUCKY_SPECIAL_MOVES,
  LUCKY_SUPER_MOVES,
} from '@/src/data/lucky';
import {
  VORGH_AI_LOADOUTS,
  VORGH_HURTBOXES,
  VORGH_MAX_HEALTH,
  VORGH_MOVEMENT,
  VORGH_MOVES,
  VORGH_RESOURCE,
} from '@/src/data/vorgh';
import { TAUNT_MOVES } from '@/src/data/taunt-move';
import {
  TITAN_AI_LOADOUT,
  TITAN_ALL_MOVES,
  TITAN_HURTBOXES,
  TITAN_MAX_HEALTH,
  TITAN_MOVEMENT,
} from '@/src/data/titan';
import { HudBridge } from '@/src/hud';
import {
  CombatEngine,
  fixed,
  type WorldSnapshot,
} from '@/src/sim';
import { useHudStore } from '@/src/store/hudStore';

/**
 * One flat table for the whole roster. The engine takes a single move set and
 * ids are globally unique; which character may use which move is decided by
 * the command tables in `src/input/`, not here.
 */
export const ALL_COMBAT_MOVES = [
  ...KADE_MOVES,
  ...MIM_MOVES,
  ...MIM_SPECIAL_MOVES,
  ...MIM_SUPER_MOVES,
  ...GLITCH_MOVES,
  ...GLITCH_SUPER_MOVES,
  ...LUCKY_MOVES,
  ...LUCKY_SPECIAL_MOVES,
  ...LUCKY_SUPER_MOVES,
  ...VORGH_MOVES,
  ...TITAN_ALL_MOVES,
  ...TAUNT_MOVES,
];

export function createCombatEngine(
  selection: CharacterSelection = DEFAULT_CHARACTER_SELECTION,
): CombatEngine {
  return new CombatEngine({
    moves: ALL_COMBAT_MOVES,
    fighters: [
      fighterDefinition('p1', 1, -1.55, 1, selection[0]),
      fighterDefinition('p2', 2, 1.55, -1, selection[1]),
    ],
    world: { leftWall: fixed(-4.8), rightWall: fixed(4.8) },
  });
}

export function createCombatAi(
  characterId: CharacterId = 'mim',
  difficulty: AiDifficulty = 'normal',
): CombatAiAgent {
  return new CombatAiAgent({
    fighterId: 'p2',
    opponentId: 'p1',
    difficulty,
    moves: ALL_COMBAT_MOVES,
    loadout: characterId === 'vorgh'
      ? VORGH_AI_LOADOUTS[difficulty]
      : characterId === 'titan'
        ? TITAN_AI_LOADOUT
      : characterId === 'lucky'
      ? LUCKY_AI_LOADOUT
      : characterId === 'glitch'
          ? glitchAiLoadout(difficulty)
          : KADE_AI_LOADOUT,
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
  characterId: CharacterId,
) {
  return {
    id,
    team,
    maxHealth: characterId === 'vorgh'
      ? VORGH_MAX_HEALTH
      : characterId === 'titan'
        ? TITAN_MAX_HEALTH
      : characterId === 'lucky'
        ? LUCKY_MAX_HEALTH
        : characterId === 'glitch'
          ? GLITCH_MAX_HEALTH
          : 1_000,
    spawn: { x: fixed(x), y: 0 },
    facing,
    hurtboxes: characterId === 'vorgh'
      ? VORGH_HURTBOXES
      : characterId === 'titan'
        ? TITAN_HURTBOXES
      : characterId === 'lucky'
        ? LUCKY_HURTBOXES
        : characterId === 'glitch'
          ? GLITCH_HURTBOXES
          : KADE_HURTBOXES,
    ...(characterId === 'lucky'
      ? {
          movement: LUCKY_MOVEMENT,
          // Luck is earned by playing well, never by being hit:
          // `damageTakenPercent: 0` is what stops a losing Lucky from farming
          // the resource off their own health bar.
          resource: LUCKY_RESOURCE,
        }
      : characterId === 'glitch'
        ? { movement: GLITCH_MOVEMENT, resource: GLITCH_DEFENSE_RULES }
        : {}),
    ...(characterId === 'vorgh'
      ? { movement: VORGH_MOVEMENT, resource: VORGH_RESOURCE }
      : {}),
    ...(characterId === 'titan' ? { movement: TITAN_MOVEMENT } : {}),
  };
}
