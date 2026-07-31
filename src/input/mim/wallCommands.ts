import { MIM_SPECIAL_MOVE_IDS } from '../../data/mim-special-moves.js';
import type { CommandContext, CommandRow } from '../command.js';

function unlocked(moveId: string) {
  return ({ unlockedMoves }: CommandContext): boolean =>
    unlockedMoves === undefined || unlockedMoves.has(moveId);
}

/**
 * MIM's wall grammar: a held direction says *where*, the button pair says
 * *what*. J/K build and climb; I/L drive and dive.
 *
 * Order matters — the engine takes the first row that matches, so the
 * four-button story chords sit above the three-button supers that contain them.
 */
export const MIM_WALL_COMMANDS: readonly CommandRow[] = [
  // D + J + K + I — Wall Prison. Above Mirror Arena, which is the same chord
  // without a direction.
  {
    moveId: MIM_SPECIAL_MOVE_IDS.wallPrison,
    motion: 'none',
    button: 'lp',
    alsoPressed: ['lk', 'hp'],
    forbiddenPressed: ['hk'],
    holdDirection: 'forward',
    stance: 'any',
    available: unlocked(MIM_SPECIAL_MOVE_IDS.wallPrison),
  },
  // W + J + K + L — Sky Runner.
  {
    moveId: MIM_SPECIAL_MOVE_IDS.skyRunner,
    motion: 'none',
    button: 'lp',
    alsoPressed: ['lk', 'hk'],
    forbiddenPressed: ['hp'],
    holdDirection: 'up',
    stance: 'any',
    available: unlocked(MIM_SPECIAL_MOVE_IDS.skyRunner),
  },
  // Special 1 — D + J + K.
  {
    moveId: MIM_SPECIAL_MOVE_IDS.invisibleWall,
    motion: 'none',
    button: 'lp',
    alsoPressed: ['lk'],
    forbiddenPressed: ['hp', 'hk'],
    holdDirection: 'forward',
    stance: 'any',
  },
  // Special 3 — W + J + K.
  {
    moveId: MIM_SPECIAL_MOVE_IDS.wallRun,
    motion: 'none',
    button: 'lp',
    alsoPressed: ['lk'],
    forbiddenPressed: ['hp', 'hk'],
    holdDirection: 'up',
    stance: 'any',
  },
  // A + J + K — Rear Wall.
  {
    moveId: MIM_SPECIAL_MOVE_IDS.rearWall,
    motion: 'none',
    button: 'lp',
    alsoPressed: ['lk'],
    forbiddenPressed: ['hp', 'hk'],
    holdDirection: 'back',
    stance: 'any',
    available: unlocked(MIM_SPECIAL_MOVE_IDS.rearWall),
  },
  // S + J + K — Wall Shield.
  {
    moveId: MIM_SPECIAL_MOVE_IDS.wallShield,
    motion: 'none',
    button: 'lp',
    alsoPressed: ['lk'],
    forbiddenPressed: ['hp', 'hk'],
    holdDirection: 'down',
    stance: 'any',
    available: unlocked(MIM_SPECIAL_MOVE_IDS.wallShield),
  },
  // Special 2 — D + I + L.
  {
    moveId: MIM_SPECIAL_MOVE_IDS.wallLaunch,
    motion: 'none',
    button: 'hp',
    alsoPressed: ['hk'],
    forbiddenPressed: ['lp', 'lk'],
    holdDirection: 'forward',
    stance: 'any',
  },
  // W + I + L — Wall Dive.
  {
    moveId: MIM_SPECIAL_MOVE_IDS.wallDive,
    motion: 'none',
    button: 'hp',
    alsoPressed: ['hk'],
    forbiddenPressed: ['lp', 'lk'],
    holdDirection: 'up',
    stance: 'any',
    available: unlocked(MIM_SPECIAL_MOVE_IDS.wallDive),
  },
  // A + I + L — Reverse Butterfly.
  {
    moveId: MIM_SPECIAL_MOVE_IDS.reverseButterfly,
    motion: 'none',
    button: 'hp',
    alsoPressed: ['hk'],
    forbiddenPressed: ['lp', 'lk'],
    holdDirection: 'back',
    stance: 'any',
    available: unlocked(MIM_SPECIAL_MOVE_IDS.reverseButterfly),
  },
  // D + K + L — Triple Kick.
  {
    moveId: MIM_SPECIAL_MOVE_IDS.tripleKick,
    motion: 'none',
    button: 'lk',
    alsoPressed: ['hk'],
    forbiddenPressed: ['lp', 'hp'],
    holdDirection: 'forward',
    stance: 'any',
    available: unlocked(MIM_SPECIAL_MOVE_IDS.tripleKick),
  },
  // W + J + I — Air Vault.
  {
    moveId: MIM_SPECIAL_MOVE_IDS.airVault,
    motion: 'none',
    button: 'lp',
    alsoPressed: ['hp'],
    forbiddenPressed: ['lk', 'hk'],
    holdDirection: 'up',
    stance: 'any',
    available: unlocked(MIM_SPECIAL_MOVE_IDS.airVault),
  },
];
