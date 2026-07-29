import type { ZoroRig } from './zoroRig';
import { pulse, setPosition, setRotation, smooth } from './zoroRig';

export function lightPunch(rig: ZoroRig, progress: number): void {
  const strike = pulse(progress, 0.42);
  setRotation(rig.rightArm, 0.15, -0.2, -0.2 - strike * 1.15);
  setRotation(rig.rightSword, 0, 0, 0.16 + strike * 1.25);
  setPosition(rig.root, strike * 0.18, 0, 0);
  rig.slash.visible = progress > 0.3 && progress < 0.54;
  rig.slash.scale.setScalar(0.35 + strike * 0.3);
  setPosition(rig.slash, 0.82, 1.56, 0.08);
}

export function heavyPunch(rig: ZoroRig, progress: number): void {
  const windup = Math.min(1, progress / 0.28);
  const cut = smooth(Math.max(0, Math.min(1, (progress - 0.25) / 0.42)));
  setRotation(rig.torso, 0, 0, -0.28 + cut * 0.5);
  setRotation(rig.leftArm, 0, 0, 1.55 - cut * 2.35);
  setRotation(rig.rightArm, 0, 0, -1.55 + cut * 2.35);
  setRotation(rig.leftSword, 0, 0, 0.65 - cut * 1.9);
  setRotation(rig.rightSword, 0, 0, -0.65 + cut * 1.9);
  setPosition(rig.root, cut * 0.22 - windup * 0.05, 0, 0);
  showSlash(rig, progress, 1.28, 1.55, -0.65 + cut * 1.25);
}

export function lightKick(rig: ZoroRig, progress: number): void {
  const strike = pulse(progress, 0.48);
  setRotation(rig.torso, 0, 0, -strike * 0.16);
  setRotation(rig.leftLeg, 0, 0, 0.08 - strike * 1.28);
  setPosition(rig.leftLeg, -0.22 + strike * 0.25, 0.94 + strike * 0.28, 0);
  setPosition(rig.root, strike * 0.13, strike * 0.03, 0);
}

export function heavyKick(rig: ZoroRig, progress: number): void {
  const sweep = smooth(Math.min(1, progress / 0.62));
  setRotation(rig.torso, 0, sweep * 1.5, -0.35);
  setRotation(rig.rightArm, 0, 0, -1.1 + sweep * 2.25);
  setRotation(rig.rightSword, 0, 0, -1.2 + sweep * 2.5);
  setRotation(rig.leftLeg, 0, 0, -0.34);
  setRotation(rig.rightLeg, 0, 0, 0.42);
  setPosition(rig.root, sweep * 0.2, -pulse(progress, 0.55) * 0.32, 0);
  showSlash(rig, progress, 1.05, 0.42, -1.55 + sweep * 2.5);
}

function showSlash(
  rig: ZoroRig,
  progress: number,
  x: number,
  y: number,
  rotation: number,
): void {
  rig.slash.visible = progress > 0.28 && progress < 0.78;
  rig.slash.scale.setScalar(0.86 + pulse(progress, 0.55) * 0.42);
  setPosition(rig.slash, x, y, 0.05);
  setRotation(rig.slash, 0, 0, rotation);
}
