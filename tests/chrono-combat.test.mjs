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
import {
  CHRONO_SUPER_MOVES,
  CHRONO_SUPER_MOVE_IDS,
} from '../.sim-test-build/src/data/chrono-super-moves.js';

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

test('CHRONO upgrades the special button with charge and finisher state', () => {
  const special = (superMeter, finisherReady = false) => {
    const buffer = new InputBuffer();
    buffer.push(5, BUTTON_BIT.special);
    return resolveCommand(buffer, CHRONO_COMMANDS, {
      grounded: true,
      stanceId: null,
      gauge: 0,
      superMeter,
      finisherReady,
    })?.moveId;
  };

  assert.equal(special(33), undefined);
  assert.equal(special(34), CHRONO_SUPER_MOVE_IDS.rewind);
  assert.equal(special(100), CHRONO_SUPER_MOVE_IDS.outcomes);
  assert.equal(special(100, true), CHRONO_SUPER_MOVE_IDS.inevitability);
});

test('CHRONO super damage collapses into one unblockable hit', () => {
  const byId = new Map(CHRONO_SUPER_MOVES.map((move) => [move.id, move]));
  const rewind = byId.get(CHRONO_SUPER_MOVE_IDS.rewind);
  const outcomes = byId.get(CHRONO_SUPER_MOVE_IDS.outcomes);
  const finisher = byId.get(CHRONO_SUPER_MOVE_IDS.inevitability);

  assert.equal(rewind.hitboxes.length, 1);
  assert.equal(rewind.hitboxes[0].hit.block, undefined);
  assert.ok(outcomes.hitboxes[0].hit.damage > rewind.hitboxes[0].hit.damage);
  assert.equal(finisher.hitboxes[0].hit.damage, 1_000);
  assert.ok(
    finisher.hitboxes[0].hit.knockback.x
      > outcomes.hitboxes[0].hit.knockback.x,
  );
});
