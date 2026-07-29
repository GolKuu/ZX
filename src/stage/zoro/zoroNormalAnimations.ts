import type { ZoroRig } from './zoroRig';
import { pulse, smooth } from './zoroRig';

export function lightPunch(
  rig: ZoroRig,
  progress: number,
  facing: -1 | 1,
): void {
  const windup = motionWindow(progress, 0, 0.27, 0.43);
  const strike = pulse(progress, 0.45);
  const arm = facing === 1 ? rig.rightArm : rig.leftArm;
  const supportArm = facing === 1 ? rig.leftArm : rig.rightArm;
  arm.position.x += facing * strike * 0.42;
  arm.position.y += strike * 0.14;
  arm.rotation.x += strike * 0.18;
  arm.rotation.z += facing * (windup * 0.48 - strike * 1.38);
  supportArm.rotation.z -= facing * windup * 0.24;
  rig.torso.rotation.y += facing * strike * 0.3;
  rig.torso.rotation.z += facing * (windup * 0.1 - strike * 0.08);
  rig.root.position.x += facing * (strike * 0.26 - windup * 0.05);
}

export function heavyPunch(
  rig: ZoroRig,
  progress: number,
  facing: -1 | 1,
): void {
  const windup = motionWindow(progress, 0, 0.3, 0.52);
  const cut = heldMotion(progress, 0.28, 0.5, 0.72, 1);
  rig.torso.rotation.y += facing * cut * 0.38;
  rig.torso.rotation.z += facing * (windup * -0.3 + cut * 0.2);
  rig.leftArm.rotation.z += windup * 1.25 - cut * 0.82;
  rig.rightArm.rotation.z += windup * -1.25 + cut * 0.82;
  rig.leftSword.rotation.z += windup * 0.72 - cut * 1.3;
  rig.rightSword.rotation.z += windup * -0.72 + cut * 1.3;
  rig.leftArm.position.x += facing * cut * 0.28;
  rig.rightArm.position.x += facing * cut * 0.28;
  rig.root.position.x += facing * (cut * 0.34 - windup * 0.07);
}

export function lightKick(
  rig: ZoroRig,
  progress: number,
  facing: -1 | 1,
): void {
  const windup = motionWindow(progress, 0.04, 0.29, 0.45);
  const strike = pulse(progress, 0.48);
  const leg = facing === 1 ? rig.rightLeg : rig.leftLeg;
  const supportLeg = facing === 1 ? rig.leftLeg : rig.rightLeg;
  leg.rotation.z += facing * (windup * 0.3 - strike * 1.45);
  leg.position.x += facing * strike * 0.42;
  leg.position.y += strike * 0.3;
  supportLeg.rotation.z += facing * windup * 0.16;
  rig.torso.rotation.y -= facing * strike * 0.22;
  rig.torso.rotation.z -= facing * strike * 0.2;
  rig.root.position.x += facing * (strike * 0.22 - windup * 0.04);
  rig.root.position.y += strike * 0.04;
}

export function heavyKick(
  rig: ZoroRig,
  progress: number,
  facing: -1 | 1,
): void {
  const windup = motionWindow(progress, 0, 0.3, 0.49);
  const sweep = heldMotion(progress, 0.27, 0.53, 0.7, 1);
  const leg = facing === 1 ? rig.rightLeg : rig.leftLeg;
  const supportLeg = facing === 1 ? rig.leftLeg : rig.rightLeg;
  const rearArm = facing === 1 ? rig.leftArm : rig.rightArm;
  rig.torso.rotation.y += facing * sweep * 0.8;
  rig.torso.rotation.z -= facing * (windup * 0.3 + sweep * 0.1);
  rearArm.rotation.z += facing * (windup * 0.7 - sweep * 0.9);
  leg.rotation.z += facing * (windup * 0.38 - sweep * 1.68);
  leg.position.x += facing * sweep * 0.48;
  leg.position.y += sweep * 0.2;
  supportLeg.rotation.z += facing * windup * 0.28;
  rig.root.position.x += facing * (sweep * 0.3 - windup * 0.05);
  rig.root.position.y -= pulse(progress, 0.55) * 0.32;
}

function heldMotion(
  progress: number,
  enterStart: number,
  enterEnd: number,
  exitStart: number,
  exitEnd: number,
): number {
  return smoothRange(progress, enterStart, enterEnd)
    * (1 - smoothRange(progress, exitStart, exitEnd));
}

function motionWindow(
  progress: number,
  enterStart: number,
  peak: number,
  exitEnd: number,
): number {
  return heldMotion(progress, enterStart, peak, peak, exitEnd);
}

function smoothRange(value: number, start: number, end: number): number {
  return smooth(Math.max(0, Math.min(1, (value - start) / (end - start))));
}
