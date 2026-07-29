import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CombatAiAgent,
} from '../.sim-test-build/src/ai/index.js';
import {
  KADE_AI_LOADOUT,
} from '../.sim-test-build/src/data/combat-ai.js';
import {
  KADE_HURTBOXES,
  KADE_MOVES,
} from '../.sim-test-build/src/data/combat-moves.js';
import {
  CombatEngine,
} from '../.sim-test-build/src/sim/index.js';

test('AI drives the authoritative engine from neutral into a real hit', () => {
  const engine = new CombatEngine({
    moves: KADE_MOVES,
    fighters: [
      {
        id: 'player',
        team: 1,
        maxHealth: 1_000,
        spawn: { x: 0, y: 0 },
        facing: 1,
        hurtboxes: KADE_HURTBOXES,
      },
      {
        id: 'ai',
        team: 2,
        maxHealth: 1_000,
        spawn: { x: 1_800, y: 0 },
        facing: -1,
        hurtboxes: KADE_HURTBOXES,
      },
    ],
  });
  const agent = new CombatAiAgent({
    fighterId: 'ai',
    opponentId: 'player',
    difficulty: 'hard',
    moves: KADE_MOVES,
    loadout: KADE_AI_LOADOUT,
    seed: 11,
  });

  let combatEvents = [];
  let sawTelegraph = false;
  let landedHit = false;
  for (let frame = 0; frame < 600 && !landedHit; frame += 1) {
    const ai = agent.decide(engine.read(), combatEvents);
    sawTelegraph ||= ai.events.some((event) => event.type === 'telegraphStarted');
    const result = engine.tick({ ai: ai.input });
    combatEvents = result.events;
    landedHit = combatEvents.some(
      (event) => event.type === 'hit' && event.attackerId === 'ai',
    );
  }

  assert.equal(sawTelegraph, true);
  assert.equal(landedHit, true);
  const player = engine.read().fighters.find((fighter) => fighter.id === 'player');
  assert.ok(player.health < player.maxHealth);
});
