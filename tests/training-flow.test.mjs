import assert from 'node:assert/strict';
import test from 'node:test';
import {
  lessonProgress,
  TRAINING_LESSONS,
} from '../.sim-test-build/src/tutorial/trainingLessons.js';

test('training lessons form one ordered movement-to-target path', () => {
  assert.deepEqual(
    TRAINING_LESSONS.map(({ kind }) => kind),
    ['keys', 'keys', 'hits', 'hits'],
  );
  assert.ok(TRAINING_LESSONS.every((lesson) => lesson.instruction.length > 20));
});

test('lesson progress completes only after every required action', () => {
  const movement = TRAINING_LESSONS[0];
  const target = TRAINING_LESSONS[2];
  assert.deepEqual(lessonProgress(movement, new Set(['KeyA']), 0), {
    current: 1,
    required: 2,
  });
  assert.deepEqual(lessonProgress(movement, new Set(['KeyA', 'KeyD']), 0), {
    current: 2,
    required: 2,
  });
  assert.deepEqual(lessonProgress(target, new Set(), 99), {
    current: 3,
    required: 3,
  });
});
