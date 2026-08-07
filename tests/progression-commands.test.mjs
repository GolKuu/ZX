import assert from 'node:assert/strict';
import test from 'node:test';

import { progressionMoveCommands } from '../.sim-test-build/src/progression/moveCommands.js';
import { PROGRESSION_NODES } from '../.sim-test-build/src/progression/treeData.js';

test('every Progression Hub affected move has a real animated command', () => {
  for (const node of PROGRESSION_NODES) {
    const commands = progressionMoveCommands(node.fighterId, node.affectedMoves);
    assert.equal(
      commands.length,
      node.affectedMoves.length,
      `${node.id} contains an affected move with no combat command`,
    );
    for (const command of commands) {
      assert.ok(command.steps.length > 0, `${command.moveId} has no input steps`);
      assert.ok(command.steps.every((step) => step.keys.length > 0));
      assert.ok(command.notation.length > 0);
    }
  }
});

test('simultaneous progression commands keep attack buttons together', () => {
  const [command] = progressionMoveCommands('mim', ['mim.dual.mirror-strike']);
  assert.ok(command);
  assert.deepEqual(command.steps.at(-1)?.keys, ['J', 'K']);
  assert.equal(command.notation, 'J+K');
});

test('motion commands animate directions before the attack button', () => {
  const [command] = progressionMoveCommands('titan', ['titan.special.armour-charge']);
  assert.ok(command);
  assert.equal(command.notation, 'S → S+D → D → L');
});
