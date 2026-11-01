import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const manifest = JSON.parse(await readFile('src/stage/fighter3d/forgeMotionManifest.json', 'utf8'));
const required = ['hips', 'torso', 'head', 'leftArm', 'leftForearm', 'rightArm',
  'rightForearm', 'leftLeg', 'leftShin', 'rightLeg', 'rightShin'];
const failures = [];
const verified = new Set();
for (const entry of manifest.clips) {
  try {
    if (path.basename(entry.file) !== entry.file) throw new Error('Unsafe clip path');
    const clip = JSON.parse(await readFile(path.join('public/animations/forge', entry.file), 'utf8'));
    if (clip.variant !== entry.variant || clip.rotationSpace !== 'forge-canonical-local-v2'
      || clip.rootMotion !== false) throw new Error('Wrong target rig or root-motion contract');
    const file = clip.source.file;
    if (path.basename(file) !== file) throw new Error('Unsafe source path');
    const source = await readFile(path.join('assets/animations/mixamo', file));
    const digest = createHash('sha256').update(source).digest('hex');
    if (digest !== clip.source.sha256) throw new Error('Source FBX changed; re-import and review');
    if (!clip.source.url.startsWith('https://www.mixamo.com/') || !clip.source.licenseNote) {
      throw new Error('Missing actual acquisition source or license note');
    }
    if (clip.frames.length < 2 || Math.abs(clip.duration * clip.fps - (clip.frames.length - 1)) > .001) {
      throw new Error('Source sampling duration disagrees with frame count');
    }
    if (clip.groundOffsets?.length !== clip.frames.length
      || clip.groundOffsets.some(value => !Number.isFinite(value) || Math.abs(value) > .6)) {
      throw new Error('Missing or invalid target sole grounding samples');
    }
    for (const frame of clip.frames) {
      if (Object.keys(frame).some(key => !required.includes(key))) throw new Error('Unexpected animated channel');
      for (const joint of required) {
        const q = frame[joint];
        if (!Array.isArray(q) || q.length !== 4 || q.some(v => !Number.isFinite(v))
          || Math.abs(Math.hypot(...q) - 1) > .001) throw new Error(`Invalid ${joint} rotation`);
      }
    }
    const key = `${entry.variant}:${entry.state}`;
    if (verified.has(key)) throw new Error('Duplicate state binding');
    verified.add(key);
  } catch (error) {
    failures.push(`${entry.file}: ${error.message}`);
  }
}
for (const variant of ['ion', 'cinder']) {
  for (const state of ['idle', 'walk']) {
    if (!verified.has(`${variant}:${state}`)) failures.push(`Missing captured ${variant} ${state}`);
  }
}
if (failures.length) {
  console.error(`Forge motion check failed:\n- ${failures.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(`Forge motion provenance and rig channels passed: ${verified.size} bindings`);
}
