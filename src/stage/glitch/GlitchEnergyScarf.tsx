import { useEffect, useMemo, type RefObject } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Group,
} from 'three';

/**
 * A smooth procedural energy textile: broad dark body, cyan edge and white
 * phase filament. The layers stay behind the anatomy and avoid retro pixels.
 */
export function GlitchEnergyScarf({
  root,
}: {
  readonly root: RefObject<Group | null>;
}) {
  const body = useMemo(() => ribbonGeometry(0.13, 0), []);
  const edge = useMemo(() => ribbonGeometry(0.026, 0.058), []);
  const core = useMemo(() => ribbonGeometry(0.012, -0.045), []);

  useEffect(() => () => {
    body.dispose();
    edge.dispose();
    core.dispose();
  }, [body, core, edge]);

  return (
    <group ref={root} position={[0.02, 0, -0.16]} rotation-z={0.05}>
      <mesh geometry={body} renderOrder={1}>
        <meshStandardMaterial
          color="#1d2022"
          emissive="#3b2b21"
          emissiveIntensity={1.4}
          metalness={0.28}
          opacity={0.88}
          roughness={0.34}
          side={DoubleSide}
          transparent
        />
      </mesh>
      <mesh geometry={edge} position-z={0.012} renderOrder={2}>
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#ff9d28"
          depthWrite={false}
          opacity={0.78}
          side={DoubleSide}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh geometry={core} position-z={0.018} renderOrder={3}>
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#d9ffff"
          depthWrite={false}
          opacity={0.72}
          side={DoubleSide}
          toneMapped={false}
          transparent
        />
      </mesh>
    </group>
  );
}

function ribbonGeometry(width: number, verticalOffset: number): BufferGeometry {
  const points = [
    [0.06, 1.82],
    [-0.22, 1.81],
    [-0.5, 1.75],
    [-0.78, 1.66],
    [-1.04, 1.54],
    [-1.27, 1.37],
    [-1.46, 1.15],
  ] as const;
  const vertices: number[] = [];
  const indices: number[] = [];
  points.forEach(([x, y], index) => {
    const taper = 1 - index / (points.length * 1.08);
    const half = width * taper;
    vertices.push(x, y + verticalOffset + half, 0);
    vertices.push(x, y + verticalOffset - half, 0);
    if (index === points.length - 1) return;
    const start = index * 2;
    indices.push(start, start + 1, start + 2, start + 1, start + 3, start + 2);
  });
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
