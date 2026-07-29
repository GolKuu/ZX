import type { ZoroRig } from './zoroRig';
import { pulse, setPosition, setRotation, smooth } from './zoroRig';

export function threeThousandWorlds(
  rig: ZoroRig,
  progress: number,
): void {
  const charge = Math.min(1, progress / 0.2);
  const advance = smooth(Math.max(0, Math.min(1, (progress - 0.18) / 0.58)));
  const finish = smooth(Math.max(0, (progress - 0.74) / 0.2));
  const spin = progress * Math.PI * 14;
  setPosition(rig.root, advance * 2.35 + finish * 0.75, 0, 0);
  setRotation(rig.torso, 0, 0, -0.18 + finish * 0.25);
  setRotation(rig.leftArm, 0, 0, 1.1 - finish * 1.65);
  setRotation(rig.rightArm, 0, 0, -1.1 + finish * 1.65);
  setRotation(rig.leftSword, spin, 0, -Math.PI / 2);
  setRotation(rig.rightSword, -spin, 0, Math.PI / 2);
  rig.aura.visible = progress > 0.04 && progress < 0.96;
  rig.aura.scale.setScalar(0.8 + charge * 0.38);
  rig.slash.visible = progress > 0.18 && progress < 0.92;
  rig.slash.scale.setScalar(1.35 + pulse(progress, 0.55) * 0.35);
  setPosition(rig.slash, 0.45, 1.25, 0);
  setRotation(rig.slash, Math.PI / 2, 0, spin);
}

export function asura(rig: ZoroRig, progress: number): void {
  const manifest = smooth(Math.min(1, progress / 0.32));
  const strike = Math.max(0, (progress - 0.34) / 0.58);
  const wave = Math.sin(strike * Math.PI * 9);
  setRotation(rig.torso, 0, wave * 0.2, -0.12);
  setRotation(rig.leftArm, 0, 0, 0.75 + wave * 0.48);
  setRotation(rig.rightArm, 0, 0, -0.75 - wave * 0.48);
  setRotation(rig.leftSword, 0, 0, -1.25 + wave * 0.62);
  setRotation(rig.rightSword, 0, 0, 1.25 - wave * 0.62);
  setPosition(rig.root, smooth(strike) * 1.1, pulse(progress, 0.62) * 0.06, 0);
  rig.aura.visible = progress > 0.03;
  rig.aura.scale.setScalar(0.85 + manifest * 0.62 + Math.abs(wave) * 0.12);
  rig.echoes.visible = progress > 0.12;
  rig.echoes.scale.setScalar(0.72 + manifest * 0.28);
  setRotation(rig.echoes, 0, wave * 0.24, 0);
  rig.slash.visible = progress > 0.32 && progress < 0.94;
  rig.slash.scale.setScalar(1.25 + Math.abs(wave) * 0.55);
  setPosition(rig.slash, 0.75, 1.3, 0);
  setRotation(rig.slash, 0, 0, wave * 1.2);
}
