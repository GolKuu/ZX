import assert from 'node:assert/strict';
import test from 'node:test';
import {
  LEAD_ATTACK_PALETTES,
  leadAttackVfxKind,
  leadAttackVfxState,
} from '../.sim-test-build/src/stage/photoSprite/leadAttackVfx.js';

const J_ATTACKS = [
  'mim.jab', 'glitch.phase-jab', 'lucky.quick-draw',
  'titan.normal.piston-hammer', 'vorgh.normal.predator-rake',
];
const I_ATTACKS = [
  'mim.capoeira', 'glitch.low-vector-sweep', 'lucky.sliding-bet',
  'titan.normal.seismic-stomp', 'vorgh.normal.hunting-sweep',
];

test('every fighter gets a procedural accent on its J and I normal', () => {
  for (const moveId of J_ATTACKS) assert.equal(leadAttackVfxKind(moveId), 'jab');
  for (const moveId of I_ATTACKS) {
    assert.ok(['kick', 'sweep'].includes(leadAttackVfxKind(moveId)));
  }
});

test('J and I effects arrive at separate readable heights and peak on contact', () => {
  const jab = leadAttackVfxState(J_ATTACKS[0], 0.52);
  const kick = leadAttackVfxState(I_ATTACKS[0], 0.52);
  assert.ok(jab !== null && kick !== null);
  assert.ok(jab.y > kick.y + 0.7);
  assert.ok(jab.intensity > 0.5 && kick.intensity > 0.5);
  assert.equal(leadAttackVfxState(J_ATTACKS[0], 0), null);
  assert.equal(leadAttackVfxState(I_ATTACKS[0], 1), null);
});

test('all five fighters have a distinct three-colour attack identity', () => {
  const signatures = Object.values(LEAD_ATTACK_PALETTES).map((palette) =>
    [palette.core, palette.edge, palette.ember].join(','));
  assert.equal(new Set(signatures).size, 5);
});
