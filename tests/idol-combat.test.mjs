import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BUTTON_BIT,
  IDOL_COMMANDS,
  InputBuffer,
  resolveCommand,
} from '../.sim-test-build/src/input/core.js';
import {
  IDOL_MOVES,
  IDOL_MOVE_IDS,
  IDOL_NORMAL_MOVES,
} from '../.sim-test-build/src/data/idol-combat-moves.js';
import {
  CombatEngine,
  fixed,
} from '../.sim-test-build/src/sim/index.js';

const buttons = ['lp', 'hp', 'lk', 'hk'];

test('IDOL maps all four attack buttons to her own moves', () => {
  for (const button of buttons) {
    const buffer = new InputBuffer();
    buffer.push(5, 0);
    buffer.push(5, BUTTON_BIT[button]);
    assert.equal(
      resolveCommand(buffer, IDOL_COMMANDS)?.moveId,
      IDOL_MOVE_IDS[button],
    );
  }
});

test('IDOL attacks keep four distinct frame-data profiles', () => {
  assert.equal(IDOL_NORMAL_MOVES.length, 4);
  assert.equal(new Set(IDOL_MOVES.map(({ id }) => id)).size, 7);

  const lp = IDOL_MOVES.find(({ id }) => id === IDOL_MOVE_IDS.lp);
  const hp = IDOL_MOVES.find(({ id }) => id === IDOL_MOVE_IDS.hp);
  const lk = IDOL_MOVES.find(({ id }) => id === IDOL_MOVE_IDS.lk);
  const hk = IDOL_MOVES.find(({ id }) => id === IDOL_MOVE_IDS.hk);
  assert.ok(lp && hp && lk && hk);
  assert.ok(lp.startup < hp.startup, 'microphone jab stays the fastest');
  assert.ok(
    lk.hitboxes[0].boxes[0].offset.y < lp.hitboxes[0].boxes[0].offset.y,
    'dance slide remains a low attack',
  );
  assert.ok(
    hk.hitboxes[0].boxes[0].halfSize.x > lp.hitboxes[0].boxes[0].halfSize.x,
    'performance spin covers a wider arc',
  );
});

test('IDOL supers resolve from Super-held combos at their meter levels', () => {
  const superMove = (button, superMeter, ultimateReady = false) => {
    const buffer = new InputBuffer();
    buffer.push(5, BUTTON_BIT.super | BUTTON_BIT[button]);
    return resolveCommand(buffer, IDOL_COMMANDS, {
      grounded: true,
      stanceId: null,
      gauge: 0,
      superMeter,
      ultimateReady,
    })?.moveId;
  };
  const ultimate = (ultimateReady) => {
    const buffer = new InputBuffer();
    buffer.push(5, BUTTON_BIT.ultimate);
    return resolveCommand(buffer, IDOL_COMMANDS, {
      grounded: true,
      stanceId: null,
      gauge: 0,
      superMeter: 0,
      ultimateReady,
    })?.moveId;
  };

  assert.equal(superMove('lp', 32), IDOL_MOVE_IDS.lp);
  assert.equal(superMove('lp', 33), IDOL_MOVE_IDS.highlight);
  assert.equal(superMove('hp', 100), IDOL_MOVE_IDS.million);
  assert.equal(superMove('hk', 100), IDOL_MOVE_IDS.hk);
  assert.equal(ultimate(false), undefined);
  assert.equal(ultimate(true), IDOL_MOVE_IDS.cancel);
});

test('Million Followers and Cancel apply a sequence of damaging comments', () => {
  const byId = new Map(IDOL_MOVES.map((move) => [move.id, move]));
  const highlight = byId.get(IDOL_MOVE_IDS.highlight);
  const million = byId.get(IDOL_MOVE_IDS.million);
  const cancel = byId.get(IDOL_MOVE_IDS.cancel);

  assert.equal(highlight.hitboxes.length, 4);
  assert.equal(million.hitboxes.length, 7);
  assert.equal(cancel.hitboxes.length, 7);
  assert.equal(new Set(million.hitboxes.map((hitbox) => hitbox.hitId)).size, 7);
  assert.equal(cancel.hitboxes.at(-1).hit.block, undefined);
  assert.ok(
    cancel.hitboxes.reduce((sum, hitbox) => sum + hitbox.hit.damage, 0)
      > million.hitboxes.reduce((sum, hitbox) => sum + hitbox.hit.damage, 0),
  );
});

test('every concert clap and comment wave connects as a separate hit', () => {
  for (const moveId of [IDOL_MOVE_IDS.million, IDOL_MOVE_IDS.cancel]) {
    const move = IDOL_MOVES.find(({ id }) => id === moveId);
    const engine = new CombatEngine({
      moves: [move],
      fighters: [
        fighter('p1', 1, -1.5, 1),
        fighter('p2', 2, 1.5, -1),
      ],
      world: { leftWall: fixed(-4.8), rightWall: fixed(4.8) },
    });
    const events = [];
    events.push(...engine.tick({ p1: { move: moveId } }).events);
    for (let frame = 0; frame < 360; frame += 1) {
      events.push(...engine.tick().events);
    }
    const hits = events.filter(
      (event) => event.type === 'hit' && event.moveId === moveId,
    );
    assert.equal(hits.length, move.hitboxes.length);
    assert.equal(new Set(hits.map(({ hitId }) => hitId)).size, hits.length);
  }
});

function fighter(id, team, x, facing) {
  return {
    id,
    team,
    maxHealth: 1_000,
    spawn: { x: fixed(x), y: 0 },
    facing,
    hurtboxes: [{
      offset: { x: 0, y: fixed(0.95) },
      halfSize: { x: fixed(0.42), y: fixed(0.95) },
    }],
  };
}
