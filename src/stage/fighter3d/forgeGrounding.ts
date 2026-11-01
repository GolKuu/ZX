import { Matrix4, Mesh, Vector3 } from 'three';
import type { Group } from 'three';
import type { FighterJoints } from './FighterSkeleton';
import { ARENA_FLOOR_Y } from '../arena/arenaData';

interface Sole { shin: Group; points: Float32Array }
const soles = new WeakMap<FighterJoints, readonly Sole[]>();
const transform = new Matrix4();
const inverse = new Matrix4();
const point = new Vector3();

/** Cache actual boot vertices in their shin frame; geometry never changes with poses. */
function captureSoles(rig: FighterJoints): readonly Sole[] {
  return [rig.leftShin, rig.rightShin].map(shin => {
    const points: number[] = [];
    inverse.copy(shin.matrixWorld).invert();
    shin.traverse(node => {
      if (!(node instanceof Mesh)) return;
      const positions = node.geometry.getAttribute('position');
      transform.multiplyMatrices(inverse, node.matrixWorld);
      for (let i = 0; i < positions.count; i++) {
        point.fromBufferAttribute(positions, i).applyMatrix4(transform);
        points.push(point.x, point.y, point.z);
      }
    });
    return { shin, points: new Float32Array(points) };
  });
}

/** Keep grounded captured/fallback poses on the visible floor without moving simulation roots. */
export function groundForgePose(rig: FighterJoints, allowLower = true): void {
  rig.root.updateWorldMatrix(true, true);
  let samples = soles.get(rig);
  if (!samples) { samples = captureSoles(rig); soles.set(rig, samples); }
  let lowest = Infinity;
  for (const {shin, points} of samples) {
    const m = shin.matrixWorld.elements;
    for (let i = 0; i < points.length; i += 3) {
      lowest = Math.min(lowest, m[1]! * points[i]! + m[5]! * points[i + 1]!
        + m[9]! * points[i + 2]! + m[13]!);
    }
  }
  const parentUp = rig.root.parent?.matrixWorld.elements[5] ?? 1;
  if (Number.isFinite(lowest) && Math.abs(parentUp) > .01) {
    const correction = (ARENA_FLOOR_Y - lowest) / parentUp;
    // Airborne poses keep their jump height, but cannot penetrate the floor on
    // the first launch/hitstop frame while the simulation root is still at zero.
    if (allowLower || correction > 0) rig.root.position.y += correction;
  }
}
