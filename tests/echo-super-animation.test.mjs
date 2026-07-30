import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  ECHO_SUPER_MOVES,
  ECHO_SUPER_MOVE_IDS,
} from '../.sim-test-build/src/data/echo-super-moves.js';
import {
  ECHO_HOLOGRAM_COPIES,
  echoSuperBeat,
  isEchoSuperMove,
} from '../.sim-test-build/src/stage/echo/echoSuperTimeline.js';

function hitFrames(moveId) {
  const move = ECHO_SUPER_MOVES.find(({ id }) => id === moveId);
  return [...new Set(move.hitboxes.map((box) => box.frames.from))].sort(
    (left, right) => left - right,
  );
}

test('only the ECHO supers have a stage timeline', () => {
  assert.equal(isEchoSuperMove(ECHO_SUPER_MOVE_IDS.analysis), true);
  assert.equal(isEchoSuperMove('echo.hp'), false);
  assert.equal(echoSuperBeat('echo.hp', 4), null);
});

test('«Анализ» fills the ring, then every copy swings on the hit frame', () => {
  const [volley] = hitFrames(ECHO_SUPER_MOVE_IDS.analysis);
  const open = echoSuperBeat(ECHO_SUPER_MOVE_IDS.analysis, 1);
  const ready = echoSuperBeat(ECHO_SUPER_MOVE_IDS.analysis, volley);
  const after = echoSuperBeat(ECHO_SUPER_MOVE_IDS.analysis, volley + 30);

  assert.equal(ready.kind, 'analysis');
  assert.ok(open.cast < ready.cast, 'copies fade in before the volley');
  assert.equal(ready.cast, 1);
  assert.equal(ready.strike, 1);
  assert.ok(open.strike === 0);
  assert.ok(after.strike === 0, 'the volley is a single beat');

  const move = ECHO_SUPER_MOVES.find(
    ({ id }) => id === ECHO_SUPER_MOVE_IDS.analysis,
  );
  assert.equal(
    ECHO_HOLOGRAM_COPIES,
    move.hitboxes.length,
    'one copy on stage per authored hologram hitbox',
  );
});

test('«Повтор» steps the clone through every copied hit in order', () => {
  const frames = hitFrames(ECHO_SUPER_MOVE_IDS.repeat);
  assert.equal(frames.length, 7);

  const before = echoSuperBeat(ECHO_SUPER_MOVE_IDS.repeat, frames[0] - 4);
  assert.equal(before.comboHit, -1);

  frames.forEach((frame, index) => {
    const beat = echoSuperBeat(ECHO_SUPER_MOVE_IDS.repeat, frame);
    assert.equal(beat.comboHit, index, `hit ${index} lands on frame ${frame}`);
    assert.equal(beat.strike, 1);
  });
});

test('«Повтор» shatters the mirror only after the last hit', () => {
  const frames = hitFrames(ECHO_SUPER_MOVE_IDS.repeat);
  const last = frames[frames.length - 1];
  assert.equal(echoSuperBeat(ECHO_SUPER_MOVE_IDS.repeat, last).collapse, 0);
  assert.ok(echoSuperBeat(ECHO_SUPER_MOVE_IDS.repeat, last + 20).collapse > 0);
  assert.equal(echoSuperBeat(ECHO_SUPER_MOVE_IDS.repeat, last + 60).collapse, 1);
});

test('«Статистика» holds the panel up, then blows the error chart apart', () => {
  const [verdict] = hitFrames(ECHO_SUPER_MOVE_IDS.statistics);
  const raising = echoSuperBeat(ECHO_SUPER_MOVE_IDS.statistics, 20);
  const called = echoSuperBeat(ECHO_SUPER_MOVE_IDS.statistics, verdict);
  const blown = echoSuperBeat(ECHO_SUPER_MOVE_IDS.statistics, verdict + 60);

  assert.equal(called.kind, 'statistics');
  assert.ok(raising.cast > 0 && raising.cast < 1, 'the panel rises first');
  assert.equal(called.cast, 1);
  assert.equal(called.collapse, 0);
  assert.ok(blown.collapse > 0.5, 'the chart explodes after the verdict');
  assert.ok(blown.cast > 0, 'the panel is still readable while it breaks');
});

test('every super reads the target before it casts, and casts before it hits', () => {
  for (const moveId of Object.values(ECHO_SUPER_MOVE_IDS)) {
    const [first] = hitFrames(moveId);
    const early = echoSuperBeat(moveId, Math.round(first * 0.25));
    const cast = echoSuperBeat(moveId, first);
    const done = echoSuperBeat(moveId, first + 12);

    assert.ok(early.read > early.cast, `${moveId} reads before it casts`);
    assert.equal(early.strike, 0, `${moveId} does not hit during the read`);
    assert.equal(cast.cast, 1, `${moveId} is fully on stage on the hit frame`);
    assert.equal(cast.strike, 1, `${moveId} hits on its authored frame`);
    assert.equal(done.read, 0, `${moveId} drops the reading pose after the hit`);
  }
});
