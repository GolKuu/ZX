import type { FighterRig } from '../fighterRig';
import { resetFighterRig, setPosition, setRotation } from '../fighterRig';
import type { EchoReadout } from './echoObservation';

export function resetEchoRig(
  rig: FighterRig,
  time: number,
  readout: EchoReadout,
): void {
  resetFighterRig(rig, 'open', time);
  const focus = readout.confidence * 0.1 + readout.scanPulse * 0.04;
  const analysisGesture = Math.sin(time * 0.72) * focus;
  setRotation(rig.leftArm, 0.03, 0, -0.45 - analysisGesture);
  setRotation(rig.rightArm, -0.03, 0, 0.45 - analysisGesture * 0.55);
  rig.head.rotation.z = Math.sin(time * 0.48) * 0.018 - focus * 0.08;
  rig.head.position.y += Math.sin(time * 1.1) * 0.006;
  rig.torso.rotation.y = Math.sin(time * 0.4) * focus * 0.2;
  setPosition(rig.echoes, 0, 1.72, -0.2);
  setRotation(
    rig.echoes,
    0,
    Math.sin(time * 0.8) * 0.08,
    readout.lockPulse * 0.22,
  );
  const ringSignal = readout.confidence * 0.08 + readout.scanPulse * 0.1;
  rig.echoes.scale.setScalar(
    1 + Math.sin(time * 2.2) * 0.018 + ringSignal,
  );
  rig.echoes.visible = true;
  rig.leftSword.visible = false;
  rig.rightSword.visible = false;
  rig.mouthSword.visible = false;
}
