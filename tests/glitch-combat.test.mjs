import assert from 'node:assert/strict';
import { test } from 'node:test';

import { BUTTON_BIT } from '../.sim-test-build/src/input/bindings.js';
import { validateAiLoadout } from '../.sim-test-build/src/ai/validation.js';
import { InputBuffer } from '../.sim-test-build/src/input/buffer.js';
import { resolveCommand } from '../.sim-test-build/src/input/command.js';
import { GLITCH_COMMANDS } from '../.sim-test-build/src/input/glitchCommands.js';
import { LUCKY_HURTBOXES } from '../.sim-test-build/src/data/lucky/index.js';
import { MIM_HURTBOXES } from '../.sim-test-build/src/data/mim/character.js';
import { TITAN_HURTBOXES } from '../.sim-test-build/src/data/titan/index.js';
import { VORGH_HURTBOXES } from '../.sim-test-build/src/data/vorgh/index.js';
import {
  GLITCH_AIR_RULES,
  GLITCH_DEFENSE_STATES,
  GLITCH_DEFENSE_RULES,
  GLITCH_HURTBOXES,
  GLITCH_MAX_HEALTH,
  GLITCH_MOVEMENT,
  GLITCH_MOVE_DEFINITIONS,
  GLITCH_MOVES,
} from '../.sim-test-build/src/data/glitch-combat-moves.js';
import {
  GLITCH_AIR_IDS as A,
  GLITCH_NORMAL_IDS as N,
  GLITCH_SPECIAL_IDS as S,
  GLITCH_SUPER_IDS as X,
  GLITCH_UTILITY_IDS as U,
} from '../.sim-test-build/src/data/glitch/ids.js';
import {
  GLITCH_LEVEL_ONE_COST,
  GLITCH_SUPER_MOVES,
  glitchSuperKindForMove,
} from '../.sim-test-build/src/data/glitch/supers.js';
import {
  glitchAiLoadout,
  GLITCH_STORY_AI_LOADOUT,
} from '../.sim-test-build/src/data/glitch-ai.js';
import { CombatEngine } from '../.sim-test-build/src/sim/combat-engine.js';
import { fixed } from '../.sim-test-build/src/sim/math.js';

const NEUTRAL = 5;
const DOWN = 2;
const DOWN_FORWARD = 3;
const FORWARD = 6;

function play(directions, button, context = {}, held = []) {
  const buffer = new InputBuffer();
  buffer.push(NEUTRAL, 0);
  for (const direction of directions) buffer.push(direction, 0);
  const mask = [button, ...held].reduce(
    (value, current) => value | BUTTON_BIT[current],
    0,
  );
  buffer.push(directions.at(-1) ?? NEUTRAL, mask);
  return resolveCommand(buffer, GLITCH_COMMANDS, {
    grounded: true,
    stanceId: null,
    gauge: 0,
    superMeter: 0,
    ultimateReady: false,
    ...context,
  })?.moveId;
}

test('J K I L resolve to the four authored Glitch normals', () => {
  assert.equal(play([], 'lp'), N.phaseJab);
  assert.equal(play([], 'lk'), N.riftElbow);
  assert.equal(play([], 'hp'), N.lowVectorSweep);
  assert.equal(play([], 'hk'), N.breakpointAxe);
});

test('J + I is the 540 kick, and neither button alone is', () => {
  assert.equal(play([], 'lp', {}, ['hp']), S.fiveFortyKick);
  // The chord row sits above the plain rows, so the singles must be untouched —
  // this is the assertion that catches a future row being inserted above it.
  assert.equal(play([], 'lp'), N.phaseJab);
  assert.equal(play([], 'hp'), N.lowVectorSweep);
  // Order of the two keys cannot matter: the chord is read off the held mask.
  assert.equal(play([], 'hp', {}, ['lp']), S.fiveFortyKick);
});

test('the 540 kick spins through two hits and is punishable on block', () => {
  const move = GLITCH_MOVES.find((entry) => entry.id === S.fiveFortyKick);
  assert.ok(move, '540 kick is missing from the move table');
  assert.deepEqual(
    [move.startup, move.active, move.recovery],
    [12, 15, 22],
  );

  // Two separate hitboxes, the second the heavier one — that pairing is what
  // makes the rotation read as a spin rather than as one long kick.
  assert.equal(move.hitboxes.length, 2);
  const [rise, heel] = move.hitboxes;
  assert.equal(rise.hitId, '540-rise');
  assert.equal(heel.hitId, '540-heel');
  assert.ok(heel.hit.damage > rise.hit.damage);
  // The windows must not overlap, or a single opponent eats both on one frame.
  assert.ok(heel.frames.from >= rise.frames.toExclusive);

  // Airborne through the spin: the reward for committing is that lows miss.
  const definition = GLITCH_MOVE_DEFINITIONS.get(S.fiveFortyKick);
  assert.ok(definition.tags.includes('airborne-10'));
  assert.ok(definition.tags.includes('chord'));
});

test('the four normals match the requested phase timings and hit levels', () => {
  const expected = [
    [N.phaseJab, 4, 2, 9, 'high'],
    [N.riftElbow, 10, 5, 14, 'mid'],
    [N.lowVectorSweep, 13, 5, 16, 'low'],
    [N.breakpointAxe, 19, 4, 21, 'overhead'],
  ];
  for (const [id, startup, active, recovery, level] of expected) {
    const move = GLITCH_MOVES.find((entry) => entry.id === id);
    const definition = GLITCH_MOVE_DEFINITIONS.get(id);
    assert.deepEqual(
      [move.startup, move.active, move.recovery],
      [startup, active, recovery],
    );
    assert.deepEqual(definition.hitLevels, [level]);
  }
});

test('air buttons select air-only actions instead of ground normals', () => {
  assert.equal(play([], 'lp', { grounded: false }), A.light);
  assert.equal(play([], 'lk', { grounded: false }), A.medium);
  assert.equal(play([], 'hp', { grounded: false }), A.heavy);
  assert.equal(play([], 'hk', { grounded: false }), A.finisher);
});

test('Spatial Shift has a tell, limited invulnerability and punish recovery', () => {
  for (const id of [S.shiftForward, S.shiftBackward, S.airShift]) {
    const move = GLITCH_MOVES.find((entry) => entry.id === id);
    const intangible = move.hurtboxes.filter((entry) => entry.boxes.length === 0);
    assert.ok(move.startup >= 6, `${id} needs a visible startup`);
    assert.ok(intangible.length === 1, `${id} needs one bounded vanish window`);
    assert.ok(
      intangible[0].frames.toExclusive - intangible[0].frames.from <= 3,
      `${id} cannot be safely intangible`,
    );
    assert.ok(move.recovery >= 12, `${id} needs a punish window`);
    assert.equal(move.displacements.length, 1);
    assert.ok(move.cooldownFrames >= 42, `${id} needs a real cooldown`);
  }
});

test('teleport displacement is simulation-owned and mirrors with facing', () => {
  const move = GLITCH_MOVES.find((entry) => entry.id === S.shiftForward);
  const engine = new CombatEngine({
    moves: [move],
    fighters: [
      fighter('p1', 1, -2, 1),
      fighter('p2', 2, 2, -1),
    ],
  });
  const before = engine.read().fighters[0].position.x;
  engine.tick({ p1: { move: S.shiftForward } });
  for (let frame = 0; frame < 9; frame += 1) engine.tick();
  const after = engine.read().fighters[0].position.x;
  assert.ok(after - before >= fixed(1.4));
  while (engine.read().fighters[0].action !== null) engine.tick();
  const blockedByCooldown = engine.tick({ p1: { move: S.shiftForward } });
  assert.equal(
    blockedByCooldown.events.some((event) => event.type === 'moveStarted'),
    false,
  );

  const mirrored = new CombatEngine({
    moves: [{ ...move, cancels: undefined }],
    fighters: [
      fighter('p1', 1, 2, -1),
      fighter('p2', 2, -2, 1),
    ],
  });
  const mirroredBefore = mirrored.read().fighters[0].position.x;
  mirrored.tick({ p1: { move: S.shiftForward } });
  for (let frame = 0; frame < 9; frame += 1) mirrored.tick();
  assert.ok(mirrored.read().fighters[0].position.x < mirroredBefore);
});

test('all four normals connect in an authoritative mirrored matchup', () => {
  for (const id of [
    N.phaseJab,
    N.riftElbow,
    N.lowVectorSweep,
    N.breakpointAxe,
  ]) {
    const source = GLITCH_MOVES.find((entry) => entry.id === id);
    const move = { ...source, cancels: undefined };
    const leftSide = runMatchHit(move, -0.4, 0.4, 1);
    const rightSide = runMatchHit(move, 0.4, -0.4, -1);
    assert.equal(leftSide, true, `${id} misses facing right`);
    assert.equal(rightSide, true, `${id} misses facing left`);
  }
});

for (const [opponent, hurtboxes] of Object.entries({
  Mim: MIM_HURTBOXES,
  Lucky: LUCKY_HURTBOXES,
  Titan: TITAN_HURTBOXES,
  Vorgh: VORGH_HURTBOXES,
})) {
  test(`Glitch's four normals connect honestly against ${opponent}`, () => {
    for (const id of [
      N.phaseJab,
      N.riftElbow,
      N.lowVectorSweep,
      N.breakpointAxe,
    ]) {
      const source = GLITCH_MOVES.find((entry) => entry.id === id);
      const engine = new CombatEngine({
        moves: [{ ...source, cancels: undefined }],
        fighters: [
          fighter('glitch', 1, 0, 1),
          {
            id: 'target', team: 2, maxHealth: 1200,
            spawn: { x: fixed(0.5), y: 0 }, facing: -1,
            hurtboxes,
          },
        ],
      });
      let result = engine.tick({ glitch: { move: id } });
      for (let frame = 0; frame < source.startup + source.active; frame += 1) {
        if (result.events.some((event) => event.type === 'hit')) break;
        result = engine.tick();
      }
      assert.ok(
        result.events.some(
          (event) => event.type === 'hit' && event.attackerId === 'glitch',
        ),
        `${id} misses ${opponent}`,
      );
    }
  });
}

test('air rules hard-limit routes instead of allowing repeat infinites', () => {
  assert.equal(GLITCH_AIR_RULES.maximumAirShifts, 1);
  assert.equal(GLITCH_AIR_RULES.maximumDoubleJumps, 1);
  assert.ok(GLITCH_AIR_RULES.juggleLimit <= 6);
  assert.ok(GLITCH_AIR_RULES.hitstunDecayPerHit > 0);
  assert.ok(GLITCH_AIR_RULES.repeatedMoveDamagePercent < 100);
});

test('repeated air attacks decay and the juggle limit forces a drop', () => {
  const source = GLITCH_MOVES.find((entry) => entry.id === A.light);
  const move = {
    ...source,
    cancels: undefined,
    hitboxes: source.hitboxes.map((hitbox) => ({
      ...hitbox,
      hit: {
        ...hitbox.hit,
        knockback: { x: 0, y: 0 },
      },
      boxes: [{
        offset: { x: 0, y: fixed(1) },
        halfSize: { x: fixed(2), y: fixed(2) },
      }],
    })),
  };
  const engine = new CombatEngine({
    moves: [move],
    fighters: [
      { ...fighter('p1', 1, -0.2, 1), spawn: { x: fixed(-0.2), y: fixed(0.5) } },
      { ...fighter('p2', 2, 0.2, -1), spawn: { x: fixed(0.2), y: fixed(0.5) } },
    ],
    world: { gravityPerFrame: 0 },
  });
  const damages = [];
  let forcedDropSeen = false;
  for (let attack = 0; attack < GLITCH_AIR_RULES.juggleLimit; attack += 1) {
    let result = engine.tick({ p1: { move: A.light } });
    for (let frame = 0; frame < 20; frame += 1) {
      if (result.events.some((event) => event.type === 'moveStarted')) break;
      result = engine.tick({ p1: { move: A.light } });
    }
    assert.ok(result.events.some((event) => event.type === 'moveStarted'));
    for (let frame = 0; frame < 20; frame += 1) {
      if (result.events.some((event) => event.type === 'hit')) break;
      result = engine.tick();
    }
    assert.ok(
      result.events.some((event) => event.type === 'hit'),
      `air repeat ${attack + 1} did not connect`,
    );
    damages.push(result.events.find((event) => event.type === 'hit').damage);
    forcedDropSeen ||= engine.read().fighters[1].velocity.y < 0;
    while (engine.read().fighters[0].action !== null) engine.tick();
  }
  assert.ok(damages.at(-1) < damages[0]);
  assert.equal(forcedDropSeen, true);
});

test('all requested defensive clips are enumerated', () => {
  assert.equal(GLITCH_DEFENSE_STATES.length, 18);
  for (const state of ['perfect-block', 'guard-break', 'throw-escape', 'air-block']) {
    assert.ok(GLITCH_DEFENSE_STATES.includes(state));
  }
});

test('Throw Escape is a reachable grapple-only tech in a real match', () => {
  const grapple = GLITCH_MOVES.find((entry) => entry.id === U.throw);
  const escape = GLITCH_MOVES.find((entry) => entry.id === U.throwEscape);
  const release = GLITCH_MOVES.find(
    (entry) => entry.id === U.throwEscapeRelease,
  );
  const engine = new CombatEngine({
    moves: [grapple, escape, release],
    fighters: [fighter('p1', 1, 0, 1), fighter('p2', 2, 0.55, -1)],
  });
  engine.tick({ p1: { move: U.throw } });
  for (let frame = 0; frame < 5; frame += 1) engine.tick();
  let result = engine.tick({ p2: { move: U.throwEscape } });
  for (let frame = 0; frame < 4; frame += 1) {
    if (
      result.events.some(
        (event) => event.type === 'moveStarted'
          && event.moveId === U.throwEscapeRelease,
      )
    ) break;
    result = engine.tick();
  }
  assert.ok(
    result.events.some(
      (event) => event.type === 'moveStarted'
        && event.moveId === U.throwEscapeRelease,
    ),
  );
  assert.equal(
    result.events.some((event) => event.type === 'grapple'),
    false,
  );
  assert.equal(result.state.fighters[1].health, GLITCH_MAX_HEALTH);

  assert.equal(escape.counter.grappleOnly, true);
  assert.equal(grapple.grapple.kind, 'normal');
});

test('Breakpoint Axe ground bounce is counter-hit only', () => {
  const move = GLITCH_MOVES.find((entry) => entry.id === N.breakpointAxe);
  assert.equal(move.hitboxes[0].hit.groundBounce.counterHitOnly, true);
});

test('Glitch Perfect Block is a real three-frame simulation event', () => {
  const source = GLITCH_MOVES.find((entry) => entry.id === N.phaseJab);
  const move = { ...source, cancels: undefined };
  const defender = {
    ...fighter('p2', 2, 0.8, -1),
    resource: GLITCH_DEFENSE_RULES,
  };
  const engine = new CombatEngine({
    moves: [move],
    fighters: [fighter('p1', 1, 0, 1), defender],
  });
  engine.tick({ p1: { move: move.id } });
  for (let frame = 0; frame < move.startup - 1; frame += 1) engine.tick();
  const result = engine.tick({ p2: { guard: true } });
  const block = result.events.find((event) => event.type === 'block');
  assert.equal(block?.perfect, true);
  assert.equal(result.state.fighters[1].hitstun, 5);
});

test('enhanced moves spend meter and never erase recovery', () => {
  for (const id of [
    S.exRiftUppercut,
    S.exPhaseBreak,
    S.exRealitySlice,
    S.exTeleportStrike,
  ]) {
    const move = GLITCH_MOVES.find((entry) => entry.id === id);
    assert.equal(move.resourceCost, 25);
    assert.ok(move.recovery >= 16);
    assert.ok(GLITCH_MOVE_DEFINITIONS.get(id).tags.includes('enhanced'));
  }
});

test('both supers and hit-confirmed Fourth God are authored', () => {
  assert.equal(GLITCH_LEVEL_ONE_COST, 34);
  const starter = GLITCH_SUPER_MOVES.find((move) => move.id === X.fourthGod);
  const sequence = GLITCH_SUPER_MOVES.find(
    (move) => move.id === X.fourthGodSequence,
  );
  assert.equal(starter.onHitFollowUp, X.fourthGodSequence);
  assert.equal(glitchSuperKindForMove(X.fourthGod), null);
  assert.equal(glitchSuperKindForMove(X.fourthGodSequence), 'patchNotes');
  assert.ok(starter.recovery >= 20);
  assert.ok(sequence.hitboxes.length >= 6);
  assert.ok(sequence.recovery >= 60);
});

test('Reality Collapse is a timed mobility mode with a whiff price', () => {
  const move = GLITCH_SUPER_MOVES.find(
    (entry) => entry.id === X.realityCollapse,
  );
  assert.equal(move.status.id, 'glitch.reality-collapse-mode');
  assert.equal(move.status.durationFrames, 360);
  assert.ok(move.status.recoveryPercent < 100);
  assert.ok(move.recovery >= 30);
});

test('Glitch owns its low-health, high-speed character definition', () => {
  assert.equal(GLITCH_MAX_HEALTH, 850);
  assert.ok(GLITCH_MOVEMENT.forwardPerFrame > 71);
  assert.ok(GLITCH_MOVEMENT.backwardPerFrame > 62);
  assert.equal(GLITCH_HURTBOXES.length, 3);
});

test('every move has presentation, VFX and sound event data', () => {
  assert.ok(GLITCH_MOVES.length >= 30);
  for (const move of [...GLITCH_MOVES, ...GLITCH_SUPER_MOVES]) {
    const definition = GLITCH_MOVE_DEFINITIONS.get(move.id);
    assert.ok(definition, `${move.id} needs a definition`);
    assert.ok(definition.presentation.animation.length > 0);
    assert.ok(definition.presentation.vfx.length > 0);
    assert.ok(definition.presentation.startupSound.length > 0);
    assert.ok(definition.presentation.impactSound.length > 0);
  }
});

test('AI difficulty changes teleport frequency and honest combo depth', () => {
  const easy = glitchAiLoadout('easy');
  const normal = glitchAiLoadout('normal');
  const hard = glitchAiLoadout('hard');
  const weight = (loadout) =>
    loadout.neutral.find((entry) => entry.moveId === S.shiftForward).weight;
  assert.ok(weight(easy) < weight(normal));
  assert.ok(weight(normal) < weight(hard));
  assert.ok(Math.max(...easy.combos.map((route) => route.moves.length)) <= 2);
  assert.ok(Math.max(...hard.combos.map((route) => route.moves.length)) <= 5);
  assert.ok(GLITCH_STORY_AI_LOADOUT.neutral.some(
    (entry) => entry.moveId === S.realitySlice,
  ));
});

test('every Glitch AI route follows authored cancel windows', () => {
  const moves = new Map(GLITCH_MOVES.map((move) => [move.id, move]));
  for (const difficulty of ['easy', 'normal', 'hard', 'impossible', 'story']) {
    validateAiLoadout(glitchAiLoadout(difficulty), moves);
  }
  validateAiLoadout(GLITCH_STORY_AI_LOADOUT, moves);
});

test('Rift Uppercut remains a DP command and Super is meter-gated', () => {
  assert.equal(
    play([FORWARD, DOWN, DOWN_FORWARD], 'hp'),
    S.riftUppercut,
  );
  assert.equal(play([], 'super', { superMeter: GLITCH_LEVEL_ONE_COST - 1 }), undefined);
  assert.equal(
    play([], 'super', { superMeter: GLITCH_LEVEL_ONE_COST }),
    X.riftSequence,
  );
});

function fighter(id, team, x, facing) {
  return {
    id,
    team,
    maxHealth: GLITCH_MAX_HEALTH,
    spawn: { x: fixed(x), y: 0 },
    facing,
    hurtboxes: GLITCH_HURTBOXES,
    movement: GLITCH_MOVEMENT,
  };
}

function runMatchHit(move, attackerX, defenderX, facing) {
  const engine = new CombatEngine({
    moves: [move],
    fighters: [
      fighter('p1', 1, attackerX, facing),
      fighter('p2', 2, defenderX, facing === 1 ? -1 : 1),
    ],
  });
  let result = engine.tick({ p1: { move: move.id } });
  for (let frame = 0; frame < move.startup + move.active; frame += 1) {
    if (result.events.some((event) => event.type === 'hit')) return true;
    result = engine.tick();
  }
  return result.events.some((event) => event.type === 'hit');
}
