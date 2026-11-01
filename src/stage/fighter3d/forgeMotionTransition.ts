import { Quaternion } from 'three';
import type { FighterJoints } from './FighterSkeleton';

export const motionJoints = ['hips', 'torso', 'head', 'leftArm', 'leftForearm',
  'rightArm', 'rightForearm', 'leftLeg', 'leftShin', 'rightLeg', 'rightShin'] as const;
interface Transition {
  key: string;
  elapsed: number;
  progress: number;
  last: Quaternion[];
  from: Quaternion[];
  lastY: number;
  fromY: number;
}
const transitions = new WeakMap<FighterJoints, Transition>();
const target = new Quaternion();

/** Blend only at state boundaries; never continuously damp a strike or delay its contact. */
export function finishForgePose(rig: FighterJoints, key: string, delta: number, progress = -1): void {
  let blend = transitions.get(rig);
  if (!blend) {
    const last = motionJoints.map(joint => rig[joint].quaternion.clone());
    blend = { key, elapsed: .08, progress, last, from: last.map(q => q.clone()),
      lastY: rig.root.position.y, fromY: rig.root.position.y };
    transitions.set(rig, blend);
  }
  if (blend.key !== key || (progress >= 0 && progress < blend.progress)) {
    blend.key = key;
    blend.elapsed = 0;
    blend.fromY = blend.lastY;
    blend.from.forEach((q, i) => { const last = blend.last[i]; if (last) q.copy(last); });
  }
  blend.progress = progress;
  blend.elapsed += delta;
  // Complete before the simulation's active span, even for a very short jab.
  const amount = Math.min(1, Math.max(blend.elapsed / .08, progress / .34));
  const weight = amount * amount * (3 - 2 * amount);
  rig.root.position.y = blend.fromY + (rig.root.position.y - blend.fromY) * weight;
  blend.lastY = rig.root.position.y;
  motionJoints.forEach((joint, i) => {
    const from = blend.from[i]; const last = blend.last[i];
    if (!from || !last) return;
    target.copy(rig[joint].quaternion);
    rig[joint].quaternion.slerpQuaternions(from, target, weight);
    last.copy(rig[joint].quaternion);
  });
}
