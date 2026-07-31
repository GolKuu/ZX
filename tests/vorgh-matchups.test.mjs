import assert from 'node:assert/strict';
import test from 'node:test';

import { KADE_HURTBOXES } from '../.sim-test-build/src/data/combat-moves.js';
import { GLITCH_HURTBOXES } from '../.sim-test-build/src/data/glitch-combat-moves.js';
import { LUCKY_HURTBOXES } from '../.sim-test-build/src/data/lucky/index.js';
import { TITAN_HURTBOXES } from '../.sim-test-build/src/data/titan/index.js';
import {
  VORGH_HURTBOXES,
  VORGH_MOVES,
  VORGH_NORMAL_IDS,
  VORGH_RESOURCE,
} from '../.sim-test-build/src/data/vorgh/index.js';
import { CombatEngine } from '../.sim-test-build/src/sim/combat-engine.js';
import { fixed } from '../.sim-test-build/src/sim/math.js';

const matchups = {
  Mim: KADE_HURTBOXES,
  Glitch: GLITCH_HURTBOXES,
  Lucky: LUCKY_HURTBOXES,
  Titan: TITAN_HURTBOXES,
};

for (const [name, hurtboxes] of Object.entries(matchups)) {
  test(`Vorgh's four role normals connect honestly against ${name}`, () => {
    for (const moveId of Object.values(VORGH_NORMAL_IDS).slice(0, 4)) {
      const engine = matchup(hurtboxes);
      const result = runMove(engine, moveId);
      assert.ok(
        result.events.some(({ type, attackerId }) =>
          type === 'hit' && attackerId === 'vorgh'),
        `${moveId} vs ${name}`,
      );
    }
  });
}

function matchup(targetHurtboxes) {
  return new CombatEngine({
    moves: VORGH_MOVES,
    fighters: [
      {
        id: 'vorgh', team: 1, maxHealth: 1050,
        spawn: { x: fixed(0), y: 0 }, facing: 1,
        hurtboxes: VORGH_HURTBOXES, resource: VORGH_RESOURCE,
      },
      {
        id: 'target', team: 2, maxHealth: 1000,
        spawn: { x: fixed(0.72), y: 0 }, facing: -1,
        hurtboxes: targetHurtboxes,
      },
    ],
  });
}

function runMove(engine, moveId) {
  let result = engine.tick({ vorgh: { move: moveId } });
  for (let frame = 0; frame < 24; frame += 1) {
    result = engine.tick();
    if (result.events.some(({ type }) => type === 'hit')) return result;
  }
  return result;
}
