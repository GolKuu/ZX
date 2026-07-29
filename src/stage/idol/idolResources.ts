import { Shape, ShapeGeometry } from 'three';

export interface IdolResources {
  readonly star: ShapeGeometry;
}

export function createIdolResources(): IdolResources {
  const shape = new Shape();
  const points = 10;
  for (let index = 0; index < points; index += 1) {
    const radius = index % 2 === 0 ? 1 : 0.45;
    const angle = Math.PI / 2 + index * Math.PI / 5;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return { star: new ShapeGeometry(shape) };
}

export function disposeIdolResources(resources: IdolResources): void {
  resources.star.dispose();
}
