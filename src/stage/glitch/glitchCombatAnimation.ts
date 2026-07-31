import { GLITCH_MOVE_IDS } from '@/src/data/glitch-combat-moves';
import type { FighterSnapshot } from '@/src/sim';
import { combatAnimationProgress } from '../combatAnimationProgress';
import type { FighterRig } from '../fighterRig';
import { pulse, setPosition, setRotation, smooth } from '../fighterRig';

export function applyGlitchCombatAnimation(
  rig: FighterRig,
  fighter: FighterSnapshot,
): void {
  if (fighter.health <= 0) {
    applyGlitchKnockdown(rig, fighter.facing);
    return;
  }

  const action = fighter.action;
  if (action !== null) {
    const progress = combatAnimationProgress(action.moveId, action.frame);
    const facing = fighter.facing;
    if (action.moveId === GLITCH_MOVE_IDS.lp) checksumNeedle(rig, progress, facing);
    else if (action.moveId === GLITCH_MOVE_IDS.hp) kernelDrop(rig, progress, facing);
    else if (action.moveId === GLITCH_MOVE_IDS.lk) rollbackRam(rig, progress, facing);
    else if (action.moveId === GLITCH_MOVE_IDS.hk) packetScythe(rig, progress, facing);
    else if (action.moveId === GLITCH_MOVE_IDS.packetLoss) packetLoss(rig, progress, facing);
    else if (action.moveId === GLITCH_MOVE_IDS.corruptedZone) corruptedZone(rig, progress, facing);
    else if (action.moveId === GLITCH_MOVE_IDS.desyncJump) desyncJump(rig, progress, facing);
    return;
  }

  if (fighter.guarding) {
    setRotation(rig.leftArm, 0, 0, 1.02);
    setRotation(rig.rightArm, 0, 0, -1.02);
  } else if (fighter.hitstun > 0) {
    const recoil = Math.min(1, fighter.hitstun / 12);
    setRotation(rig.torso, 0, 0, fighter.facing * recoil * 0.46);
    setRotation(rig.head, 0, 0, fighter.facing * recoil * 0.28);
  }
}

function applyGlitchKnockdown(rig: FighterRig, facing: -1 | 1): void {
  setRotation(rig.root, 0, 0, -facing * 0.54);
  setRotation(rig.torso, 0, 0, facing * 0.46);
  setRotation(rig.head, 0, 0, facing * -1.06);
  setRotation(rig.leftLeg, 0, 0, facing * 0.62);
  setRotation(rig.rightLeg, 0, 0, -facing * 0.82);
  setRotation(rig.leftArm, 0, 0, facing * -0.32);
  setRotation(rig.rightArm, 0, 0, facing * 0.98);
  rig.root.position.y = -0.6;
  rig.leftLeg.position.y = 0.38;
  rig.rightLeg.position.y = 0.38;
  rig.leftSword.position.y = -0.2;
  rig.rightSword.position.y = -0.2;
  rig.projectile.visible = false;
  rig.aura.visible = false;
  rig.echoes.visible = false;
  rig.slash.visible = false;
}

function checksumNeedle(rig: FighterRig, p: number, facing: -1 | 1): void {
  const hit = pulse(p, 0.38);
  const arm = facing === 1 ? rig.rightArm : rig.leftArm;
  arm.position.x += facing * hit * 0.72;
  arm.rotation.z -= facing * hit * 1.54;
  rig.torso.rotation.y += facing * hit * 0.34;
  rig.head.rotation.z += facing * hit * 0.08;
  rig.root.position.x += facing * hit * 0.18;
  showSlash(rig, p, facing * 1.02, 1.45, hit * 0.64, hit * 0.18);
}

function kernelDrop(rig: FighterRig, p: number, facing: -1 | 1): void {
  const charge = windowed(p, 0, 0.36, 0.58);
  const hit = pulse(p, 0.6);
  rig.leftArm.rotation.z += charge * 1.18;
  rig.rightArm.rotation.z -= charge * 1.18;
  rig.leftLeg.rotation.z += facing * charge * 1.52;
  rig.rightLeg.rotation.z -= facing * charge * 0.38;
  rig.torso.rotation.z -= facing * (charge * 0.22 - hit * 0.32);
  rig.root.position.y += charge * 0.32 - hit * 0.38;
  showSlash(rig, p, facing * 0.74, 1.3, hit * 1.48, facing * 0.5);
}

function rollbackRam(rig: FighterRig, p: number, facing: -1 | 1): void {
  const charge = windowed(p, 0, 0.27, 0.48);
  const hit = pulse(p, 0.5);
  const arm = facing === 1 ? rig.rightArm : rig.leftArm;
  arm.rotation.z -= facing * (charge * 0.9 + hit * 1.1);
  rig.torso.rotation.z -= facing * (charge * 0.42 - hit * 0.16);
  rig.root.position.x += facing * hit * 0.42;
  rig.echoes.visible = p > 0.16 && p < 0.74;
  setPosition(rig.echoes, -facing * (0.42 + hit * 0.38), 0.12, 0);
  showSlash(rig, p, facing * 0.9, 1.12, hit, hit * 0.3);
}

function packetScythe(rig: FighterRig, p: number, facing: -1 | 1): void {
  const hit = pulse(p, 0.54);
  const leg = facing === 1 ? rig.rightLeg : rig.leftLeg;
  leg.position.x += facing * hit * 0.92;
  leg.position.y -= hit * 0.34;
  leg.rotation.z -= facing * hit * 1.72;
  rig.torso.rotation.y += facing * hit * 0.72;
  rig.torso.rotation.z -= facing * hit * 0.42;
  rig.root.position.y -= hit * 0.3;
  showSlash(rig, p, facing * 1.12, 0.24, hit * 1.42, facing * 0.78);
}

function packetLoss(rig: FighterRig, p: number, facing: -1 | 1): void {
  const cast = pulse(p, 0.42);
  rig.leftArm.rotation.z += facing * cast * 1.18;
  rig.rightArm.rotation.z += facing * cast * 1.18;
  rig.torso.rotation.y += facing * cast * 0.42;
  rig.projectile.visible = p > 0.28 && p < 0.86;
  const travel = clamp((p - 0.28) / 0.58);
  setPosition(rig.projectile, facing * (0.7 + travel * 2.8), 1.18, 0);
  setRotation(rig.projectile, travel * 5, travel * 7, travel * 4);
  rig.projectile.scale.setScalar(0.7 + Math.sin(travel * Math.PI) * 0.55);
}

function corruptedZone(rig: FighterRig, p: number, facing: -1 | 1): void {
  const cast = pulse(p, 0.52);
  rig.root.position.y -= cast * 0.2;
  rig.torso.rotation.z -= facing * cast * 0.18;
  rig.leftArm.rotation.z += 1.1 * cast;
  rig.rightArm.rotation.z -= 1.1 * cast;
  rig.aura.visible = p > 0.22 && p < 0.88;
  setPosition(rig.aura, facing * 0.55, 0.08, 0);
  rig.aura.scale.setScalar(0.25 + cast * 1.45);
  rig.aura.rotation.y = p * Math.PI * 4;
}

function desyncJump(rig: FighterRig, p: number, facing: -1 | 1): void {
  const jump = Math.sin(p * Math.PI);
  const kick = pulse(p, 0.5);
  rig.root.position.y += jump * 1.16;
  rig.root.position.x += facing * Math.sin(p * Math.PI) * 0.56;
  rig.root.rotation.z -= facing * jump * 0.2;
  const leg = facing === 1 ? rig.rightLeg : rig.leftLeg;
  leg.rotation.z -= facing * kick * 1.42;
  leg.position.x += facing * kick * 0.48;
  rig.echoes.visible = p > 0.08 && p < 0.92;
  setPosition(rig.echoes, -facing * jump * 0.58, jump * 0.45, 0);
  rig.echoes.scale.setScalar(0.8 + jump * 0.7);
}

function showSlash(
  rig: FighterRig,
  p: number,
  x: number,
  y: number,
  scale: number,
  rotation: number,
): void {
  rig.slash.visible = p > 0.28 && p < 0.76;
  setPosition(rig.slash, x, y, 0);
  setRotation(rig.slash, 0, 0, rotation * Math.PI);
  rig.slash.scale.setScalar(Math.max(0.08, scale));
}

function windowed(value: number, start: number, peak: number, end: number): number {
  if (value <= peak) return smooth(clamp((value - start) / (peak - start)));
  return 1 - smooth(clamp((value - peak) / (end - peak)));
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}
