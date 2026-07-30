import { ECHO_MOVE_IDS } from '@/src/data/echo-combat-moves';
import { ECHO_SPECIAL_MOVE_IDS } from '@/src/data/echo-special-moves';
import { ECHO_SUPER_MOVE_IDS } from '@/src/data/echo-super-moves';
import type { FighterSnapshot } from '@/src/sim';
import type { Group } from 'three';
import type { SpriteJoints } from '../sprite2d/SpriteRigBody';

export function applyEchoSpriteMotion(
  joints: SpriteJoints,
  body: Group,
  time: number,
  fighter: FighterSnapshot,
  progress: number,
  strike: boolean,
  forward: -1 | 1,
): void {
  body.rotation.set(0, 0, 0);
  body.scale.set(1, 1, 1);

  const action = fighter.action;
  if (strike) {
    const impact = action?.moveId === ECHO_MOVE_IDS.hk ? 0.026 : 0.012;
    body.position.x += forward * impact;
    body.scale.set(1.012, 0.995, 1);
    return;
  }
  if (action === null && fighter.hitstun === 0 && !fighter.guarding) {
    const observe = Math.sin(time * 0.72);
    rotate(joints.head, -0.025 + observe * 0.012);
    rotate(joints.forearm, observe * 0.025);
    rotate(joints.farForearm, -observe * 0.018);
    rotate(joints.sash, Math.sin(time * 1.1) * 0.014);
    return;
  }
  if (action === null) return;

  const anticipation = envelope(progress, 0, 0.31, 0.48);
  const contact = envelope(progress, 0.3, 0.49, 0.68);
  const moveId = action.moveId;
  rotate(joints.head, -anticipation * 0.055);

  if (moveId === ECHO_SUPER_MOVE_IDS.analysis) {
    const read = Math.sin(progress * Math.PI);
    const counter = Math.sin(progress * Math.PI * 7) * read;
    rotate(joints.upperArm, -read * 0.28 - counter * 0.12);
    rotate(joints.forearm, -read * 0.44 + counter * 0.2);
    rotate(joints.farUpperArm, read * 0.2 + counter * 0.1);
    rotate(joints.farForearm, -counter * 0.18);
    rotate(joints.head, -read * 0.1);
    body.position.x += forward * Math.max(0, counter) * 0.045;
  } else if (moveId === ECHO_SUPER_MOVE_IDS.repeat) {
    const command = Math.sin(progress * Math.PI);
    rotate(joints.upperArm, -command * 0.4);
    rotate(joints.forearm, command * 0.16);
    rotate(joints.farUpperArm, command * 0.34);
    rotate(joints.farForearm, -command * 0.18);
  } else if (moveId === ECHO_SUPER_MOVE_IDS.statistics) {
    const walk = smoothRange(progress, 0.02, 0.62);
    const finish = envelope(progress, 0.58, 0.76, 0.94);
    const stride = Math.sin(progress * Math.PI * 8) * (1 - finish);
    rotate(joints.thigh, stride * 0.12);
    rotate(joints.farThigh, -stride * 0.12);
    rotate(joints.upperArm, -stride * 0.06 - finish * 0.62);
    rotate(joints.forearm, -finish * 0.38);
    rotate(joints.farUpperArm, stride * 0.06 + finish * 0.24);
    rotate(joints.torso, finish * 0.13);
    rotate(joints.head, -0.035);
    body.position.x += forward * (walk * 0.38 + finish * 0.24);
    body.scale.set(1 + finish * 0.018, 1 - finish * 0.008, 1);
  } else if (moveId === ECHO_SPECIAL_MOVE_IDS.patternScan) {
    const scan = Math.sin(progress * Math.PI);
    rotate(joints.upperArm, -scan * 0.22);
    rotate(joints.forearm, -scan * 0.34);
    rotate(joints.farUpperArm, scan * 0.2);
    rotate(joints.farForearm, -scan * 0.28);
    rotate(joints.head, -scan * 0.08);
  } else if (moveId === ECHO_SPECIAL_MOVE_IDS.behavioralMirror) {
    const mirror = Math.sin(progress * Math.PI);
    rotate(joints.upperArm, -mirror * 0.36);
    rotate(joints.forearm, mirror * 0.18);
    rotate(joints.torso, -mirror * 0.06);
  } else if (moveId === ECHO_SPECIAL_MOVE_IDS.predictionLock) {
    const lock = Math.sin(progress * Math.PI);
    rotate(joints.upperArm, -lock * 0.18);
    rotate(joints.forearm, -lock * 0.46);
    rotate(joints.head, -lock * 0.1);
    body.position.x += forward * lock * 0.018;
  } else if (moveId === ECHO_MOVE_IDS.lp) {
    rotate(joints.farForearm, -anticipation * 0.14);
    rotate(joints.torso, contact * 0.035);
  } else if (moveId === ECHO_MOVE_IDS.hp) {
    rotate(joints.torso, -anticipation * 0.09 + contact * 0.12);
    rotate(joints.farUpperArm, -anticipation * 0.12);
    body.position.x += forward * contact * 0.045;
  } else if (moveId === ECHO_MOVE_IDS.lk) {
    rotate(joints.head, anticipation * 0.07);
    rotate(joints.torso, anticipation * 0.1);
    body.position.y -= contact * 0.025;
  } else if (moveId === ECHO_MOVE_IDS.hk) {
    rotate(joints.torso, -anticipation * 0.12 + contact * 0.16);
    rotate(joints.sash, -anticipation * 0.18 + contact * 0.3);
    body.position.x += forward * contact * 0.035;
  }
}

function rotate(joint: Group | null, amount: number): void {
  if (joint !== null) joint.rotation.z += amount;
}

function envelope(
  value: number,
  start: number,
  peak: number,
  end: number,
): number {
  if (value <= start || value >= end) return 0;
  if (value <= peak) return smooth((value - start) / (peak - start));
  return 1 - smooth((value - peak) / (end - peak));
}

function smooth(value: number): number {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped * clamped * (3 - 2 * clamped);
}

function smoothRange(value: number, start: number, end: number): number {
  return smooth((value - start) / Math.max(0.001, end - start));
}
