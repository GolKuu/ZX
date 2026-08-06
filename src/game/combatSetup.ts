import { CombatAiAgent, type AiDifficulty, type AiStrategy } from '@/src/ai';
import {
  DEFAULT_CHARACTER_SELECTION,
  getCharacterDefinition,
  type CharacterSelection,
  type CharacterId,
} from '@/src/data/characterRoster';
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
import { MIM_AI_LOADOUT } from '@/src/data/mim-ai';
import { MIM_HURTBOXES, MIM_MAX_HEALTH, MIM_MOVEMENT } from '@/src/data/mim';
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
import { useProgressionStore } from '@/src/store/progressionStore';
import { effectiveLoadout } from '@/src/progression/purchases';
import { compileFighterModifier, compileProgressionMoves } from '@/src/progression/runtimeModifiers';

/**
 * One flat table for the whole roster. The engine takes a single move set and
 * ids are globally unique; which character may use which move is decided by
 * the command tables in `src/input/`, not here.
 */
export const ALL_COMBAT_MOVES = [
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
  const mode=useHudStore.getState().mode;const profile=useProgressionStore.getState().profile;
  const progressionMode=mode==='training'?'training':mode==='story'?'story':mode==='ai'?'ai':'ranked';
  const playerNodes=effectiveLoadout(profile,selection[0],progressionMode,mode==='training'?'all':'purchased');
  return new CombatEngine({
    moves: compileProgressionMoves(ALL_COMBAT_MOVES,selection[0],playerNodes),
    fighters: [
      fighterDefinition('p1', 1, -1.55, 1, selection[0],playerNodes),
      fighterDefinition('p2', 2, 1.55, -1, selection[1]),
    ],
    world: { leftWall: fixed(-6.9), rightWall: fixed(6.9) },
  });
}

export function createCombatAi(
  characterId: CharacterId = 'mim',
  difficulty: AiDifficulty = 'normal',
  strategy?: AiStrategy,
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
          : MIM_AI_LOADOUT,
    strategy,
    seed: 29,
  });
}

export function createCombatHud(): HudBridge {
  const { fighterSelection, mode } = useHudStore.getState();
  const opponentTag = mode === 'training'
    ? 'DUMMY'
    : mode === 'ai' ? 'GEMINI' : mode === 'story' ? 'CPU' : 'P2';
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
        displayName: mode === 'training'
          ? 'МИШЕНЬ'
          : getCharacterDefinition(fighterSelection[1]).displayName,
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
  progressionNodes:readonly string[]=[],
) {
  const maxHealth=characterId === 'vorgh'
      ? VORGH_MAX_HEALTH : characterId === 'titan' ? TITAN_MAX_HEALTH : characterId === 'lucky'
      ? LUCKY_MAX_HEALTH : characterId === 'glitch' ? GLITCH_MAX_HEALTH : MIM_MAX_HEALTH;
  const baseMovement=characterId==='vorgh'?VORGH_MOVEMENT:characterId==='titan'?TITAN_MOVEMENT:characterId==='lucky'?LUCKY_MOVEMENT:characterId==='glitch'?GLITCH_MOVEMENT:MIM_MOVEMENT;
  const modifier=compileFighterModifier(characterId,progressionNodes,baseMovement,maxHealth);
  const character = getCharacterDefinition(characterId);
  return {
    id,
    team,
    maxHealth: modifier.maxHealth,
    impactArmour: character.impactArmour,
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
          : MIM_HURTBOXES,
    movement:modifier.movement,
    ...(characterId === 'lucky'
      ? {
          // Luck is earned by playing well, never by being hit:
          // `damageTakenPercent: 0` is what stops a losing Lucky from farming
          // the resource off their own health bar.
          resource: LUCKY_RESOURCE,
        }
      : characterId === 'glitch'
        ? { resource: GLITCH_DEFENSE_RULES }
        : {}),
    ...(characterId === 'vorgh'
      ? { resource: VORGH_RESOURCE }
      : {}),
  };
}
