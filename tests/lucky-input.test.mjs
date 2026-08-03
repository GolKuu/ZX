/**
 * Lucky's input contract.
 *
 * The brief's rejection list is mostly about inputs, so most of it is checked
 * here rather than argued in a review: only W A S D and J K I L are referenced,
 * J and K never kick, I and L never punch, nothing the AI can do is out of the
 * player's reach, no two commands collide, and the printed move list is the
 * table the matcher actually uses.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BUTTON_BIT,
  DEFAULT_BINDINGS,
  DoubleTapDash,
  InputBuffer,
  InputRecorder,
  InputSampler,
  LUCKY_BUTTONS,
  LUCKY_BUTTON_KEY,
  LUCKY_BUTTON_LIMB,
  LUCKY_BUTTON_SLOT,
  LUCKY_CATALOGUE,
  LUCKY_COMMANDS,
  LUCKY_INPUT_PROFILE,
  LUCKY_INPUT_TUNING,
  LUCKY_JUMP_SUPPRESSING_MOVES,
  LUCKY_MOVEMENT_LIST,
  LUCKY_MOVE_LIST,
  ReplayInputSource,
  isDirectionalGuard,
  luckyButtonMask,
  readInputHistory,
  resolveCommand,
  resolveDirection,
  toFacingRelative,
} from '../.sim-test-build/src/input/core.js';
import { LUCKY_AI_LOADOUT } from '../.sim-test-build/src/data/lucky/ai.js';
import { LUCKY_MOVES } from '../.sim-test-build/src/data/lucky/moves.js';
import { LUCKY_SPECIAL_MOVES } from '../.sim-test-build/src/data/lucky/specials.js';
import { LUCKY_SUPER_MOVES } from '../.sim-test-build/src/data/lucky/supers.js';

const PROFILE = {
  ...LUCKY_INPUT_PROFILE,
  leeway: LUCKY_INPUT_TUNING.leeway,
  settleFrames: LUCKY_INPUT_TUNING.settleFrames,
  suppressJumpFor: LUCKY_JUMP_SUPPRESSING_MOVES,
};
const OPTIONS = {
  leeway: LUCKY_INPUT_TUNING.leeway,
  settleFrames: LUCKY_INPUT_TUNING.settleFrames,
};
const LUCKY_SLOTS = new Set(LUCKY_BUTTONS.map((b) => LUCKY_BUTTON_SLOT[b]));
const ALL_MOVES = [...LUCKY_MOVES, ...LUCKY_SPECIAL_MOVES, ...LUCKY_SUPER_MOVES];
const MOVE_IDS = new Set(ALL_MOVES.map((move) => move.id));

/** Facing-relative numpad digits for each motion, oldest → newest. */
const MOTION_STEPS = {
  none: [],
  qcf: [2, 3, 6],
  qcb: [2, 1, 4],
  dp: [6, 2, 3],
  qcf2: [2, 3, 6, 2, 3, 6],
  chargeBackForward: [...Array.from({ length: 45 }, () => 4), 6],
  chargeDownUp: [...Array.from({ length: 45 }, () => 2), 8],
};

const DIRECTION_DIGIT = { forward: 6, back: 4, down: 2, up: 8 };

// ---------------------------------------------------------------- key limits

test('every Lucky command uses only the J K I L attack slots', () => {
  for (const row of LUCKY_COMMANDS) {
    assert.ok(
      LUCKY_SLOTS.has(row.button),
      `command for ${row.moveId} commits on non-Lucky button "${row.button}"`,
    );
    for (const button of row.exactChord ?? []) {
      assert.ok(
        LUCKY_SLOTS.has(button),
        `command for ${row.moveId} names non-Lucky button "${button}"`,
      );
    }
    assert.equal(row.requiresModifier, undefined, row.moveId);
    assert.equal(row.alsoPressed, undefined, row.moveId);
  }
});

test('the four attack keys are J K I L and the directions are W A S D', () => {
  assert.deepEqual(
    LUCKY_BUTTONS.map((button) => DEFAULT_BINDINGS.buttons[LUCKY_BUTTON_SLOT[button]]),
    LUCKY_BUTTONS.map((button) => LUCKY_BUTTON_KEY[button]),
  );
  assert.deepEqual(
    [DEFAULT_BINDINGS.up, DEFAULT_BINDINGS.left, DEFAULT_BINDINGS.down, DEFAULT_BINDINGS.right],
    ['KeyW', 'KeyA', 'KeyS', 'KeyD'],
  );
});

test('no Lucky command needs Shift, Ctrl, Space, T, U, O or the meme keys', () => {
  const forbidden = ['block', 'dash', 'taunt', 'super', 'ultimate', 'mimQ', 'mimE', 'mimR', 'mimF'];
  const forbiddenMask = forbidden.reduce((mask, name) => mask | BUTTON_BIT[name], 0);
  for (const row of LUCKY_COMMANDS) {
    assert.equal(
      BUTTON_BIT[row.button] & forbiddenMask,
      0,
      `${row.moveId} commits on forbidden button "${row.button}"`,
    );
  }
  // And the keys those slots map to are exactly the ones the brief bans.
  const bannedKeys = forbidden.map((name) => DEFAULT_BINDINGS.buttons[name]);
  for (const button of LUCKY_BUTTONS) {
    assert.ok(!bannedKeys.includes(LUCKY_BUTTON_KEY[button]));
  }
});

// -------------------------------------------------------------- limb roles

test('J and K never kick and I and L never punch', () => {
  for (const spec of LUCKY_CATALOGUE) {
    const role = spec.buttons[0];
    if (spec.limb === 'none') continue;
    assert.equal(
      spec.limb,
      LUCKY_BUTTON_LIMB[role],
      `${spec.name} commits on ${role} but strikes with the ${spec.limb} body`,
    );
  }
  for (const spec of LUCKY_CATALOGUE) {
    const role = spec.buttons[0];
    if (role === 'J' || role === 'K') assert.notEqual(spec.limb, 'leg', spec.name);
    if (role === 'I' || role === 'L') assert.notEqual(spec.limb, 'upper', spec.name);
  }
});

// ---------------------------------------------------------------- movement

test('W A S D produce jumps, crouches and facing-relative walking', () => {
  const held = (...codes) => new Set(codes);
  assert.equal(resolveDirection(held('KeyW'), DEFAULT_BINDINGS), 8);
  assert.equal(resolveDirection(held('KeyS'), DEFAULT_BINDINGS), 2);
  assert.equal(resolveDirection(held('KeyD'), DEFAULT_BINDINGS), 6);
  assert.equal(resolveDirection(held('KeyA'), DEFAULT_BINDINGS), 4);
  // Opposing horizontals cancel rather than inventing an input.
  assert.equal(resolveDirection(held('KeyA', 'KeyD'), DEFAULT_BINDINGS), 5);

  // Facing right: D is Forward. Facing left: D is Back.
  assert.equal(toFacingRelative(6, 1), 6);
  assert.equal(toFacingRelative(6, -1), 4);
  assert.equal(toFacingRelative(4, -1), 6);
});

test('simultaneous WASD presses read as diagonals', () => {
  const held = (...codes) => new Set(codes);
  assert.equal(resolveDirection(held('KeyS', 'KeyD'), DEFAULT_BINDINGS), 3);
  assert.equal(resolveDirection(held('KeyS', 'KeyA'), DEFAULT_BINDINGS), 1);
  assert.equal(resolveDirection(held('KeyW', 'KeyD'), DEFAULT_BINDINGS), 9);
  assert.equal(resolveDirection(held('KeyW', 'KeyA'), DEFAULT_BINDINGS), 7);
});

test('Back guards, Up-Back does not, and guarding still walks', () => {
  assert.equal(isDirectionalGuard(4), true);
  assert.equal(isDirectionalGuard(1), true, 'down-back is a crouching guard');
  assert.equal(isDirectionalGuard(7), false, 'up-back is a retreating jump');
  assert.equal(isDirectionalGuard(6), false);

  const sampler = new InputSampler(LUCKY_COMMANDS, PROFILE);
  const input = sampler.sample(4, 0, 1, false, context());
  assert.equal(input.guard, true);
  assert.equal(input.guardWhileWalking, true);
  assert.equal(input.movement, -1, 'holding Back must still walk backwards');
});

test('a double tap dashes and a single tap does not', () => {
  const forward = runDoubleTap([5, 6, 5, 6]);
  assert.equal(forward, 1);
  const back = runDoubleTap([5, 4, 5, 4]);
  assert.equal(back, -1);
  assert.equal(runDoubleTap([5, 6, 6, 6]), 0, 'holding Forward is not a dash');
});

test('one double tap cannot be read as two dashes', () => {
  const buffer = new InputBuffer();
  const dash = new DoubleTapDash();
  const results = [];
  for (const direction of [5, 6, 5, 6, 6, 6, 6, 6]) {
    buffer.push(direction, 0);
    results.push(dash.read(buffer, direction));
  }
  assert.equal(results.filter((value) => value === 1).length, 1);
});

// ------------------------------------------------------- normals and chords

test('J K I L give the four standing normals', () => {
  assert.equal(resolve(['J']), 'lucky.quick-draw');
  assert.equal(resolve(['K']), 'lucky.loaded-shoulder');
  assert.equal(resolve(['I']), 'lucky.sliding-bet');
  assert.equal(resolve(['L']), 'lucky.fortune-heel');
});

test('the reserved chords resolve to their reserved actions', () => {
  assert.equal(resolve(['J', 'K']), 'lucky.dual.loaded-hands');
  assert.equal(resolve(['I', 'L']), 'lucky.dual.fortune-legs');
  assert.equal(resolve(['J', 'I']), 'lucky.throw');
  assert.equal(resolve(['K', 'L']), 'lucky.luck.prepare');
  assert.equal(
    resolve(['J', 'K', 'I'], { superMeter: 40 }),
    'lucky.super.winning-streak',
  );
  assert.equal(
    resolve(['K', 'I', 'L'], { superMeter: 100 }),
    'lucky.super.house-advantage',
  );
  assert.equal(
    resolve(['J', 'K', 'I', 'L'], { superMeter: 100, ultimateReady: true }),
    'lucky.ultimate.impossible-outcome',
  );
});

test('a chord never collapses into one of its own buttons', () => {
  // The exact failure modes the brief names, one assertion each.
  assert.notEqual(resolve(['J', 'I']), 'lucky.quick-draw');
  assert.notEqual(resolve(['J', 'K', 'I'], { superMeter: 40 }), 'lucky.dual.loaded-hands');
  assert.notEqual(resolve(['K', 'L']), 'lucky.loaded-shoulder');
  const ultimate = resolve(['J', 'K', 'I', 'L'], { superMeter: 100, ultimateReady: true });
  assert.equal(ultimate, 'lucky.ultimate.impossible-outcome');
  assert.notEqual(ultimate, 'lucky.super.winning-streak');
});

test('an unaffordable super falls through instead of firing for free', () => {
  assert.equal(resolve(['J', 'K', 'I'], { superMeter: 33 }), null);
  assert.equal(
    resolve(['J', 'K', 'I', 'L'], { superMeter: 100, ultimateReady: false }),
    null,
  );
});

test('the chord is read only after the player stops adding to it', () => {
  // J on frame 0, I two frames later: the throw must win, not the J normal.
  const buffer = new InputBuffer();
  buffer.push(5, 0);
  buffer.push(5, mask(['J']));
  buffer.push(5, mask(['J']));
  assert.equal(
    resolveCommand(buffer, LUCKY_COMMANDS, context(), OPTIONS),
    null,
    'nothing may commit while the chord is still being assembled',
  );
  for (let i = 0; i < 4; i += 1) buffer.push(5, mask(['J', 'I']));
  assert.equal(
    resolveCommand(buffer, LUCKY_COMMANDS, context(), OPTIONS)?.moveId,
    'lucky.throw',
  );
});

// ------------------------------------------------------------ motion inputs

test('quarter-circles, dragon punches and charges reach their specials', () => {
  assert.equal(resolveMotion('qcf', ['J']), 'lucky.special.step');
  assert.equal(resolveMotion('qcf', ['K']), 'lucky.special.loaded-strike');
  assert.equal(resolveMotion('qcf', ['I']), 'lucky.special.sliding-fortune');
  assert.equal(resolveMotion('qcf', ['L']), 'lucky.special.fortune-break');
  assert.equal(resolveMotion('qcb', ['J']), 'lucky.special.probability-shift');
  assert.equal(resolveMotion('qcb', ['K']), 'lucky.special.risky-counter');
  assert.equal(resolveMotion('dp', ['J'], { gauge: 25 }), 'lucky.special.jackpot-rush');
  assert.equal(resolveMotion('dp', ['L']), 'lucky.special.fortune-rising');
  assert.equal(
    resolveMotion('chargeBackForward', ['K']),
    'lucky.charge.probability-shoulder',
  );
  assert.equal(
    resolveMotion('chargeDownUp', ['L']),
    'lucky.charge.rising-heel',
  );
});

test('an undercharged charge move falls through to the ordinary normal', () => {
  const short = { ...MOTION_STEPS, chargeBackForward: [4, 4, 4, 6] };
  assert.equal(
    resolveWithSteps(short.chargeBackForward, ['K']),
    'lucky.loaded-hook',
    'ten frames of Back is a walk, not a charge',
  );
});

test('enhanced routes need the motion, the chord and the Luck', () => {
  assert.equal(resolveMotion('qcf', ['J', 'K'], { gauge: 24 }), 'lucky.dual.loaded-hands');
  assert.equal(resolveMotion('qcf', ['J', 'K'], { gauge: 25 }), 'lucky.enhanced.step');
  assert.equal(resolveMotion('qcf', ['K', 'I'], { gauge: 25 }), 'lucky.enhanced.loaded-strike');
  assert.equal(resolveMotion('qcf', ['I', 'L'], { gauge: 25 }), 'lucky.enhanced.sliding-fortune');
  assert.equal(resolveMotion('qcf', ['L', 'K'], { gauge: 50 }), 'lucky.enhanced.fortune-break');
  assert.equal(resolveMotion('qcb', ['J', 'I'], { gauge: 25 }), 'lucky.enhanced.probability-shift');
  assert.equal(resolveMotion('qcb', ['J', 'K'], { gauge: 25 }), 'lucky.enhanced.risky-counter');
  assert.equal(resolveMotion('dp', ['I', 'L'], { gauge: 50 }), 'lucky.enhanced.fortune-rising');
  assert.equal(resolveMotion('dp', ['J', 'K'], { gauge: 75 }), 'lucky.enhanced.jackpot-rush');
});

test('the ultimate has a motion fallback for keyboards that ghost', () => {
  assert.equal(
    resolveMotion('qcf2', ['J', 'K'], { superMeter: 100, ultimateReady: true }),
    'lucky.ultimate.impossible-outcome',
  );
});

test('Super 1 outranks Enhanced Lucky Step on their shared command', () => {
  // The brief assigns both to QCF + J+K. Energy decides, and it is documented.
  assert.equal(
    resolveMotion('qcf', ['J', 'K'], { gauge: 25, superMeter: 34 }),
    'lucky.super.winning-streak',
  );
  assert.equal(
    resolveMotion('qcf', ['J', 'K'], { gauge: 25, superMeter: 33 }),
    'lucky.enhanced.step',
  );
  // At 75 Luck the same command upgrades to the Jackpot form, and the meter
  // shows that before it is spent.
  assert.equal(
    resolveMotion('qcf', ['J', 'K'], { gauge: 75, superMeter: 34 }),
    'lucky.super.winning-streak.jackpot',
  );
});

// ------------------------------------------------------ reachability, drift

test('every catalogue row is reachable and resolves to itself', () => {
  for (const spec of LUCKY_CATALOGUE) {
    assert.equal(
      resolveSpec(spec, 1),
      spec.moveId,
      `${spec.name} is unreachable facing right`,
    );
  }
});

test('every catalogue row resolves identically facing left', () => {
  for (const spec of LUCKY_CATALOGUE) {
    assert.equal(
      resolveSpec(spec, -1),
      spec.moveId,
      `${spec.name} is unreachable facing left`,
    );
  }
});

test('a side switch does not change what a key sequence means', () => {
  for (const spec of LUCKY_CATALOGUE) {
    assert.equal(resolveSpec(spec, 1), resolveSpec(spec, -1), spec.name);
  }
});

test('no two commands share one input signature', () => {
  const seen = new Map();
  for (const spec of LUCKY_CATALOGUE) {
    const key = [
      spec.motion,
      [...spec.buttons].sort().join(''),
      spec.direction ?? '-',
      spec.stance,
      spec.luckCost ?? '-',
      spec.luckRequired ?? '-',
      spec.meterCost ?? '-',
      spec.requiresUltimate === true ? 'ult' : '-',
    ].join('|');
    const previous = seen.get(key);
    assert.equal(
      previous,
      undefined,
      `"${spec.name}" duplicates the command of "${previous ?? ''}"`,
    );
    seen.set(key, spec.name);
  }
});

test('every catalogue move id exists in the move data', () => {
  for (const spec of LUCKY_CATALOGUE) {
    assert.ok(MOVE_IDS.has(spec.moveId), `${spec.moveId} has no frame data`);
  }
});

test('the AI cannot use anything the player has no command for', () => {
  const reachable = new Set(LUCKY_CATALOGUE.map((spec) => spec.moveId));
  const used = [
    ...LUCKY_AI_LOADOUT.neutral.map((option) => option.moveId),
    ...LUCKY_AI_LOADOUT.whiffPunishes.map((option) => option.moveId),
    ...LUCKY_AI_LOADOUT.combos.flatMap((route) => route.moves),
  ];
  for (const moveId of used) {
    assert.ok(reachable.has(moveId), `AI uses unreachable move "${moveId}"`);
  }
});

test('the printed move list is the table the matcher uses', () => {
  assert.equal(LUCKY_MOVE_LIST.length, LUCKY_CATALOGUE.length);
  for (const [index, entry] of LUCKY_MOVE_LIST.entries()) {
    const spec = LUCKY_CATALOGUE[index];
    assert.equal(entry.moveId, spec.moveId);
    assert.notEqual(entry.keyboard.length, 0, `${entry.name} has no notation`);
    assert.notEqual(entry.relative.length, 0, `${entry.name} has no notation`);
    assert.notEqual(entry.description.length, 0, `${entry.name} has no description`);
  }
  // Movement is documented too, or "how do I dash" is an undocumented command.
  const movement = LUCKY_MOVEMENT_LIST.map((entry) => entry.name);
  for (const required of ['Forward Dash', 'Back Dash', 'Standing Block', 'Crouching Block']) {
    assert.ok(movement.includes(required), `${required} is undocumented`);
  }
});

test('the move list spells the same command both ways round', () => {
  const sliding = LUCKY_MOVE_LIST.find((e) => e.moveId === 'lucky.special.sliding-fortune');
  assert.equal(sliding?.keyboard, 'S, S+D, D+I');
  assert.equal(sliding?.relative, 'Down, Down-Forward, Forward + I');
});

test('no two printed commands read the same', () => {
  // A crouching normal that printed as a bare "J" would be indistinguishable
  // from the standing normal on the page, even though the game can tell them
  // apart. Rows that differ in the game must differ on the page.
  const printed = new Map();
  for (const entry of LUCKY_MOVE_LIST) {
    const key = `${entry.keyboard}|${entry.cost}`;
    const previous = printed.get(key);
    assert.equal(
      previous,
      undefined,
      `"${entry.name}" prints as "${entry.keyboard}", same as "${previous ?? ''}"`,
    );
    printed.set(key, entry.name);
  }
  assert.equal(
    LUCKY_MOVE_LIST.find((e) => e.moveId === 'lucky.low-palm')?.keyboard,
    'S+J',
  );
  assert.equal(
    LUCKY_MOVE_LIST.find((e) => e.moveId === 'lucky.quick-draw')?.keyboard,
    'J',
  );
});

// ------------------------------------------------------------------ buffer

test('a press expires once it leaves the buffer window', () => {
  const buffer = new InputBuffer();
  buffer.push(5, 0);
  buffer.push(5, mask(['J']));
  for (let i = 0; i < LUCKY_INPUT_TUNING.leeway + 2; i += 1) buffer.push(5, 0);
  assert.equal(resolveCommand(buffer, LUCKY_COMMANDS, context(), OPTIONS), null);
});

test('a held button does not repeat the move every frame', () => {
  const buffer = new InputBuffer();
  buffer.push(5, 0);
  let resolved = 0;
  for (let i = 0; i < 30; i += 1) {
    buffer.push(5, mask(['J']));
    if (resolveCommand(buffer, LUCKY_COMMANDS, context(), OPTIONS) !== null) resolved += 1;
  }
  assert.ok(resolved > 0 && resolved <= LUCKY_INPUT_TUNING.leeway, String(resolved));
});

// ---------------------------------------------------------- training mode

test('Training Mode records a sequence and replays it exactly', () => {
  const script = [
    [2, []], [3, []], [6, ['J']], [6, ['J']], [6, ['J']], [6, ['J']],
    [5, []], [5, []],
    [5, ['J', 'I']], [5, ['J', 'I']], [5, ['J', 'I']], [5, ['J', 'I']],
  ];
  const recorder = new InputRecorder();
  recorder.start();
  const live = new InputSampler(LUCKY_COMMANDS, PROFILE);
  const liveMoves = [];
  for (const [direction, buttons] of script) {
    recorder.capture(direction, luckyButtonMask(buttons));
    const input = live.sample(direction, luckyButtonMask(buttons), 1, false, context());
    if (input.move !== undefined) liveMoves.push(input.move);
  }
  recorder.stop();
  assert.equal(recorder.frames.length, script.length);

  const replay = new ReplayInputSource(recorder.frames, LUCKY_COMMANDS, PROFILE);
  const replayed = [];
  for (let i = 0; i < script.length; i += 1) {
    const input = replay.sample(1, false, context());
    if (input.move !== undefined) replayed.push(input.move);
  }
  assert.deepEqual(replayed, liveMoves);
  assert.ok(liveMoves.includes('lucky.special.step'));
  assert.ok(liveMoves.includes('lucky.throw'));
});

test('playback is deterministic across runs', () => {
  const frames = Array.from({ length: 24 }, (_, index) => ({
    direction: [5, 2, 3, 6][index % 4],
    buttons: index % 6 === 5 ? luckyButtonMask(['J']) : 0,
  }));
  const play = () => {
    const source = new ReplayInputSource(frames, LUCKY_COMMANDS, PROFILE);
    return frames.map(() => source.sample(1, false, context()).move ?? null);
  };
  assert.deepEqual(play(), play());
});

test('input history reports presses in player notation', () => {
  const sampler = new InputSampler(LUCKY_COMMANDS, PROFILE);
  for (const [direction, buttons] of [[2, []], [3, []], [6, ['J', 'K']]]) {
    sampler.sample(direction, luckyButtonMask(buttons), 1, false, context());
  }
  const history = readInputHistory(sampler);
  assert.deepEqual(history[0]?.buttons, ['J', 'K']);
  assert.equal(history[0]?.motion, 'qcf');
});

// ------------------------------------------------------------------ helpers

function context(overrides = {}) {
  return {
    grounded: true,
    stanceId: null,
    gauge: 0,
    superMeter: 0,
    ultimateReady: false,
    ...overrides,
  };
}

function mask(buttons) {
  return luckyButtonMask(buttons);
}

function resolve(buttons, overrides = {}) {
  return resolveWithSteps([], buttons, overrides, 5);
}

function resolveMotion(motion, buttons, overrides = {}) {
  return resolveWithSteps(MOTION_STEPS[motion], buttons, overrides);
}

/**
 * Feed a motion and then hold a chord until the matcher settles.
 *
 * `steps` is facing-relative; the press lands on its last entry unless a
 * direction is given, which is exactly how a player performs it.
 */
function resolveWithSteps(steps, buttons, overrides = {}, pressDirection) {
  const buffer = new InputBuffer();
  buffer.push(5, 0);
  const lead = steps.slice(0, -1);
  const last = steps.at(-1);
  for (const direction of lead) buffer.push(direction, 0);
  const press = pressDirection ?? last ?? 5;
  for (let i = 0; i <= LUCKY_INPUT_TUNING.settleFrames; i += 1) {
    buffer.push(press, mask(buttons));
  }
  return resolveCommand(buffer, LUCKY_COMMANDS, context(overrides), OPTIONS)
    ?.moveId ?? null;
}

/**
 * Drive one catalogue row through the sampler at a given facing.
 *
 * Screen-space input is derived by mirroring the facing-relative script, which
 * is what makes "the same keys on the other side" a real assertion rather than
 * a restatement of the mirroring function.
 */
function resolveSpec(spec, facing) {
  const sampler = new InputSampler(LUCKY_COMMANDS, PROFILE);
  const steps = MOTION_STEPS[spec.motion] ?? [];
  const lead = steps.slice(0, -1);
  const pressRelative = spec.direction !== undefined
    ? DIRECTION_DIGIT[spec.direction]
    : spec.stance === 'crouching'
      ? 2
      : (steps.at(-1) ?? 5);

  let last = null;
  sampler.sample(toFacingRelative(5, facing), 0, facing, false, contextFor(spec));
  for (const direction of lead) {
    sampler.sample(toFacingRelative(direction, facing), 0, facing, false, contextFor(spec));
  }
  for (let i = 0; i <= LUCKY_INPUT_TUNING.settleFrames; i += 1) {
    last = sampler.sample(
      toFacingRelative(pressRelative, facing),
      mask(spec.buttons),
      facing,
      false,
      contextFor(spec),
    );
  }
  return last?.move ?? null;
}

/**
 * The minimum resources a row needs.
 *
 * Deliberately minimal: giving every row a full bar would let a higher-priority
 * row win the command and hide the row under test.
 */
function contextFor(spec) {
  return context({
    grounded: spec.stance !== 'air',
    gauge: spec.luckCost ?? spec.luckRequired ?? 0,
    superMeter: spec.meterCost ?? 0,
    ultimateReady: spec.requiresUltimate === true,
  });
}

function runDoubleTap(directions) {
  const buffer = new InputBuffer();
  const dash = new DoubleTapDash();
  let result = 0;
  for (const direction of directions) {
    buffer.push(direction, 0);
    const value = dash.read(buffer, direction);
    if (value !== 0) result = value;
  }
  return result;
}
