import type { ZoroRig } from './zoroRig';
import { pulse, setPosition, setRotation, smooth } from './zoroRig';

export function lightPunch(rig: ZoroRig, progress: number): void {
  const windup = motionWindow(progress, 0, 0.27, 0.43);
  const strike = pulse(progress, 0.45);
  rig.torso.rotation.z += windup * 0.12 - strike * 0.08;
  rig.rightArm.rotation.x += strike * 0.15;
  rig.rightArm.rotation.z += windup * 0.42 - strike * 1.32;
  rig.rightSword.rotation.z += windup * -0.36 + strike * 1.38;
  rig.root.position.x += strike * 0.2 - windup * 0.05;
  rig.slash.visible = progress > 0.34 && progress < 0.62;
  rig.slash.scale.setScalar(0.36 + strike * 0.42);
  setPosition(rig.slash, 0.82, 1.56, 0.08);
}

export function heavyPunch(rig: ZoroRig, progress: number): void {
  const windup = motionWindow(progress, 0, 0.3, 0.52);
  const cut = heldMotion(progress, 0.28, 0.5, 0.72, 1);
  rig.torso.rotation.z += windup * -0.3 + cut * 0.24;
  rig.leftArm.rotation.z += windup * 1.25 - cut * 0.82;
  rig.rightArm.rotation.z += windup * -1.25 + cut * 0.82;
  rig.leftSword.rotation.z += windup * 0.72 - cut * 1.3;
  rig.rightSword.rotation.z += windup * -0.72 + cut * 1.3;
  rig.root.position.x += cut * 0.25 - windup * 0.07;
  showSlash(rig, progress, 1.28, 1.55, -0.68 + cut * 1.32);
}

export function lightKick(rig: ZoroRig, progress: number): void {
  const windup = motionWindow(progress, 0.04, 0.29, 0.45);
  const strike = pulse(progress, 0.48);
  rig.torso.rotation.z += windup * 0.12 - strike * 0.2;
  rig.leftLeg.rotation.z += windup * 0.28 - strike * 1.38;
  rig.leftLeg.position.x += strike * 0.27;
  rig.leftLeg.position.y += strike * 0.3;
  rig.root.position.x += strike * 0.15 - windup * 0.04;
  rig.root.position.y += strike * 0.04;
}

export function heavyKick(rig: ZoroRig, progress: number): void {
  const windup = motionWindow(progress, 0, 0.3, 0.49);
  const sweep = heldMotion(progress, 0.27, 0.53, 0.7, 1);
  rig.torso.rotation.y += sweep * 1.5;
  rig.torso.rotation.z += windup * -0.3 - sweep * 0.08;
  rig.rightArm.rotation.z += windup * -0.86 + sweep * 1.15;
  rig.rightSword.rotation.z += windup * -0.95 + sweep * 1.42;
  rig.leftLeg.rotation.z += windup * -0.34;
  rig.rightLeg.rotation.z += windup * 0.42;
  rig.root.position.x += sweep * 0.22 - windup * 0.05;
  rig.root.position.y -= pulse(progress, 0.55) * 0.32;
  showSlash(rig, progress, 1.05, 0.42, -1.55 + sweep * 2.5);
}

function showSlash(
  rig: ZoroRig,
  progress: number,
  x: number,
  y: number,
  rotation: number,
): void {
  rig.slash.visible = progress > 0.3 && progress < 0.76;
  rig.slash.scale.setScalar(0.86 + pulse(progress, 0.55) * 0.42);
  setPosition(rig.slash, x, y, 0.05);
  setRotation(rig.slash, 0, 0, rotation);
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
