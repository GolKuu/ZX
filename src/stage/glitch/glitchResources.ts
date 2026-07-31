import {
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  IcosahedronGeometry,
  OctahedronGeometry,
  SphereGeometry,
  TorusGeometry,
} from 'three';

export function createGlitchResources() {
  return {
    headHalf: new BoxGeometry(0.16, 0.3, 0.28),
    visor: new BoxGeometry(0.15, 0.035, 0.025),
    torsoHalf: new BoxGeometry(0.29, 0.64, 0.34),
    hipHalf: new BoxGeometry(0.23, 0.25, 0.3),
    upperArm: new CapsuleGeometry(0.075, 0.32, 4, 8),
    forearm: new CapsuleGeometry(0.065, 0.27, 4, 8),
    hand: new BoxGeometry(0.13, 0.14, 0.13),
    thigh: new CapsuleGeometry(0.105, 0.42, 4, 8),
    shin: new CapsuleGeometry(0.085, 0.38, 4, 8),
    foot: new BoxGeometry(0.19, 0.11, 0.34),
    pixel: new BoxGeometry(0.1, 0.1, 0.1),
    needle: new BoxGeometry(0.38, 0.035, 0.035),
    packet: new IcosahedronGeometry(0.18, 0),
    slash: new TorusGeometry(0.62, 0.035, 5, 28, Math.PI * 1.3),
    zone: new TorusGeometry(0.85, 0.05, 5, 34),
    armourPlate: new BoxGeometry(0.22, 0.42, 0.055),
    chestCore: new OctahedronGeometry(0.22, 1),
    shoulderShell: new SphereGeometry(0.18, 12, 8, 0, Math.PI),
    collar: new TorusGeometry(0.29, 0.025, 8, 24, Math.PI),
    shard: new OctahedronGeometry(0.075, 0),
  };
}

export type GlitchResources = ReturnType<typeof createGlitchResources>;

export function disposeGlitchResources(resources: GlitchResources): void {
  for (const geometry of Object.values(resources) as BufferGeometry[]) {
    geometry.dispose();
  }
}
