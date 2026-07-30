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
    if (action.moveId === GLITCH_MOVE_IDS.lp) pixelPoke(rig, progress, facing);
    else if (action.moveId === GLITCH_MOVE_IDS.hp) artifactSmash(rig, progress, facing);
    else if (action.moveId === GLITCH_MOVE_IDS.lk) bugSweep(rig, progress, facing);
    else if (action.moveId === GLITCH_MOVE_IDS.hk) dataBurst(rig, progress, facing);
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

function pixelPoke(rig: FighterRig, p: number, facing: -1 | 1): void {
  const hit = pulse(p, 0.43);
  const arm = facing === 1 ? rig.rightArm : rig.leftArm;
  arm.position.x += facing * hit * 0.58;
  arm.rotation.z -= facing * hit * 1.38;
  rig.torso.rotation.y += facing * hit * 0.28;
  rig.root.position.x += facing * hit * 0.22;
  showSlash(rig, p, facing * 0.9, 1.2, hit * 0.72, hit);
}

function artifactSmash(rig: FighterRig, p: number, facing: -1 | 1): void {
  const charge = windowed(p, 0, 0.3, 0.5);
  const hit = pulse(p, 0.54);
  rig.leftArm.rotation.z += charge * 1.7 - hit * 1.18;
  rig.rightArm.rotation.z -= charge * 1.7 - hit * 1.18;
  rig.torso.rotation.z -= facing * (charge * 0.32 - hit * 0.25);
  rig.root.position.x += facing * hit * 0.34;
  rig.root.position.y -= hit * 0.14;
  showSlash(rig, p, facing * 0.86, 0.42, hit * 1.35, hit);
}

function bugSweep(rig: FighterRig, p: number, facing: -1 | 1): void {
  const hit = pulse(p, 0.5);
  const leg = facing === 1 ? rig.rightLeg : rig.leftLeg;
  leg.position.x += facing * hit * 0.72;
  leg.position.y -= hit * 0.28;
  leg.rotation.z -= facing * hit * 1.58;
  rig.torso.rotation.z -= facing * hit * 0.34;
  rig.root.position.y -= hit * 0.25;
  showSlash(rig, p, facing * 0.82, 0.18, hit * 1.12, hit);
}

function dataBurst(rig: FighterRig, p: number, facing: -1 | 1): void {
  const hit = pulse(p, 0.5);
  const leg = facing === 1 ? rig.rightLeg : rig.leftLeg;
  leg.position.x += facing * hit * 0.82;
  leg.position.y += hit * 0.48;
  leg.rotation.z -= facing * hit * 1.55;
  rig.torso.rotation.y += facing * hit * 0.66;
  rig.torso.rotation.z -= facing * hit * 0.24;
  showSlash(rig, p, facing * 1.1, 1.12, hit * 1.45, hit);
  rig.echoes.visible = p > 0.3 && p < 0.75;
  setPosition(rig.echoes, facing * 1.3, 0.2, 0);
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
