import {
  CapsuleGeometry,
  ConeGeometry,
  SphereGeometry,
  TorusGeometry,
} from 'three';

export function createFighterResources() {
  return {
    arm: new CapsuleGeometry(0.13, 0.58, 4, 8),
    belt: new TorusGeometry(0.38, 0.055, 6, 18),
    body: new CapsuleGeometry(0.4, 0.9, 6, 12),
    fist: new SphereGeometry(0.18, 10, 8),
    hair: new ConeGeometry(0.25, 0.7, 5),
    head: new SphereGeometry(0.34, 16, 12),
    leg: new CapsuleGeometry(0.16, 0.68, 4, 8),
  };
}

export type FighterResources = ReturnType<typeof createFighterResources>;

export function disposeFighterResources(resources: FighterResources) {
  Object.values(resources).forEach((geometry) => geometry.dispose());
}
