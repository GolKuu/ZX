import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  layoutEchoSpriteFx,
} from '../.sim-test-build/src/stage/echo/echoSpriteFxLayout.js';

test('Prediction Lock renders a learned jump trajectory', () => {
  const groups = fxGroups();
  layoutEchoSpriteFx(
    groups,
    readout({ habit: 'jump', habitStrength: 0.8 }),
    fighter('echo.special.prediction-lock'),
    fighter(null, { position: { x: 2_400, y: 0 } }),
    0.5,
    1,
    1,
  );
  assert.equal(groups.reticle.visible, true);
  assert.equal(groups.paths.visible, true);
  assert.ok(groups.paths.children[0].position.y > 0.72);
});

test('Perfect Read reveals counters in sequence', () => {
  const groups = fxGroups();
  layoutEchoSpriteFx(
    groups,
    readout(),
    fighter('echo.super.analysis'),
    fighter(null, { position: { x: 2_400, y: 0 } }),
    0.16,
    1,
    1,
  );
  const visible = groups.clones.children.filter((clone) => clone.visible);
  assert.ok(visible.length > 0);
  assert.ok(visible.length < groups.clones.children.length);
});

function readout(overrides = {}) {
  return {
    confidence: 0,
    habit: 'none',
    habitStrength: 0,
    lockPulse: 0,
    opponentAttacking: false,
    scanPulse: 0,
    ...overrides,
  };
}

function fighter(moveId, overrides = {}) {
  return {
    id: moveId === null ? 'p2' : 'p1',
    team: moveId === null ? 2 : 1,
    health: 1_000,
    maxHealth: 1_000,
    position: { x: 0, y: 0 },
    previousPosition: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    facing: 1,
    grounded: true,
    guarding: false,
    dashFrames: 0,
    hitstop: 0,
    hitstun: 0,
    action: moveId === null ? null : { moveId, frame: 0, serial: 1 },
    ...overrides,
  };
}

function fxGroups() {
  return {
    reticle: group(5),
    paths: group(7),
    data: group(12),
    clones: group(5),
  };
}

function group(total) {
  return {
    visible: false,
    children: Array.from({ length: total }, () => child()),
    position: vector(),
    rotation: vector(),
    scale: scale(),
  };
}

function child() {
  return {
    visible: true,
    position: vector(),
    rotation: vector(),
    scale: scale(),
  };
}

function vector() {
  return {
    x: 0,
    y: 0,
    z: 0,
    set(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
    },
  };
}

function scale() {
  return {
    x: 1,
    y: 1,
    z: 1,
    setScalar(value) {
      this.x = value;
      this.y = value;
      this.z = value;
    },
  };
}
