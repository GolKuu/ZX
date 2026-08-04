import { TITAN_MOVE_IDS as ID } from '@/src/data/titan/ids';
import type { FighterSnapshot } from '@/src/sim';
import { spriteAnimationProgress } from '../combatAnimationProgress';
import { pulse, setPosition, setRotation, type FighterRig } from '../fighterRig';

export function applyTitanCombatAnimation(
  rig: FighterRig,
  fighter: FighterSnapshot,
  time: number,
): void {
  if (fighter.health <= 0 || fighter.knockdownFrames > 0) {
    return knockdown(rig, fighter.facing);
  }
  if (fighter.action !== null) {
    return attack(
      rig,
      fighter.action.moveId,
      spriteAnimationProgress(fighter.action.moveId, fighter.action.frame),
      fighter.facing,
    );
  }
  if (fighter.guarding) return block(rig, fighter.facing, fighter.hitstop > 0);
  if (fighter.hitstun > 0) return hurt(rig, fighter.facing, fighter.hitstun);
  idle18(rig, time);
}

function idle18(rig: FighterRig, time: number): void {
  const frame = Math.floor(time * 12) % 18;
  const cycle = (frame / 18) * Math.PI * 2;
  const breath = (1 - Math.cos(cycle)) * 0.018;
  rig.torso.position.y = 1.3 + breath;
  rig.head.position.y = 2.08 + breath * 0.45;
  rig.leftArm.rotation.z = -0.72 - Math.sin(cycle) * 0.025;
  rig.rightArm.rotation.z = 0.72 + Math.sin(cycle) * 0.025;
  rig.aura.visible = frame === 0 || frame === 1;
  setPosition(rig.aura, 0, 1.34, 0);
  rig.aura.scale.setScalar(0.33 + breath * 3);
}

function attack(rig: FighterRig, id: string, p: number, facing: -1 | 1): void {
  const weight = pulse(p, 0.58);
  if (id === ID.pistonHammer) return rightPistonPunch(rig, p, weight, facing);
  if (id === ID.bulkheadBackfist) return leftBackfist(rig, p, weight, facing);
  if (id === ID.seismicStomp) return rightSeismicStomp(rig, p, weight, facing);
  if (id === ID.siegeRam) return leftSiegeKick(rig, p, weight, facing);

  const grab = id.includes('.grab.') || id.includes('slam') || id.includes('anchor');
  const stomp = id === ID.seismicStomp || id.includes('ground-slam');
  const ram = id === ID.siegeRam || id.includes('charge') || id.includes('siege-engine');
  if (grab) return grapple(rig, id, p, weight, facing);
  if (stomp) {
    rig.torso.rotation.z -= facing * weight * 0.34;
    rig.rightLeg.rotation.z += facing * weight * 0.92;
    rig.rightLeg.position.y += weight * 0.28;
    rig.echoes.visible = p > 0.42 && p < 0.78;
    setPosition(rig.echoes, facing * 0.72, 0.04, 0);
  } else if (ram) {
    rig.root.position.x += facing * weight * 0.58;
    rig.root.position.y -= weight * 0.16;
    rig.torso.rotation.z -= facing * weight * 0.48;
    setRotation(rig.leftArm, 0, 0, facing * 1.18);
    setRotation(rig.rightArm, 0, 0, facing * 0.82);
  } else {
    const arm = id === ID.bulkheadBackfist ? rig.leftArm : rig.rightArm;
    arm.rotation.z -= facing * weight * (id === ID.bulkheadBackfist ? 2.15 : 1.62);
    arm.position.x += facing * weight * 0.74;
    rig.torso.rotation.z -= facing * weight * 0.28;
  }
  showImpact(rig, p, weight, facing, ram);
}

/** J / LP: a short, fast right piston. Every pose is deliberately quantized. */
function rightPistonPunch(
  rig: FighterRig,
  p: number,
  weight: number,
  facing: -1 | 1,
): void {
  rig.root.position.x += facing * weight * 0.14;
  rig.torso.rotation.z -= facing * weight * 0.2;
  rig.leftArm.rotation.z += facing * weight * 0.2;
  rig.rightArm.rotation.z += facing * weight * 0.92;
  rig.rightArm.rotation.x -= weight * 0.14;
  rig.rightArm.position.x += facing * weight * 0.9;
  rig.rightArm.position.y += weight * 0.16;
  limbImpact(rig, p, weight, facing, 1.58, 1.08, false);
}

/** K / LK: the opposite shoulder winds up and throws a broad left backfist. */
function leftBackfist(
  rig: FighterRig,
  p: number,
  weight: number,
  facing: -1 | 1,
): void {
  rig.root.position.x += facing * weight * 0.2;
  rig.torso.rotation.z += facing * weight * 0.31;
  rig.head.rotation.z -= facing * weight * 0.1;
  rig.leftArm.rotation.z += facing * weight * 2.2;
  rig.leftArm.rotation.x += weight * 0.2;
  rig.leftArm.position.x += facing * weight * 1.04;
  rig.leftArm.position.y += weight * 0.08;
  rig.rightArm.rotation.z -= facing * weight * 0.22;
  limbImpact(rig, p, weight, facing, 1.52, 1.2, true);
}

/** I / HP: right boot rises, pauses, then crushes the floor in five sprite beats. */
function rightSeismicStomp(
  rig: FighterRig,
  p: number,
  weight: number,
  facing: -1 | 1,
): void {
  rig.root.position.y += weight * 0.08;
  rig.root.position.x -= facing * weight * 0.08;
  rig.torso.rotation.z += facing * weight * 0.25;
  rig.leftLeg.rotation.z -= facing * weight * 0.14;
  rig.rightLeg.rotation.z -= facing * weight * 0.62;
  rig.rightLeg.rotation.x -= weight * 0.48;
  rig.rightLeg.position.x += facing * weight * 0.46;
  rig.rightLeg.position.y += weight * 0.48;
  rig.leftArm.rotation.z -= facing * weight * 0.3;
  rig.rightArm.rotation.z += facing * weight * 0.26;
  limbImpact(rig, p, weight, facing, 0.16, 0.74, true);
}

/** L / HK: a slower left siege kick with the full reactor mass behind it. */
function leftSiegeKick(
  rig: FighterRig,
  p: number,
  weight: number,
  facing: -1 | 1,
): void {
  rig.root.position.x += facing * weight * 0.32;
  rig.root.position.y += weight * 0.12;
  rig.torso.rotation.z -= facing * weight * 0.42;
  rig.leftLeg.rotation.z += facing * weight * 1.16;
  rig.leftLeg.rotation.x += weight * 0.22;
  rig.leftLeg.position.x += facing * weight * 0.94;
  rig.leftLeg.position.y += weight * 0.32;
  rig.rightLeg.rotation.z -= facing * weight * 0.25;
  rig.leftArm.rotation.z -= facing * weight * 0.24;
  rig.rightArm.rotation.z += facing * weight * 0.38;
  limbImpact(rig, p, weight, facing, 0.72, 1.28, true);
}

function limbImpact(
  rig: FighterRig,
  p: number,
  weight: number,
  facing: -1 | 1,
  height: number,
  reach: number,
  heavy: boolean,
): void {
  rig.slash.visible = p >= 0.52 && p <= 0.68;
  setPosition(rig.slash, facing * reach, height, 0.12);
  rig.slash.rotation.z = heavy ? facing * 0.2 : facing * -0.1;
  rig.slash.scale.setScalar((heavy ? 0.58 : 0.42) + weight * 0.42);
  rig.echoes.visible = heavy && p >= 0.34 && p <= 0.72;
  setPosition(rig.echoes, facing * reach * 0.58, height, 0.02);
  rig.echoes.rotation.z = facing * (height < 0.5 ? -0.4 : 0.12);
  rig.echoes.scale.setScalar(0.72 + weight * 0.4);
  rig.aura.visible = heavy && p >= 0.34 && p <= 0.68;
  setPosition(rig.aura, 0, 1.34, -0.08);
  rig.aura.scale.setScalar(0.42 + weight * 0.3);
}

function grapple(
  rig: FighterRig,
  id: string,
  p: number,
  weight: number,
  facing: -1 | 1,
): void {
  const lift = id.includes('anti-air') || id.includes('continental') || id.includes('anchor');
  rig.root.position.x += facing * weight * 0.38;
  rig.torso.rotation.z -= facing * weight * 0.24;
  setRotation(rig.leftArm, 0, 0, facing * (0.92 + weight * 0.72));
  setRotation(rig.rightArm, 0, 0, -facing * (0.92 + weight * 0.72));
  rig.leftArm.position.x += facing * weight * 0.42;
  rig.rightArm.position.x += facing * weight * 0.42;
  if (lift) {
    rig.leftArm.position.y += weight * 0.68;
    rig.rightArm.position.y += weight * 0.68;
  }
  rig.aura.visible = p > 0.12 && p < 0.82;
  setPosition(rig.aura, facing * 0.5, lift ? 1.7 : 1.15, 0);
  rig.aura.scale.setScalar(0.45 + weight * 0.72);
  rig.echoes.visible = id.includes('finish') && p > 0.35;
}

function showImpact(
  rig: FighterRig,
  p: number,
  weight: number,
  facing: -1 | 1,
  overdrive: boolean,
): void {
  rig.slash.visible = p > 0.4 && p < 0.72;
  setPosition(rig.slash, facing * 0.98, 1.22, 0);
  rig.slash.scale.setScalar(0.35 + weight * 0.8);
  rig.aura.visible = overdrive && p > 0.12 && p < 0.88;
  setPosition(rig.aura, 0, 1.25, 0);
  rig.aura.scale.setScalar(0.5 + weight * 0.82);
}

function block(rig: FighterRig, facing: -1 | 1, impact: boolean): void {
  setRotation(rig.leftArm, 0, 0, facing * 1.28);
  setRotation(rig.rightArm, 0, 0, facing * 0.94);
  rig.leftArm.position.x += facing * 0.18;
  rig.rightArm.position.x += facing * 0.22;
  rig.torso.rotation.z -= facing * (impact ? 0.17 : 0.06);
  rig.aura.visible = impact;
  setPosition(rig.aura, facing * 0.42, 1.35, 0);
  rig.aura.scale.setScalar(0.62);
}

function hurt(rig: FighterRig, facing: -1 | 1, frames: number): void {
  const recoil = Math.min(1, frames / 16);
  rig.torso.rotation.z += facing * recoil * 0.38;
  rig.head.rotation.z += facing * recoil * 0.24;
}

function knockdown(rig: FighterRig, facing: -1 | 1): void {
  rig.root.position.y -= 0.72;
  rig.root.rotation.z = -facing * 1.18;
  rig.leftLeg.rotation.z = facing * 0.48;
  rig.rightLeg.rotation.z = -facing * 0.42;
}
