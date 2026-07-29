import type { ZoroRig } from '../zoro/zoroRig';
import { resetZoroRig, setPosition, setRotation } from '../zoro/zoroRig';

export function resetEchoRig(rig: ZoroRig, time: number): void {
  resetZoroRig(rig, 'three', time);
  setRotation(rig.leftArm, 0.03, 0, -0.45);
  setRotation(rig.rightArm, -0.03, 0, 0.45);
  setPosition(rig.echoes, 0, 1.72, -0.2);
  setRotation(rig.echoes, 0, Math.sin(time * 0.8) * 0.08, 0);
  rig.echoes.scale.setScalar(1 + Math.sin(time * 2.2) * 0.018);
  rig.echoes.visible = true;
  rig.leftSword.visible = false;
  rig.rightSword.visible = false;
  rig.mouthSword.visible = false;
}
