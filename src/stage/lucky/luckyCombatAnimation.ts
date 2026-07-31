import { LUCKY_MOVE_IDS } from '@/src/data/lucky/moves';
import { LUCKY_SPECIAL_IDS } from '@/src/data/lucky/specials';
import type { FighterSnapshot } from '@/src/sim';
import { combatAnimationProgress } from '../combatAnimationProgress';
import { pulse, setPosition, setRotation, type FighterRig } from '../fighterRig';

export function applyLuckyCombatAnimation(
  rig: FighterRig,
  fighter: FighterSnapshot,
  time: number,
): void {
  if (fighter.health <= 0) return knockdown(rig, fighter.facing);
  if (fighter.action !== null) {
    return attack(
      rig,
      fighter.action.moveId,
      combatAnimationProgress(fighter.action.moveId, fighter.action.frame),
      fighter.facing,
    );
  }
  if (fighter.guarding) return block(rig, fighter.facing, fighter.hitstop > 0);
  if (fighter.hitstun > 0) return hurt(rig, fighter.facing, fighter.hitstun);
  idle18(rig, time);
}

function idle18(rig: FighterRig, time: number): void {
  const frame = Math.floor(time * 12) % 18;
  const sway = Math.sin((frame / 18) * Math.PI * 2);
  rig.torso.rotation.z += sway * 0.025;
  rig.head.rotation.z -= sway * 0.018;
  rig.rightArm.rotation.z += sway * 0.06;
  rig.projectile.visible = true;
  setPosition(rig.projectile, 0.56, 1.55 + sway * 0.08, 0);
  rig.projectile.rotation.y = frame * 0.35;
}

function attack(rig: FighterRig, id: string, p: number, facing: -1 | 1): void {
  const hit = pulse(p, id === LUCKY_MOVE_IDS.quickDraw ? 0.38 : 0.52);
  const low = id === LUCKY_MOVE_IDS.slidingBet || id.includes('crouch') || id.includes('sweep');
  const kick = id === LUCKY_MOVE_IDS.fortuneHeel || id.includes('break') || id.includes('rush');
  if (low) {
    rig.root.position.y -= hit * 0.55;
    rig.root.position.x += facing * hit * 0.56;
    rig.torso.rotation.z -= facing * hit * 0.42;
  } else if (kick) {
    const leg = facing === 1 ? rig.rightLeg : rig.leftLeg;
    leg.rotation.z -= facing * hit * 1.65;
    leg.position.x += facing * hit * 0.72;
    leg.position.y += hit * 0.32;
  } else {
    const arm = facing === 1 ? rig.rightArm : rig.leftArm;
    arm.rotation.z -= facing * hit * 1.42;
    arm.position.x += facing * hit * 0.62;
    rig.root.position.x += facing * hit * 0.24;
  }
  const enhanced = id.includes('.enhanced.') || id.includes('.super.') || id.includes('.ultimate.');
  rig.slash.visible = p > 0.22 && p < 0.74;
  setPosition(rig.slash, facing * 0.92, low ? 0.32 : 1.15, 0);
  rig.slash.scale.setScalar(0.4 + hit * (enhanced ? 1.25 : 0.75));
  rig.aura.visible = enhanced && p > 0.08 && p < 0.88;
  rig.aura.scale.setScalar(0.45 + hit * 1.15);
  rig.echoes.visible = id.includes('probability') || id.includes('impossible');
}

function block(rig: FighterRig, facing: -1 | 1, impact: boolean): void {
  setRotation(rig.leftArm, 0, 0, facing * 1.22);
  setRotation(rig.rightArm, 0, 0, facing * 0.76);
  rig.torso.rotation.z -= facing * (impact ? 0.22 : 0.08);
  rig.aura.visible = true;
  setPosition(rig.aura, facing * 0.35, 1.25, 0);
  rig.aura.scale.setScalar(impact ? 0.72 : 0.48);
}

function hurt(rig: FighterRig, facing: -1 | 1, frames: number): void {
  const recoil = Math.min(1, frames / 14);
  rig.torso.rotation.z += facing * recoil * 0.5;
  rig.head.rotation.z += facing * recoil * 0.32;
  rig.leftArm.rotation.z -= facing * recoil * 0.55;
}

function knockdown(rig: FighterRig, facing: -1 | 1): void {
  rig.root.position.y -= 0.7;
  rig.root.rotation.z = -facing * 1.22;
  rig.leftLeg.rotation.z = facing * 0.72;
  rig.rightLeg.rotation.z = -facing * 0.58;
}
