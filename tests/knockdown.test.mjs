import assert from 'node:assert/strict';
import test from 'node:test';
import {
  fighterDefinition,
  makeEngine,
  makeMove,
  readFighter,
} from './combat-test-utils.mjs';

function durableFighter(id, team, x, facing, impactArmour) {
  return {
    ...fighterDefinition(id, team, x, facing),
    maxHealth: 500,
    impactArmour,
  };
}

test('impact force above armour knocks a fighter down and locks controls', () => {
  const strike = makeMove({ damage: 100, knockback: { x: 160, y: 0 } });
  const engine = makeEngine(strike, {
    fighters: [
      durableFighter('p1', 1, 0, 1, 160),
      durableFighter('p2', 2, 1_200, -1, 109),
    ],
  });

  const impact = engine.tick({ p1: { move: 'strike' } });
  const fall = impact.events.find((event) => event.type === 'knockdown');
  assert.equal(fall?.impactForce, 110);
  assert.equal(fall?.armour, 109);
  assert.equal(readFighter(impact.state, 'p2').knockdownFrames, 90);
  assert.equal(readFighter(impact.state, 'p2').knockdownPhase, 'falling');
  assert.equal(readFighter(impact.state, 'p2').grounded, false);
  assert.ok(readFighter(impact.state, 'p2').velocity.y >= 170);

  engine.tick({ p2: { movement: 1, move: 'strike' } });
  assert.equal(readFighter(engine.read(), 'p2').action, null);

  while (readFighter(engine.read(), 'p2').knockdownPhase === 'falling') {
    engine.tick();
  }
  assert.equal(readFighter(engine.read(), 'p2').knockdownPhase, 'down');
  assert.equal(
    engine.readDebugFrames().find((entry) => entry.fighterId === 'p2')?.hurtboxes.length,
    0,
  );

  while (readFighter(engine.read(), 'p2').knockdownPhase === 'down') {
    engine.tick();
  }
  assert.equal(readFighter(engine.read(), 'p2').knockdownPhase, 'rising');
  assert.equal(
    engine.tick({ p2: { move: 'strike' } }).state.fighters
      .find((fighter) => fighter.id === 'p2')?.action,
    null,
  );
  while (readFighter(engine.read(), 'p2').knockdownFrames > 0) engine.tick();
  const recovered = engine.tick({ p2: { move: 'strike' } });
  assert.equal(readFighter(recovered.state, 'p2').action?.moveId, 'strike');
});

test('armour boundary and cooldown keep knockdowns rare', () => {
  const strike = makeMove({ damage: 100, knockback: { x: 160, y: 0 } });
  const resistant = makeEngine(strike, {
    fighters: [
      durableFighter('p1', 1, 0, 1, 160),
      durableFighter('p2', 2, 1_200, -1, 110),
    ],
  });
  assert.equal(
    resistant.tick({ p1: { move: 'strike' } }).events
      .some((event) => event.type === 'knockdown'),
    false,
  );

  const vulnerable = makeEngine(strike, {
    fighters: [
      durableFighter('p1', 1, 0, 1, 160),
      durableFighter('p2', 2, 1_200, -1, 109),
    ],
  });
  vulnerable.tick({ p1: { move: 'strike' } });
  for (let frame = 0; frame < 90; frame += 1) vulnerable.tick();
  const secondHit = vulnerable.tick({ p1: { move: 'strike' } });
  assert.equal(
    secondHit.events.some((event) => event.type === 'knockdown'),
    false,
  );
});
