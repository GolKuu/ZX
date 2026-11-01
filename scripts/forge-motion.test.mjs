import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
import { BoxGeometry, Group, Mesh, MeshBasicMaterial, Quaternion, Vector3 } from 'three';

const base = new URL('../src/stage/fighter3d/', import.meta.url);
async function moduleUrl(file, replacements = []) {
  let source = await readFile(new URL(file, base), 'utf8');
  for (const [from, to] of replacements) source = source.replace(from, to);
  const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022 } }).outputText.replaceAll("from 'three'", `from '${import.meta.resolve('three')}'`);
  return `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`;
}
const transitionUrl = await moduleUrl('forgeMotionTransition.ts');
const arenaUrl = await moduleUrl('../arena/arenaData.ts');
const groundingUrl = await moduleUrl('forgeGrounding.ts', [["from '../arena/arenaData'", `from '${arenaUrl}'`]]);
const { groundForgePose } = await import(groundingUrl);
const { finishForgePose, motionJoints } = await import(transitionUrl);
const entries = [{ file: 'walk.json', variant: 'ion', state: 'walk' },
  { file: 'jab.json', variant: 'ion', state: 'jab', strike: [.2, .4] },
  { file: 'old.json', variant: 'cinder', state: 'walk' }];
const playbackUrl = await moduleUrl('forgeMotion.ts', [
  ["import manifest from './forgeMotionManifest.json';", `const manifest = ${JSON.stringify({ clips: entries })};`],
  ["from './forgeMotionTransition'", `from '${transitionUrl}'`],
  ["from '../arena/arenaData'", `from '${arenaUrl}'`],
]);
const { applyForgeMotion, loadForgeMotions } = await import(playbackUrl);
function rig() {
  return Object.fromEntries(['root', ...motionJoints].map(name => [name, new Group()]));
}
const axis = new Vector3(0, 0, 1);
const frames = [0, .5, 1].map(angle => Object.fromEntries(motionJoints.map(j =>
  [j, new Quaternion().setFromAxisAngle(axis, j === 'rightArm' ? angle * 2 : angle).toArray()])));
const originalFetch = globalThis.fetch;
const originalWarn = console.warn;
const warnings = [];
globalThis.fetch = async url => ({ ok: true, json: async () => ({
  version: 1, rotationSpace: url.includes('old') ? undefined : 'forge-canonical-local-v2',
  rootMotion: false, duration: 2, variant: url.includes('old') ? 'cinder' : 'ion', frames,
  groundOffsets: [0, .05, .1],
  source: { url: 'https://www.mixamo.com/', licenseNote: 'fixture', sha256: 'fixture' },
}) });
console.warn = (...args) => warnings.push(args);
try { await loadForgeMotions(); } finally { globalThis.fetch = originalFetch; console.warn = originalWarn; }
function nearAngle(q, angle) {
  assert.ok(q.angleTo(new Quaternion().setFromAxisAngle(axis, angle)) < 1e-6);
}
test('playback rejects legacy rest-delta clips and leaves unmapped authored attacks intact', () => {
  const r = rig();
  r.leftArm.rotation.x = -.8;
  assert.equal(applyForgeMotion(r, 'ion', 'unmapped-attack', .5, false), false);
  assert.equal(r.leftArm.rotation.x, -.8);
  assert.equal(applyForgeMotion(r, 'cinder', 'walk', 0, true), false);
  assert.equal(warnings.length, 1);
});
test('forward/backward sampling wraps without moving the simulation wrapper', () => {
  const r = rig(); const wrapper = new Group(); wrapper.position.x = 7; wrapper.add(r.root);
  r.root.rotation.y = 2; r.hips.position.y = .6;
  applyForgeMotion(r, 'ion', 'walk', .5, true); nearAngle(r.leftArm.quaternion, .25);
  applyForgeMotion(r, 'ion', 'walk', -.5, true); nearAngle(r.leftArm.quaternion, .75);
  assert.equal(wrapper.position.x, 7);
  assert.ok(Math.abs(r.root.position.y - .099) < 1e-6);
  assert.equal(r.hips.position.y, .86);
  nearAngle(r.root.quaternion, 0);
});
test('reviewed contact interval maps exactly to simulation active boundaries', () => {
  const r = rig();
  applyForgeMotion(r, 'ion', 'jab', .34, false); nearAngle(r.leftArm.quaternion, .2);
  applyForgeMotion(r, 'ion', 'jab', .58, false); nearAngle(r.leftArm.quaternion, .4);
});

test('camera-side stance mirror swaps limbs and reflects rotations without root movement', () => {
  const r = rig();
  applyForgeMotion(r, 'ion', 'walk', .5, true, true);
  nearAngle(r.leftArm.quaternion, -.5);
  nearAngle(r.rightArm.quaternion, -.25);
  nearAngle(r.hips.quaternion, -.25);
  assert.equal(r.root.position.x, 0);
  assert.equal(r.root.position.z, 0);
  assert.ok(Math.abs(r.root.position.y - .049) < 1e-6);
});
test('state transition is short, ends before contact, and never damps an ongoing strike', () => {
  const r = rig(); finishForgePose(r, 'idle', 1 / 60);
  r.leftArm.quaternion.setFromAxisAngle(axis, 1);
  r.root.position.y = .2;
  finishForgePose(r, 'jab', 1 / 60, 0);
  assert.ok(r.leftArm.quaternion.angleTo(new Quaternion()) < .2);
  assert.ok(r.root.position.y > 0 && r.root.position.y < .2);
  r.leftArm.quaternion.setFromAxisAngle(axis, 1);
  r.root.position.y = .2;
  finishForgePose(r, 'jab', 1 / 60, .34); nearAngle(r.leftArm.quaternion, 1);
  assert.equal(r.root.position.y, .2);
  r.leftArm.quaternion.setFromAxisAngle(axis, .6);
  finishForgePose(r, 'jab', 1 / 60, .45); nearAngle(r.leftArm.quaternion, .6);
});

test('actual boot geometry grounds fallback poses while the simulation wrapper stays fixed', () => {
  const r = rig(); const wrapper = new Group(); wrapper.position.set(7, 0, 2);
  wrapper.add(r.root); r.root.add(r.leftShin, r.rightShin);
  const geometry = new BoxGeometry(.2, .2, .4); const material = new MeshBasicMaterial();
  r.leftShin.add(new Mesh(geometry, material)); r.rightShin.add(new Mesh(geometry, material));
  r.leftShin.position.y = .3; r.rightShin.position.y = .4;
  groundForgePose(r);
  assert.ok(Math.abs(r.root.position.y - (-.176)) < 1e-6);
  assert.deepEqual(wrapper.position.toArray(), [7, 0, 2]);
  r.root.position.y = 0;
  groundForgePose(r, false);
  assert.equal(r.root.position.y, 0);
  r.leftShin.position.y = -.5;
  groundForgePose(r, false);
  assert.ok(Math.abs(r.root.position.y - .624) < 1e-6);
  assert.deepEqual(wrapper.position.toArray(), [7, 0, 2]);
  geometry.dispose(); material.dispose();
});
