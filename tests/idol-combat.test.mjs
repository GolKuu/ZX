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

test('IDOL supers resolve from modifier combos at their meter levels', () => {
  const superMove = (button, superMeter, finisherReady = false) => {
    const buffer = new InputBuffer();
    buffer.push(5, BUTTON_BIT.special | BUTTON_BIT[button]);
    return resolveCommand(buffer, IDOL_COMMANDS, {
      grounded: true,
      stanceId: null,
      gauge: 0,
      superMeter,
      finisherReady,
    })?.moveId;
  };

  assert.equal(superMove('lp', 32), IDOL_MOVE_IDS.lp);
  assert.equal(superMove('lp', 33), IDOL_MOVE_IDS.highlight);
  assert.equal(superMove('hp', 100), IDOL_MOVE_IDS.million);
  assert.equal(superMove('hk', 100), IDOL_MOVE_IDS.hk);
  assert.equal(superMove('hk', 100, true), IDOL_MOVE_IDS.cancel);
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
