import {
  CombatAiAgent,
} from '../.sim-test-build/src/ai/index.js';
import {
  KADE_AI_LOADOUT,
} from '../.sim-test-build/src/data/combat-ai.js';
import {
  KADE_MOVES,
} from '../.sim-test-build/src/data/combat-moves.js';

export function makeAgent(difficulty, seed = 1) {
  return new CombatAiAgent({
    fighterId: 'ai',
    opponentId: 'player',
    difficulty,
    moves: KADE_MOVES,
    loadout: KADE_AI_LOADOUT,
    seed,
  });
}

export function world(frame, options = {}) {
  return {
    frame,
    fighters: [
      fighter(
        'ai',
        2,
        options.aiX ?? 0,
        1,
        options.aiAction ?? null,
        options.aiHitstun ?? 0,
        options.aiHitstop ?? 0,
        options.aiHealth ?? 1_000,
      ),
      fighter(
        'player',
        1,
        options.playerX ?? 1_000,
        -1,
        options.playerAction ?? null,
        options.playerHitstun ?? 0,
        options.playerHitstop ?? 0,
        options.playerHealth ?? 1_000,
      ),
    ],
  };
}

export function action(moveId, frame, serial = 1) {
  return { moveId, frame, serial };
}

export function landedHit(frame, moveId = '5L') {
  return {
    type: 'hit',
    frame,
    attackerId: 'ai',
    defenderId: 'player',
    moveId,
    hitId: 'primary',
    damage: 30,
    position: { x: 500, y: 500 },
  };
}

function fighter(id, team, x, facing, activeAction, hitstun, hitstop, health) {
  return {
    id,
    team,
    health,
    maxHealth: 1_000,
    position: { x, y: 0 },
    previousPosition: { x, y: 0 },
    velocity: { x: 0, y: 0 },
    facing,
    grounded: true,
    guarding: false,
    hitstop,
    hitstun,
    action: activeAction,
  };
}
