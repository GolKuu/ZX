import {
  BoxGeometry,
  CapsuleGeometry,
  ConeGeometry,
  CylinderGeometry,
  SphereGeometry,
  TorusGeometry,
} from 'three';

export function createZoroResources() {
  return {
    arm: new CapsuleGeometry(0.12, 0.54, 4, 8),
    blade: new BoxGeometry(0.065, 1.36, 0.025),
    body: new CapsuleGeometry(0.4, 0.74, 6, 12),
    chest: new SphereGeometry(0.37, 14, 10),
    earring: new TorusGeometry(0.035, 0.012, 4, 8),
    guard: new TorusGeometry(0.14, 0.035, 5, 12),
    hair: new ConeGeometry(0.13, 0.42, 5),
    hand: new SphereGeometry(0.145, 10, 8),
    handle: new CylinderGeometry(0.055, 0.055, 0.44, 8),
    head: new SphereGeometry(0.32, 16, 12),
    leg: new CapsuleGeometry(0.15, 0.62, 4, 8),
    robe: new ConeGeometry(0.5, 1.08, 10),
    sash: new TorusGeometry(0.39, 0.09, 6, 20),
    scabbard: new BoxGeometry(0.09, 1.42, 0.075),
    slash: new TorusGeometry(0.78, 0.045, 6, 32, Math.PI * 1.35),
    projectile: new TorusGeometry(0.58, 0.065, 6, 28, Math.PI),
  };
}

export type ZoroResources = ReturnType<typeof createZoroResources>;

export function disposeZoroResources(resources: ZoroResources): void {
  Object.values(resources).forEach((geometry) => geometry.dispose());
}
