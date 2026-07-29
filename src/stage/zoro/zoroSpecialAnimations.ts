import type { ZoroRig } from './zoroRig';
import { pulse, setPosition, setRotation, smooth } from './zoroRig';

const LION_DASH_DISTANCE = 1.2;

export function lionSong(rig: ZoroRig, progress: number): void {
  const draw = motionWindow(progress, 0, 0.32, 0.52);
  const dash = heldMotion(progress, 0.4, 0.52, 0.64, 0.84);
  const sheath = motionWindow(progress, 0.58, 0.76, 1);
  rig.torso.rotation.z += -draw * 0.4 + sheath * 0.18;
  rig.rightArm.rotation.z += -draw * 1.18 + sheath * 0.68;
  rig.rightSword.rotation.z += draw * 1.52 - sheath * 1.12;
  rig.root.position.x += dash * LION_DASH_DISTANCE;
  rig.slash.visible = progress > 0.43 && progress < 0.68;
  rig.slash.scale.setScalar(1.45 + dash * 0.35);
  setPosition(
    rig.slash,
    dash * LION_DASH_DISTANCE - 0.15,
    1.35,
    0.02,
  );
  setRotation(rig.slash, 0, 0, -0.2);
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
  rig.slash.visible = progress > 0.12 && progress < 0.88;
  rig.slash.scale.setScalar(1.2 + Math.sin(progress * Math.PI * 3) * 0.14);
  setPosition(rig.slash, 0, 1.3, 0);
  setRotation(rig.slash, Math.PI / 2, 0, spin);
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
