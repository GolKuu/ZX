import type { ZoroRig } from './zoroRig';
import { pulse, setPosition, setRotation, smooth } from './zoroRig';

const LION_DASH_DISTANCE = 1.2;

export function lionSong(
  rig: ZoroRig,
  progress: number,
  facing: -1 | 1,
): void {
  const draw = motionWindow(progress, 0, 0.32, 0.52);
  const dash = heldMotion(progress, 0.4, 0.52, 0.64, 0.84);
  const sheath = motionWindow(progress, 0.58, 0.76, 1);
  const arm = facing === 1 ? rig.rightArm : rig.leftArm;
  const sword = facing === 1 ? rig.rightSword : rig.leftSword;
  rig.torso.rotation.y += facing * dash * 0.45;
  rig.torso.rotation.z += facing * (-draw * 0.4 + sheath * 0.18);
  arm.rotation.z += facing * (-draw * 1.18 + sheath * 0.68);
  arm.position.x += facing * dash * 0.36;
  sword.rotation.z += facing * (draw * 1.52 - sheath * 1.12);
  rig.root.position.x += facing * dash * LION_DASH_DISTANCE;
}

export function ogreTwister(rig: ZoroRig, progress: number): void {
  const rush = smooth(Math.min(1, progress / 0.82));
  const spin = progress * Math.PI * 6;
  setPosition(rig.root, rush * 2.15, pulse(progress, 0.55) * 0.12, 0);
  setRotation(rig.root, 0, spin, -0.16);
  setRotation(rig.leftArm, 0, 0, 1.05);
  setRotation(rig.rightArm, 0, 0, -1.05);
  setRotation(rig.leftSword, 0, 0, -1.25);
  setRotation(rig.rightSword, 0, 0, 1.25);
}

export function poundCannon(rig: ZoroRig, progress: number): void {
  const rise = smooth(Math.min(1, progress / 0.5));
  setRotation(rig.torso, 0, 0, 0.28 - rise * 0.5);
  setRotation(rig.rightArm, 0, 0, -0.85 + rise * 2.15);
  setRotation(rig.rightSword, 0, 0, -0.7 + rise * 2.4);
  setPosition(rig.root, rise * 0.12, pulse(progress, 0.52) * 0.08, 0);
  rig.projectile.visible = progress > 0.4 && progress < 0.92;
  const travel = Math.max(0, (progress - 0.4) / 0.52);
  setPosition(rig.projectile, 0.8 + travel * 3.4, 1.25 + travel * 0.9, 0);
  rig.projectile.scale.setScalar(0.75 + travel * 0.5);
  setRotation(rig.projectile, 0, 0, -0.2);
}

export function swordStyles(rig: ZoroRig, progress: number): void {
  const reach = pulse(progress, 0.5);
  setRotation(rig.torso, 0, 0, reach * 0.18);
  setRotation(rig.leftArm, 0, 0, 0.2 + reach * 1.25);
  setRotation(rig.rightArm, 0, 0, -0.2 - reach * 1.1);
  setRotation(rig.head, 0, 0, -reach * 0.2);
  rig.aura.visible = progress > 0.25 && progress < 0.8;
  rig.aura.scale.setScalar(0.75 + reach * 0.35);
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
