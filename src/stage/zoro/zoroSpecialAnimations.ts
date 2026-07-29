import type { ZoroRig } from './zoroRig';
import { pulse, setPosition, setRotation, smooth } from './zoroRig';

export function lionSong(rig: ZoroRig, progress: number): void {
  const draw = smooth(Math.min(1, progress / 0.32));
  const teleport = progress < 0.48 ? 0 : progress < 0.68 ? 3.15 : 0;
  const sheath = smooth(Math.max(0, (progress - 0.62) / 0.34));
  setRotation(rig.torso, 0, 0, -draw * 0.38 + sheath * 0.38);
  setRotation(rig.rightArm, 0, 0, -0.2 - draw * 1.15 + sheath * 0.72);
  setRotation(rig.rightSword, 0, 0, 0.16 + draw * 1.5 - sheath * 1.2);
  setPosition(rig.root, teleport, 0, 0);
  rig.slash.visible = progress > 0.44 && progress < 0.58;
  rig.slash.scale.setScalar(1.7);
  setPosition(rig.slash, teleport - 0.15, 1.35, 0.02);
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
