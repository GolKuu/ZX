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
  assert.equal(IDOL_MOVES.length, 4);
  assert.equal(new Set(IDOL_MOVES.map(({ id }) => id)).size, 4);

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
