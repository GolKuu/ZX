import assert from 'node:assert/strict';
import test from 'node:test';
import { spritePoseFor } from '../.sim-test-build/src/stage/sprite2d/spritePose.js';
import { FIXED_SCALE } from '../.sim-test-build/src/sim/index.js';

/**
 * The 2D cut-out rig's joint angles.
 *
 * The reason these exist: a knee or an elbow that folds backwards is the single
 * most visible thing a paper-doll rig can get wrong, and it was shipped three times
 * — in the walk, the sweep and the roundhouse — because nothing rejected it. The
 * sweep did it by 54°. Every pose the runtime can reach is swept here rather than
 * spot-checked, so the next table cannot reintroduce it quietly.
 */

/** Hinges, and how far past straight each may go before it reads as broken. */
const HINGES = ['forearm', 'farForearm', 'shin', 'farShin'];
const STRAIGHT = 0.2;

function fighter(overrides = {}) {
  return {
    id: 'p1',
    team: 0,
    health: 1_000,
    maxHealth: 1_000,
    position: { x: 0, y: 0 },
    previousPosition: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    facing: 1,
    grounded: true,
    guarding: false,
    hitstop: 0,
    hitstun: 0,
    action: null,
    ...overrides,
  };
}

/** Every state the runtime can ask for, at a spread of times and progresses. */
function* everyPose() {
  const moves = ['idol.lp', 'idol.hp', 'idol.lk', 'idol.hk', 'unknown.move'];
  for (let step = 0; step <= 20; step += 1) {
    const progress = step / 20;
    const time = step * 0.37;
    for (const moveId of moves) {
      yield [
        `attack ${moveId} @ ${progress.toFixed(2)}`,
        spritePoseFor(
          fighter({ action: { moveId, frame: step, serial: 1 } }),
          time,
          progress,
        ),
      ];
    }
    for (const zone of ['head', 'body', 'legs']) {
      for (const hitstun of [1, 7, 14, 40]) {
        yield [
          `hurt ${zone} hitstun ${hitstun}`,
          spritePoseFor(fighter({ hitstun }), time, 0, zone),
        ];
      }
    }
    for (const speed of [0, 0.4, 1.8, 3.5, 9]) {
      yield [
        `walk at ${speed}`,
        spritePoseFor(
          fighter({ velocity: { x: speed * FIXED_SCALE, y: 0 } }),
          time,
          0,
        ),
      ];
    }
    for (const verticalSpeed of [-2, 2]) {
      yield [
        `airborne ${verticalSpeed}`,
        spritePoseFor(
          fighter({ grounded: false, velocity: { x: 0, y: verticalSpeed } }),
          time,
          0,
        ),
      ];
    }
  }
}

test('no reachable pose bends a knee or an elbow backwards', () => {
  for (const [label, pose] of everyPose()) {
    for (const hinge of HINGES) {
      assert.ok(
        pose[hinge] <= STRAIGHT,
        `${label}: ${hinge} at ${String(pose[hinge])} is past straight`,
      );
    }
  }
});

test('every joint angle stays inside its limit', () => {
  for (const [label, pose] of everyPose()) {
    for (const [joint, angle] of Object.entries(pose)) {
      if (joint === 'lift' || joint === 'drift') continue;
      assert.ok(
        Number.isFinite(angle) && Math.abs(angle) <= 1.8,
        `${label}: ${joint} at ${String(angle)} is outside any plausible limit`,
      );
    }
  }
});

test('the three damage reactions are distinct, not one lean scaled', () => {
  const struck = fighter({ hitstun: 14 });
  const head = spritePoseFor(struck, 0, 0, 'head');
  const body = spritePoseFor(struck, 0, 0, 'body');
  const legs = spritePoseFor(struck, 0, 0, 'legs');

  // A blow to the head throws the spine back; one to the gut folds it forward.
  assert.ok(head.torso < 0, 'a head hit should arch the torso back');
  assert.ok(body.torso > 0, 'a body hit should fold the torso forward');
  // Swept legs drop the fighter further than either upper-body reaction.
  assert.ok(
    legs.lift < body.lift && legs.lift < head.lift,
    'a leg hit should drop the hips furthest',
  );
  // And lift the struck leg clear of the floor.
  assert.ok(legs.thigh > body.thigh, 'a leg hit should raise the struck thigh');
});

test('damage reactions scale with hitstun rather than snapping on', () => {
  const light = spritePoseFor(fighter({ hitstun: 2 }), 0, 0, 'head');
  const heavy = spritePoseFor(fighter({ hitstun: 14 }), 0, 0, 'head');
  assert.ok(
    Math.abs(heavy.head) > Math.abs(light.head),
    'a longer hitstun should snap the head further',
  );
});
