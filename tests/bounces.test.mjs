import assert from 'node:assert/strict';
import test from 'node:test';
import {
  fighterDefinition,
  makeEngine,
  makeMove,
  readFighter,
} from './combat-test-utils.mjs';

test('wall bounce clamps to the wall and applies authored rebound velocity', () => {
  const move = makeMove({
    hitstun: 10,
    knockback: { x: 700, y: 200 },
    wallBounce: {
      count: 1,
      horizontalSpeed: 300,
      verticalSpeed: 150,
      minimumHitstun: 16,
    },
  });
  const engine = makeEngine(move, {
    fighters: [
      fighterDefinition('p1', 1, 1_400, 1),
      fighterDefinition('p2', 2, 2_500, -1),
    ],
    world: { rightWall: 3_000, gravityPerFrame: 50 },
  });

  engine.tick({ p1: { move: 'strike' } });
  const bounce = engine.tick();
  const defender = readFighter(bounce.state, 'p2');
  assert.equal(bounce.events.some((event) => event.type === 'wallBounce'), true);
  assert.equal(defender.position.x, 3_000);
  assert.equal(defender.velocity.x, -300);
  assert.equal(defender.velocity.y, 150);
  assert.equal(defender.hitstun, 16);

  const following = engine.tick();
  assert.equal(
    following.events.some((event) => event.type === 'wallBounce'),
    false,
  );
});

test('ground bounce triggers on downward crossing and cannot exceed its count', () => {
  const move = makeMove({
    hitstun: 30,
    knockback: { x: 80, y: 300 },
    groundBounce: {
      count: 1,
      verticalSpeed: 250,
      horizontalScale: { numerator: 1, denominator: 2 },
      minimumHitstun: 40,
    },
  });
  const engine = makeEngine(move, {
    world: { gravityPerFrame: 200 },
  });

  engine.tick({ p1: { move: 'strike' } });
  engine.tick();
  const bounce = engine.tick();
  const defender = readFighter(bounce.state, 'p2');
  assert.equal(bounce.events.some((event) => event.type === 'groundBounce'), true);
  assert.equal(defender.position.y, 0);
  assert.equal(defender.velocity.y, 250);
  assert.equal(defender.velocity.x, 40);
  assert.equal(defender.hitstun, 40);

  let extraBounces = 0;
  for (let frame = 0; frame < 10; frame += 1) {
    const result = engine.tick();
    extraBounces += result.events.filter(
      (event) => event.type === 'groundBounce',
    ).length;
  }
  assert.equal(extraBounces, 0);
  assert.equal(readFighter(engine.read(), 'p2').grounded, true);
});
