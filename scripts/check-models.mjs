/**
 * Validates the rigged character models in `public/models/`.
 *
 * Reads the GLB container directly rather than loading it through three, so it
 * runs in plain Node with no DOM shim. It checks the three things that
 * actually break at runtime, in the order they break:
 *
 *   1. the file is a valid GLB at all
 *   2. it contains a skin (an unrigged mesh cannot be animated)
 *   3. every joint `src/stage/model/humanoidBones.ts` requires resolves
 *
 * Not wired into `prebuild`: `public/models/` is gitignored, so the files are
 * absent in CI and a missing model is a valid state — the renderer falls back
 * to the primitive blockout. Run it locally after adding a model.
 */

import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const MODELS_DIR = 'public/models';
const GLB_MAGIC = 0x46546c67; // 'glTF'
const JSON_CHUNK = 0x4e4f534a; // 'JSON'

// Copied verbatim from ALIASES in src/stage/model/humanoidBones.ts. It is a
// duplicate because this script deliberately runs without a build step; if you
// add an alias there, add it here too or a rig will pass one and fail the other.
const ALIASES = {
  hips: ['hips', 'pelvis', 'root', 'bip01pelvis', 'cchips', 'jbipchips'],
  spine: ['spine', 'spine01', 'spine1', 'abdomen', 'waist', 'jbipcspine'],
  chest: ['chest', 'spine2', 'spine02', 'spine03', 'upperchest', 'torso', 'jbipcchest', 'jbipcupperchest'],
  neck: ['neck', 'neck01', 'neck1', 'jbipcneck', 'defneck'],
  head: ['head', 'jbipchead', 'defhead'],

  shoulderL: ['leftshoulder', 'shoulderl', 'lshoulder', 'leftclavicle', 'claviclel', 'jbiplshoulder', 'bip01lclavicle'],
  upperArmL: ['leftarm', 'upperarml', 'larm', 'leftupperarm', 'upperarmleft', 'jbiplupperarm', 'defupperarml', 'bip01lupperarm'],
  forearmL: ['leftforearm', 'forearml', 'lforearm', 'leftlowerarm', 'lowerarml', 'jbipllowerarm', 'defforearml', 'bip01lforearm'],
  handL: ['lefthand', 'handl', 'lhand', 'jbiplhand', 'defhandl', 'bip01lhand'],

  shoulderR: ['rightshoulder', 'shoulderr', 'rshoulder', 'rightclavicle', 'clavicler', 'jbiprshoulder', 'bip01rclavicle'],
  upperArmR: ['rightarm', 'upperarmr', 'rarm', 'rightupperarm', 'upperarmright', 'jbiprupperarm', 'defupperarmr', 'bip01rupperarm'],
  forearmR: ['rightforearm', 'forearmr', 'rforearm', 'rightlowerarm', 'lowerarmr', 'jbiprlowerarm', 'defforearmr', 'bip01rforearm'],
  handR: ['righthand', 'handr', 'rhand', 'jbiprhand', 'defhandr', 'bip01rhand'],

  thighL: ['leftupleg', 'thighl', 'lefthip', 'leftthigh', 'upperlegl', 'lupleg', 'jbiplupperleg', 'defthighl', 'bip01lthigh'],
  shinL: ['leftleg', 'shinl', 'leftknee', 'leftcalf', 'lowerlegl', 'calfl', 'jbipllowerleg', 'defshinl', 'bip01lcalf'],
  footL: ['leftfoot', 'footl', 'lfoot', 'leftankle', 'jbiplfoot', 'deffootl', 'bip01lfoot'],

  thighR: ['rightupleg', 'thighr', 'righthip', 'rightthigh', 'upperlegr', 'rupleg', 'jbiprupperleg', 'defthighr', 'bip01rthigh'],
  shinR: ['rightleg', 'shinr', 'rightknee', 'rightcalf', 'lowerlegr', 'calfr', 'jbiprlowerleg', 'defshinr', 'bip01rcalf'],
  footR: ['rightfoot', 'footr', 'rfoot', 'rightankle', 'jbiprfoot', 'deffootr', 'bip01rfoot'],
};

const REQUIRED = [
  'hips', 'spine', 'head', 'upperArmL', 'upperArmR', 'thighL', 'thighR',
];

function normalise(name) {
  return name
    .toLowerCase()
    .replace(/mixamorig/g, '')
    .replace(/[\s:_.\-|]/g, '');
}

function readGlbJson(buffer) {
  if (buffer.length < 20) throw new Error('too short to be a GLB');
  if (buffer.readUInt32LE(0) !== GLB_MAGIC) throw new Error('not a GLB (bad magic)');

  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32LE(offset);
    const type = buffer.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (type === JSON_CHUNK) {
      return JSON.parse(buffer.subarray(start, start + length).toString('utf8'));
    }
    offset = start + length;
  }
  throw new Error('no JSON chunk found');
}

function inspect(gltf) {
  const nodes = gltf.nodes ?? [];
  const skins = gltf.skins ?? [];

  // Only nodes actually used as joints count. A node named "Head" that is not
  // in a skin cannot deform anything.
  const jointIndices = new Set(skins.flatMap((skin) => skin.joints ?? []));
  const byName = new Map();
  for (const index of jointIndices) {
    const name = nodes[index]?.name;
    if (typeof name !== 'string') continue;
    const key = normalise(name);
    if (!byName.has(key)) byName.set(key, name);
  }

  const resolved = {};
  for (const [joint, aliases] of Object.entries(ALIASES)) {
    resolved[joint] = aliases.map((alias) => byName.get(alias)).find(Boolean) ?? null;
  }

  return {
    skins: skins.length,
    joints: jointIndices.size,
    jointNames: [...jointIndices]
      .map((index) => nodes[index]?.name)
      .filter((name) => typeof name === 'string'),
    meshes: (gltf.meshes ?? []).length,
    materials: (gltf.materials ?? []).map((material) => material.name ?? '(unnamed)'),
    animations: (gltf.animations ?? []).length,
    resolved,
  };
}

const files = (await readdir(MODELS_DIR).catch(() => []))
  .filter((name) => name.endsWith('.glb'))
  .sort();

if (files.length === 0) {
  console.log(`No models in ${MODELS_DIR}/. The renderer will use the primitive blockout.`);
  process.exit(0);
}

let failed = false;

for (const file of files) {
  const buffer = await readFile(join(MODELS_DIR, file));
  console.log(`\n${file}  (${(buffer.length / 1048576).toFixed(2)} MB)`);

  let report;
  try {
    report = inspect(readGlbJson(buffer));
  } catch (error) {
    console.log(`  ✗ ${error.message}`);
    failed = true;
    continue;
  }

  console.log(`  skins ${report.skins}  joints ${report.joints}  meshes ${report.meshes}  clips ${report.animations}`);
  console.log(`  materials: ${report.materials.join(', ')}`);

  if (report.skins === 0) {
    console.log('  ✗ no skin — the mesh is not rigged, so it will render as a');
    console.log('    motionless statue. Generators (Tripo, Meshy, Rodin) output an');
    console.log('    unrigged mesh by default: run their rigging step, or upload the');
    console.log('    mesh to mixamo.com/#/?page=rigging and re-export.');
    failed = true;
    continue;
  }

  const missingRequired = REQUIRED.filter((joint) => report.resolved[joint] === null);
  const missingOptional = Object.keys(ALIASES)
    .filter((joint) => report.resolved[joint] === null && !REQUIRED.includes(joint));

  if (missingRequired.length > 0) {
    console.log(`  ✗ required joints unresolved: ${missingRequired.join(', ')}`);
    console.log('    add aliases to src/stage/model/humanoidBones.ts. This rig names');
    console.log('    its joints:');
    // Printing the real names is the whole point — it turns "the character does
    // not move" into a one-line alias fix instead of a guessing game.
    for (let index = 0; index < report.jointNames.length; index += 6) {
      console.log(`      ${report.jointNames.slice(index, index + 6).join('  ')}`);
    }
    failed = true;
  } else {
    console.log('  ✓ every required joint resolves');
  }
  if (missingOptional.length > 0) {
    console.log(`  · optional joints unresolved: ${missingOptional.join(', ')}`);
  }
}

console.log('');
process.exit(failed ? 1 : 0);
