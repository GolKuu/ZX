import type { FighterRig } from '../fighterRig';
import { pulse } from '../fighterRig';
import { heldMotion, motionWindow } from './echoMotion';

export type EchoNormalAnimation = (
  rig: FighterRig,
  progress: number,
  facing: -1 | 1,
) => void;

export const dataJab: EchoNormalAnimation = (rig, progress, facing) => {
  const anticipate = motionWindow(progress, 0, 0.22, 0.43);
  const strike = heldMotion(progress, 0.27, 0.43, 0.58, 0.72);
  const impact = heldMotion(progress, 0.42, 0.48, 0.56, 0.66);
  const arm = facing === 1 ? rig.rightArm : rig.leftArm;
  const support = facing === 1 ? rig.leftArm : rig.rightArm;
  arm.position.x += facing * (strike * 0.5 - anticipate * 0.04);
  arm.position.y += strike * 0.1 + anticipate * 0.08;
  arm.rotation.z += facing * (anticipate * 0.52 - strike * 1.5);
  support.position.y += anticipate * 0.12;
  support.rotation.z -= facing * (anticipate * 0.48 + impact * 0.1);
  rig.head.rotation.z -= facing * (anticipate * 0.1 + impact * 0.04);
  rig.torso.rotation.y += facing * (anticipate * -0.14 + strike * 0.34);
  rig.root.position.x += facing * (strike * 0.25 - anticipate * 0.04);
  ringPulse(rig, Math.max(anticipate * 0.32, strike), facing * 0.2);
};

export const predictionStrike: EchoNormalAnimation = (
  rig,
  progress,
  facing,
) => {
  const forecast = heldMotion(progress, 0.02, 0.24, 0.43, 0.62);
  const load = motionWindow(progress, 0.08, 0.31, 0.49);
  const strike = heldMotion(progress, 0.3, 0.47, 0.59, 0.78);
  const impact = heldMotion(progress, 0.44, 0.5, 0.59, 0.68);
  const arm = facing === 1 ? rig.rightArm : rig.leftArm;
  const support = facing === 1 ? rig.leftArm : rig.rightArm;
  rig.torso.rotation.y += facing * (load * -0.54 + strike * 0.82);
  rig.torso.rotation.z += facing * (load * -0.28 + impact * 0.2);
  rig.head.rotation.z -= facing * forecast * 0.13;
  arm.position.x += facing * strike * 0.7;
  arm.position.y += strike * 0.18 + forecast * 0.08;
  arm.rotation.z += facing * (load * 1.02 - strike * 1.72);
  support.position.x -= facing * forecast * 0.12;
  support.rotation.z -= facing * (forecast * 0.68 + strike * 0.32);
  rig.root.position.x += facing * (strike * 0.4 - load * 0.08);
  ringPulse(rig, Math.max(forecast * 0.45, strike + impact * 0.18), facing * 0.62);
};

export const habitSweep: EchoNormalAnimation = (rig, progress, facing) => {
  const read = heldMotion(progress, 0, 0.2, 0.39, 0.56);
  const load = motionWindow(progress, 0.04, 0.28, 0.46);
  const strike = heldMotion(progress, 0.27, 0.47, 0.58, 0.78);
  const leg = facing === 1 ? rig.rightLeg : rig.leftLeg;
  const support = facing === 1 ? rig.leftLeg : rig.rightLeg;
  rig.root.position.y -= Math.max(load * 0.24, strike * 0.36);
  rig.torso.rotation.z -= facing * (load * 0.32 + strike * 0.16);
  rig.torso.rotation.y += facing * strike * 0.72;
  rig.head.rotation.z += facing * read * 0.12;
  leg.position.x += facing * strike * 0.66;
  leg.position.y -= strike * 0.1;
  leg.rotation.z += facing * (load * 0.42 - strike * 1.86);
  support.rotation.z += facing * (load * 0.3 - strike * 0.08);
  ringPulse(rig, Math.max(read * 0.36, strike), facing * -0.42);
};

export const adaptiveRoundhouse: EchoNormalAnimation = (
  rig,
  progress,
  facing,
) => {
  const read = heldMotion(progress, 0, 0.18, 0.34, 0.5);
  const load = motionWindow(progress, 0.04, 0.29, 0.47);
  const strike = heldMotion(progress, 0.29, 0.46, 0.61, 0.82);
  const impact = pulse(progress, 0.49);
  const leg = facing === 1 ? rig.rightLeg : rig.leftLeg;
  const supportArm = facing === 1 ? rig.leftArm : rig.rightArm;
  leg.position.x += facing * strike * 0.72;
  leg.position.y += strike * 0.36;
  leg.rotation.z += facing * (load * 0.52 - strike * 1.8);
  supportArm.position.y += read * 0.14;
  supportArm.rotation.z += facing * (read * 0.62 - strike * 0.78);
  rig.head.rotation.z -= facing * read * 0.1;
  rig.torso.rotation.y += facing * (load * -0.48 + strike * 1.06);
  rig.torso.rotation.z -= facing * strike * 0.24;
  rig.root.position.x += facing * (strike * 0.33 - load * 0.06);
  rig.root.position.y += strike * 0.05;
  ringPulse(rig, Math.max(read * 0.4, strike + impact * 0.08), facing * 0.74);
};

function ringPulse(rig: FighterRig, amount: number, roll: number): void {
  rig.echoes.scale.setScalar(1 + amount * 0.18);
  rig.echoes.rotation.z += roll * amount;
  rig.echoes.children.forEach((ring, index) => {
    ring.rotation.y += (index === 0 ? -1 : 1) * amount * 0.22;
  });
}
