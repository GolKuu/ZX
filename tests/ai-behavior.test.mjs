import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AI_DIFFICULTY_PROFILES,
} from '../.sim-test-build/src/ai/index.js';
import {
  action,
  landedHit,
  makeAgent,
  world,
} from './ai-test-utils.mjs';

test('spacing logic approaches from far range and retreats when crowded', () => {
  const farAgent = makeAgent('normal');
  const approach = farAgent.decide(world(0, { playerX: 3_000 }));
  assert.equal(approach.intent, 'approach');
  assert.equal(approach.input.movement, 1);

  const closeAgent = makeAgent('normal');
  const retreat = closeAgent.decide(world(0, { playerX: 300 }));
  assert.equal(retreat.intent, 'retreat');
  assert.equal(retreat.input.movement, -1);
});

test('every level exposes a deterministic, difficulty-scaled telegraph', () => {
  for (const difficulty of ['easy', 'normal', 'hard']) {
    const agent = makeAgent(difficulty, 17);
    let started = null;
    for (let frame = 0; frame < 600 && started === null; frame += 1) {
      const result = agent.decide(world(frame));
      if (result.telegraph !== null) {
        started = { frame, result };
      }
    }
    assert.notEqual(started, null, `${difficulty} never selected a neutral attack`);
    assert.equal(
      started.result.telegraph.durationFrames,
      AI_DIFFICULTY_PROFILES[difficulty].telegraphFrames,
    );

    let committed = null;
    const duration = started.result.telegraph.durationFrames;
    for (let offset = 1; offset <= duration; offset += 1) {
      const result = agent.decide(world(started.frame + offset));
      if (result.input.move !== undefined) {
        committed = { offset, result };
      }
    }
    assert.equal(committed.offset, duration);
    assert.equal(
      committed.result.events.some((event) => event.type === 'telegraphCommitted'),
      true,
    );
  }
});

test('hard defense reacts only after its authored observation delay', () => {
  const agent = makeAgent('hard', 1);
  agent.decide(world(0, { playerX: 3_000 }));
  for (let frame = 1; frame <= 4; frame += 1) {
    const result = agent.decide(
      world(frame, { playerAction: action('5H', frame - 1) }),
    );
    assert.notEqual(result.intent, 'guard');
    assert.notEqual(result.intent, 'retreat');
  }
  const reaction = agent.decide(
    world(5, { playerAction: action('5H', 4) }),
  );
  assert.ok(reaction.intent === 'guard' || reaction.intent === 'retreat');
});

test('hard AI confirms a hit into a telegraphed combo cancel', () => {
  const agent = makeAgent('hard', 3);
  const start = agent.decide(
    world(0, {
      aiAction: action('5L', 6, 12),
      playerHitstun: 16,
    }),
    [landedHit(0, '5L')],
  );
  assert.equal(start.intent, 'combo');
  assert.equal(start.telegraph.moveId, '5M');
  assert.equal(start.telegraph.durationFrames, 3);

  agent.decide(
    world(1, {
      aiAction: action('5L', 7, 12),
      playerHitstun: 16,
    }),
  );
  agent.decide(
    world(2, {
      aiAction: action('5L', 8, 12),
      playerHitstun: 15,
    }),
  );
  const commit = agent.decide(
    world(3, {
      aiAction: action('5L', 9, 12),
      playerHitstun: 14,
    }),
  );
  assert.equal(commit.input.move, '5M');
  assert.equal(commit.intent, 'combo');
});

test('taking a hit cancels the visible telegraph', () => {
  const agent = makeAgent('hard', 3);
  agent.decide(
    world(0, {
      aiAction: action('5L', 6, 12),
      playerHitstun: 16,
    }),
    [landedHit(0, '5L')],
  );
  const interrupted = agent.decide(
    world(1, {
      aiHitstun: 12,
      playerHitstun: 15,
    }),
    [
      {
        ...landedHit(1, '5M'),
        attackerId: 'player',
        defenderId: 'ai',
      },
    ],
  );
  assert.equal(interrupted.telegraph, null);
  assert.equal(
    interrupted.events.some(
      (event) => event.type === 'telegraphCancelled' && event.reason === 'hit',
    ),
    true,
  );
});

test('hard AI recognizes recovery and telegraphs a whiff punish', () => {
  const agent = makeAgent('hard', 1);
  agent.decide(world(0, { playerX: 3_000 }));
  for (let frame = 1; frame <= 4; frame += 1) {
    agent.decide(
      world(frame, { playerAction: action('5H', 17, 9) }),
    );
  }
  const punish = agent.decide(
    world(5, { playerAction: action('5H', 17, 9) }),
  );
  assert.equal(punish.intent, 'whiffPunish');
  assert.notEqual(punish.telegraph, null);
});
