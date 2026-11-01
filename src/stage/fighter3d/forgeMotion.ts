import { Quaternion } from 'three';
import type { FighterJoints } from './FighterSkeleton';
import manifest from './forgeMotionManifest.json';
import { motionJoints as joints } from './forgeMotionTransition';
import { ARENA_FLOOR_Y } from '../arena/arenaData';

type Joint = Exclude<keyof FighterJoints, 'root'>;
type Rotation = readonly [number, number, number, number];
interface Motion {
  version: 1;
  rotationSpace: 'forge-canonical-local-v2';
  variant: 'ion' | 'cinder';
  duration: number;
  frames: Partial<Record<Joint, Rotation>>[];
  /** Measured target sole correction in model units; never world locomotion. */
  groundOffsets: readonly number[];
  rootMotion: false;
  source: { url: string; licenseNote: string; sha256: string };
}
interface Entry {
  file: string; variant: string; state: string;
  /** Normalized source contact interval, manually reviewed for each attack. */
  strike?: readonly number[];
}
const entries: readonly Entry[] = manifest.clips;
const clips = new Map<string, Motion>();
const contacts = new Map<string, readonly [number, number]>();
const a = new Quaternion();
const b = new Quaternion();
let loading: Promise<void> | undefined;

/** Register only supplied, validated capture; otherwise retain the authored pose. */
export function loadForgeMotions(): Promise<void> {
  loading ??= Promise.all(entries.map(async entry => {
    try {
      const response = await fetch(`/animations/forge/${encodeURIComponent(entry.file)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const motion: Motion = await response.json();
      if (motion.version !== 1 || motion.rotationSpace !== 'forge-canonical-local-v2'
        || motion.rootMotion !== false || motion.frames.length < 2
        || motion.groundOffsets?.length !== motion.frames.length
        || motion.groundOffsets.some(value => !Number.isFinite(value) || Math.abs(value) > .6)
        || motion.variant !== entry.variant || !(motion.duration > 0)
        || !motion.source.url || !motion.source.licenseNote || !motion.source.sha256
        || motion.frames.some(frame => joints.some(joint => {
          const q = frame[joint];
          return !q || q.length !== 4 || q.some(value => !Number.isFinite(value))
            || Math.abs(Math.hypot(...q) - 1) > .001;
        }))) throw new Error('Invalid source metadata or rotation samples');
      const key = `${entry.variant}:${entry.state}`;
      if (entry.state !== 'idle' && entry.state !== 'walk') {
        const [start, end] = entry.strike ?? [];
        if (entry.strike?.length !== 2 || typeof start !== 'number' || typeof end !== 'number'
          || !(start > 0 && end > start && end < 1)) {
          throw new Error('Attack requires a reviewed source contact interval');
        }
        contacts.set(key, [start, end]);
      }
      clips.set(key, motion);
    } catch (error) {
      console.warn(`Forge motion ${entry.file} unavailable; retaining authored fallback`, error);
    }
  })).then(() => undefined);
  return loading;
}

/** Captured rotations and local sole grounding. Simulation owns world position and timing. */
export function applyForgeMotion(
  rig: FighterJoints, variant: string, state: string, sample: number, loop: boolean, mirror = false,
): boolean {
  const clip = clips.get(`${variant}:${state}`);
  if (!clip) return false;
  let normalized = loop ? ((sample / clip.duration) % 1 + 1) % 1 : Math.max(0, Math.min(1, sample));
  const strike = contacts.get(`${variant}:${state}`);
  if (!loop && strike) {
    normalized = normalized < .34 ? normalized / .34 * strike[0]
      : normalized < .58 ? strike[0] + (normalized - .34) / .24 * (strike[1] - strike[0])
        : strike[1] + (normalized - .58) / .42 * (1 - strike[1]);
  }
  const frame = normalized * (clip.frames.length - 1);
  const first = clip.frames[Math.floor(frame)];
  const second = clip.frames[Math.min(clip.frames.length - 1, Math.floor(frame) + 1)];
  if (!first || !second) return false;
  for (const joint of joints) {
    // Mirror stance handedness on the camera's far side so both fighters keep
    // their chest readable. Reflection across X preserves forward reach along Z.
    const sourceJoint = mirror ? mirroredJoint(joint) : joint;
    const from = first[sourceJoint]; const to = second[sourceJoint];
    if (!from || !to) continue;
    a.fromArray(from); b.fromArray(to);
    if (mirror) { a.y *= -1; a.z *= -1; b.y *= -1; b.z *= -1; }
    rig[joint].quaternion.slerpQuaternions(a, b, frame % 1);
  }
  // Authored root spin/bob must not be applied a second time on captured poses.
  // World position and facing remain exclusively owned by the simulation wrapper.
  const floorA = clip.groundOffsets[Math.floor(frame)] ?? 0;
  const floorB = clip.groundOffsets[Math.min(clip.frames.length - 1, Math.floor(frame) + 1)] ?? floorA;
  rig.root.position.y = ARENA_FLOOR_Y + (floorA + (floorB - floorA) * (frame % 1)) * rig.root.scale.y;
  rig.root.rotation.set(0, 0, 0);
  rig.hips.position.y = .86;
  return true;
}

function mirroredJoint(joint: Joint): Joint {
  if (joint.startsWith('left')) return `right${joint.slice(4)}` as Joint;
  if (joint.startsWith('right')) return `left${joint.slice(5)}` as Joint;
  return joint;
}
