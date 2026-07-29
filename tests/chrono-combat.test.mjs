import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BUTTON_BIT,
  CHRONO_COMMANDS,
  InputBuffer,
  resolveCommand,
} from '../.sim-test-build/src/input/core.js';
import {
  CHRONO_MOVES,
  CHRONO_MOVE_IDS,
} from '../.sim-test-build/src/data/chrono-combat-moves.js';

function press(button) {
  const buffer = new InputBuffer();
  buffer.push(5, BUTTON_BIT[button]);
  return resolveCommand(buffer, CHRONO_COMMANDS)?.moveId;
}

test('CHRONO maps all four attack buttons to isolated moves', () => {
  assert.equal(press('lp'), CHRONO_MOVE_IDS.lp);
  assert.equal(press('hp'), CHRONO_MOVE_IDS.hp);
  assert.equal(press('lk'), CHRONO_MOVE_IDS.lk);
  assert.equal(press('hk'), CHRONO_MOVE_IDS.hk);
});

test('CHRONO attacks have distinct frame data and hit regions', () => {
  const byId = new Map(CHRONO_MOVES.map((move) => [move.id, move]));
  const lp = byId.get(CHRONO_MOVE_IDS.lp);
  const hp = byId.get(CHRONO_MOVE_IDS.hp);
  const lk = byId.get(CHRONO_MOVE_IDS.lk);
  const hk = byId.get(CHRONO_MOVE_IDS.hk);

  assert.ok(lp.startup < hp.startup);
  assert.ok(lk.hitboxes[0].boxes[0].offset.y < lp.hitboxes[0].boxes[0].offset.y);
  assert.ok(
    hk.hitboxes[0].hit.knockback.y > lk.hitboxes[0].hit.knockback.y,
  );
  assert.ok(hp.hitboxes[0].hit.damage > lp.hitboxes[0].hit.damage);
});
