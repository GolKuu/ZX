import assert from 'node:assert/strict';
import test from 'node:test';

import {
  VORGH_MOVE_SPECS,
  VORGH_MOVES,
  VORGH_RESOURCE,
  VORGH_SPECIAL_IDS,
} from '../.sim-test-build/src/data/vorgh/index.js';
import { effectiveMoveFrames } from '../.sim-test-build/src/sim/frame-data.js';

test('zero-cost cancel graph has no pressure loop', () => {
  const free = new Map(
    VORGH_MOVES
      .filter(({ resourceCost }) => (resourceCost ?? 0) === 0)
      .map((move) => [move.id, move]),
  );
  for (const id of free.keys()) {
    assert.equal(hasCycle(id, id, free, new Set()), false, `cycle from ${id}`);
  }
});

test('dynamic Rage cancels are source-bounded and cannot self-cancel', () => {
  const sources = new Set(VORGH_RESOURCE.tierCancelFrom);
  const targets = new Set(VORGH_RESOURCE.tierCancelInto);
  for (const source of sources) assert.equal(targets.has(source), false);
  assert.ok(sources.size >= 4);
  assert.ok(targets.size >= 3);
});

test('high Rage adds exact recovery instead of erasing the tradeoff', () => {
  const move = VORGH_MOVES.find(({ id }) => id === VORGH_SPECIAL_IDS.rageSlash);
  assert.ok(move);
  assert.equal(effectiveMoveFrames(move, 100), move.startup + move.active + move.recovery);
  assert.equal(
    effectiveMoveFrames(move, 115),
    move.startup + move.active + Math.ceil(move.recovery * 1.15),
  );
});

test('heavy and armoured options remain punishable', () => {
  const ids = [
    VORGH_SPECIAL_IDS.berserkDash,
    VORGH_SPECIAL_IDS.armourBreaker,
    VORGH_SPECIAL_IDS.armourBreakerEx,
  ];
  for (const id of ids) {
    const spec = VORGH_MOVE_SPECS.find(({ move }) => move.id === id);
    assert.ok(spec);
    const maximumBlockstun = Math.max(
      0,
      ...spec.move.hitboxes.map(({ hit }) => hit.block?.blockstun ?? 0),
    );
    assert.ok(
      spec.move.recovery > maximumBlockstun,
      `${spec.name} must expose recovery after guard`,
    );
  }
});

test('armour is bounded to one hit and never negates all damage', () => {
  const armoured = VORGH_MOVES.filter(({ armour }) => armour !== undefined);
  assert.ok(armoured.length >= 2);
  for (const move of armoured) {
    assert.equal(move.armour.hits, 1);
    assert.ok(move.armour.damagePercent >= 65);
    assert.ok(move.armour.frames.toExclusive <= move.startup);
  }
});

function hasCycle(origin, current, moves, visiting) {
  if (visiting.has(current)) return current === origin;
  const move = moves.get(current);
  if (move === undefined) return false;
  const next = move.cancels?.flatMap(({ into }) => into) ?? [];
  const branch = new Set(visiting);
  branch.add(current);
  return next
    .filter((id) => moves.has(id))
    .some((id) => id === origin || hasCycle(origin, id, moves, branch));
}
