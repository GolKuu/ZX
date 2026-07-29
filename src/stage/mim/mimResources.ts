import {
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  CylinderGeometry,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  TorusGeometry,
} from 'three';

export function createMimResources() {
  return {
    head: new SphereGeometry(0.23, 24, 18),
    torso: new CapsuleGeometry(0.3, 0.55, 6, 18),
    hood: new TorusGeometry(0.3, 0.09, 8, 22),
    pouch: new BoxGeometry(0.32, 0.18, 0.08),
    drawstring: new CylinderGeometry(0.012, 0.012, 0.28, 8),
    knot: new SphereGeometry(0.12, 14, 10),
    scarfTail: new CapsuleGeometry(0.075, 0.72, 4, 12),
    arm: new CapsuleGeometry(0.105, 0.5, 5, 12),
    hand: new SphereGeometry(0.12, 14, 10),
    leg: new CapsuleGeometry(0.13, 0.58, 5, 12),
    shoe: new BoxGeometry(0.3, 0.2, 0.52),
    sole: new BoxGeometry(0.31, 0.07, 0.55),
    eye: new CapsuleGeometry(0.025, 0.07, 3, 8),
    cursor: cursorGeometry(),
    banana: new TorusGeometry(0.24, 0.055, 8, 20, Math.PI * 1.15),
    bananaTip: new CylinderGeometry(0.025, 0.035, 0.1, 8),
    chairSeat: new BoxGeometry(0.5, 0.14, 0.5),
    chairBack: new BoxGeometry(0.5, 0.58, 0.14),
    chairPost: new CylinderGeometry(0.045, 0.06, 0.42, 10),
    snapRing: new TorusGeometry(0.16, 0.022, 6, 24),
  };
}

export type MimResources = ReturnType<typeof createMimResources>;

export function disposeMimResources(resources: MimResources): void {
  for (const geometry of Object.values(resources) as BufferGeometry[]) {
    geometry.dispose();
  }
}

function cursorGeometry(): ShapeGeometry {
  const shape = new Shape();
  shape.moveTo(0, 0.7);
  shape.lineTo(0, 0);
  shape.lineTo(0.5, 0.48);
  shape.lineTo(0.28, 0.49);
  shape.lineTo(0.43, 0.78);
  shape.lineTo(0.3, 0.84);
  shape.lineTo(0.16, 0.55);
  shape.closePath();
  return new ShapeGeometry(shape);
}
