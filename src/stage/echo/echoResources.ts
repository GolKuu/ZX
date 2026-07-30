import {
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  CylinderGeometry,
  IcosahedronGeometry,
  TorusGeometry,
} from 'three';

export function createEchoResources() {
  return {
    head: new IcosahedronGeometry(0.17, 1),
    visor: new BoxGeometry(0.26, 0.08, 0.08),
    neck: new CylinderGeometry(0.065, 0.08, 0.18, 8),
    chest: new CapsuleGeometry(0.19, 0.38, 4, 8),
    chestPlate: new BoxGeometry(0.34, 0.4, 0.11),
    waist: new CapsuleGeometry(0.14, 0.16, 3, 8),
    hips: new CapsuleGeometry(0.18, 0.1, 3, 8),
    shoulder: new IcosahedronGeometry(0.11, 1),
    upperArm: new CapsuleGeometry(0.065, 0.24, 3, 8),
    forearm: new CapsuleGeometry(0.058, 0.22, 3, 8),
    hand: new BoxGeometry(0.1, 0.14, 0.08),
    thigh: new CapsuleGeometry(0.085, 0.3, 3, 8),
    shin: new CapsuleGeometry(0.07, 0.28, 3, 8),
    boot: new BoxGeometry(0.14, 0.15, 0.3),
    coatTail: new BoxGeometry(0.27, 0.86, 0.07),
    telemetry: new BoxGeometry(0.035, 0.34, 0.025),
    ring: new TorusGeometry(0.31, 0.025, 5, 20),
    ringNode: new IcosahedronGeometry(0.055, 1),
    ghostBody: new CapsuleGeometry(0.15, 0.46, 3, 6),
    ghostHead: new IcosahedronGeometry(0.15, 0),
    mirrorPane: new BoxGeometry(1.15, 2.1, 0.04),
    shard: new BoxGeometry(0.2, 0.28, 0.03),
    chartPanel: new BoxGeometry(2.1, 1.4, 0.04),
    chartBar: new BoxGeometry(0.28, 1, 0.06),
  };
}

export type EchoResources = ReturnType<typeof createEchoResources>;

export function disposeEchoResources(resources: EchoResources): void {
  for (const geometry of Object.values(resources) as BufferGeometry[]) {
    geometry.dispose();
  }
}
