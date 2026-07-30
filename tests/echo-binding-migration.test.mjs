import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  migrateKeyBindings,
} from '../.sim-test-build/src/input/bindingMigration.js';

test('legacy bindings gain Echo keys without losing customization', () => {
  const migrated = migrateKeyBindings({
    up: 'KeyW',
    down: 'KeyS',
    left: 'KeyA',
    right: 'KeyD',
    buttons: {
      lp: 'KeyZ',
      hp: 'KeyX',
      lk: 'KeyC',
      hk: 'KeyV',
      block: 'ShiftLeft',
      dash: 'ControlLeft',
      taunt: 'KeyT',
      super: 'KeyU',
      ultimate: 'KeyO',
    },
  });

  assert.ok(migrated);
  assert.equal(migrated.up, 'KeyW');
  assert.equal(migrated.buttons.lp, 'KeyZ');
  assert.equal(migrated.buttons.echoQ, 'KeyQ');
  assert.equal(migrated.buttons.echoE, 'KeyE');
  assert.equal(migrated.buttons.echoR, 'KeyR');
  assert.equal(migrated.buttons.echoF, 'KeyF');
});

test('binding migration rejects unrelated saved values', () => {
  assert.equal(migrateKeyBindings(null), null);
  assert.equal(migrateKeyBindings({ up: 'KeyW' }), null);
});
