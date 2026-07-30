import assert from 'node:assert/strict';
import test from 'node:test';
import {
  fighterDefinition,
  makeEngine,
  makeMove,
  readFighter,
} from './combat-test-utils.mjs';

test('startup, active, and recovery use exact half-open frame windows', () => {
  const move = makeMove({ startup: 2, active: 2, recovery: 3 });
  const engine = makeEngine(move);

  assert.equal(hitEvents(engine.tick({ p1: { move: 'strike' } })).length, 0);
  assert.equal(readFighter(engine.read(), 'p1').action.frame, 1);
  assert.equal(hitEvents(engine.tick()).length, 0);

  const activeDebug = engine.readDebugFrames().find((frame) => frame.fighterId === 'p1');
  assert.equal(activeDebug.phase, 'active');
  assert.equal(activeDebug.hitboxes.length, 1);

  const impact = engine.tick();
  assert.equal(hitEvents(impact).length, 1);
  assert.equal(readFighter(impact.state, 'p2').health, 90);

  engine.tick();
  assert.equal(readFighter(engine.read(), 'p2').health, 90);
  engine.tick();
  engine.tick();
  const ended = engine.tick();
  assert.equal(readFighter(ended.state, 'p1').action, null);
  assert.equal(ended.events.some((event) => event.type === 'moveEnded'), true);
});

test('asymmetric hitstop freezes action, movement, and hitstun counters', () => {
  const move = makeMove({
    active: 1,
    recovery: 1,
    hitstop: { attacker: 2, defender: 3 },
    hitstun: 4,
    knockback: { x: 100, y: 0 },
  });
  const engine = makeEngine(move);

  const impact = engine.tick({ p1: { move: 'strike' } });
  assert.equal(readFighter(impact.state, 'p1').hitstop, 2);
  assert.equal(readFighter(impact.state, 'p2').hitstop, 3);
  assert.equal(readFighter(impact.state, 'p2').hitstun, 4);

  engine.tick();
  engine.tick();
  const attackerReleased = engine.tick();
  assert.equal(readFighter(attackerReleased.state, 'p1').action.frame, 1);
  assert.equal(readFighter(attackerReleased.state, 'p2').position.x, 1_200);

  const defenderReleased = engine.tick();
  assert.equal(readFighter(defenderReleased.state, 'p1').action, null);
  assert.equal(readFighter(defenderReleased.state, 'p2').position.x, 1_300);
  assert.equal(readFighter(defenderReleased.state, 'p2').hitstun, 3);
});

test('one hit ID can only connect once per move execution', () => {
  const engine = makeEngine(makeMove({ active: 4, recovery: 0 }));
  engine.tick({ p1: { move: 'strike' } });
  engine.tick();
  engine.tick();
  engine.tick();
  assert.equal(readFighter(engine.read(), 'p2').health, 90);
});

test('authored hurtboxes replace the default hurtbox on matching frames', () => {
  const attack = makeMove({ id: 'attack' });
  const evade = makeMove({
    id: 'evade',
    hitboxes: [],
    active: 1,
    recovery: 4,
    hurtboxes: [
      {
        frames: { from: 0, toExclusive: 5 },
        boxes: [
          {
            offset: { x: 10_000, y: 500 },
            halfSize: { x: 100, y: 100 },
          },
        ],
      },
    ],
  });
  const engine = makeEngine(attack, { moves: [attack, evade] });
  const result = engine.tick({
    p1: { move: 'attack' },
    p2: { move: 'evade' },
  });
  assert.equal(hitEvents(result).length, 0);
  assert.equal(readFighter(result.state, 'p2').health, 100);
});

test('same-frame attacks trade instead of being canceled by resolution order', () => {
  const move = makeMove();
  const engine = makeEngine(move, {
    fighters: [
      fighterDefinition('p1', 1, 0, 1),
      fighterDefinition('p2', 2, 1_200, -1),
    ],
  });
  const result = engine.tick({
    p1: { move: 'strike' },
    p2: { move: 'strike' },
  });
  assert.equal(hitEvents(result).length, 2);
  assert.equal(readFighter(result.state, 'p1').health, 90);
  assert.equal(readFighter(result.state, 'p2').health, 90);
});

test('a grounded attack turns toward the opponent and stops walking', () => {
  const move = makeMove({ startup: 1, active: 1, recovery: 2 });
  const engine = makeEngine(move, {
    fighters: [
      fighterDefinition('p1', 1, 1_200, 1),
      fighterDefinition('p2', 2, 0, -1),
    ],
  });

  const started = engine.tick({
    p1: { movement: 1, move: 'strike' },
  });
  const attacker = readFighter(started.state, 'p1');
  assert.equal(attacker.facing, -1);
  assert.equal(attacker.position.x, 1_200);
  assert.equal(attacker.velocity.x, 0);

  const active = engine.tick({ p1: { movement: 1 } });
  assert.equal(readFighter(active.state, 'p1').position.x, 1_200);
  assert.equal(readFighter(active.state, 'p1').velocity.x, 0);
});

test('chip damage passes through a successful guard', () => {
  const move = makeMove({
    damage: 30,
    block: {
      blockstun: 4,
      hitstop: { attacker: 0, defender: 0 },
      knockback: { x: 0, y: 0 },
      chipDamage: 5,
    },
  });
  const engine = makeEngine(move);
  const result = engine.tick({
    p1: { move: 'strike' },
    p2: { guard: true },
  });
  assert.equal(result.events.some((event) => event.type === 'block'), true);
  assert.equal(readFighter(result.state, 'p2').health, 95);
});

test('unknown moves fail fast and invalid active windows are rejected', () => {
  const engine = makeEngine(makeMove());
  assert.throws(() => engine.tick({ p1: { move: 'missing' } }), /Unknown move/);

  const invalid = makeMove({
    startup: 2,
    active: 1,
    hitboxes: [
      {
        hitId: 'early',
        frames: { from: 0, toExclusive: 1 },
        boxes: [{ offset: { x: 0, y: 0 }, halfSize: { x: 1, y: 1 } }],
        hit: {
          damage: 1,
          hitstop: { attacker: 0, defender: 0 },
          hitstun: 1,
          knockback: { x: 0, y: 0 },
        },
      },
    ],
  });
  assert.throws(() => makeEngine(invalid), /active frames/);
});

function hitEvents(result) {
  return result.events.filter((event) => event.type === 'hit');
}
