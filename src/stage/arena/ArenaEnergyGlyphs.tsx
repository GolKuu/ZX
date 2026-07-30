'use client';

import { useEffect, useMemo, useRef } from 'react';
import { AdditiveBlending, InstancedMesh, Object3D } from 'three';

interface EnergySegment {
  readonly angle: number;
  readonly length: number;
  readonly radius: number;
  readonly tangent: boolean;
}

function buildRunes(): EnergySegment[] {
  return Array.from({ length: 14 }, (_, index) => {
    const angle = (index / 14) * Math.PI * 2;
    return [
      { angle, length: 0.42, radius: 3.72, tangent: true },
      { angle: angle - 0.055, length: 0.28, radius: 3.54, tangent: false },
      { angle: angle + 0.055, length: 0.28, radius: 3.54, tangent: false },
    ];
  }).flat();
}

function buildCracks(): EnergySegment[] {
  const branches = [0.18, 0.92, 1.7, 2.46, 3.12, 3.88, 4.7, 5.52];
  return branches.flatMap((angle, branchIndex) =>
    Array.from({ length: 4 }, (_, segmentIndex) => ({
      angle: angle + Math.sin(branchIndex * 3 + segmentIndex) * 0.09,
      length: 0.5 + (segmentIndex % 2) * 0.18,
      radius: 0.95 + segmentIndex * 0.58,
      tangent: false,
    })),
  );
}

function setSegments(mesh: InstancedMesh, segments: EnergySegment[]) {
  const transform = new Object3D();
  segments.forEach((segment, index) => {
    transform.position.set(
      Math.cos(segment.angle) * segment.radius,
      0.035,
      Math.sin(segment.angle) * segment.radius,
    );
    transform.rotation.set(0, -segment.angle + (segment.tangent ? 0 : Math.PI / 2), 0);
    transform.scale.set(segment.length, 1, 1);
    transform.updateMatrix();
    mesh.setMatrixAt(index, transform.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
}

export function ArenaEnergyGlyphs() {
  const runeRef = useRef<InstancedMesh>(null);
  const crackRef = useRef<InstancedMesh>(null);
  const runes = useMemo(() => buildRunes(), []);
  const cracks = useMemo(() => buildCracks(), []);

  useEffect(() => {
    if (runeRef.current !== null) setSegments(runeRef.current, runes);
    if (crackRef.current !== null) setSegments(crackRef.current, cracks);
  }, [cracks, runes]);

  return (
    <group>
      <instancedMesh ref={runeRef} args={[undefined, undefined, runes.length]}>
        <boxGeometry args={[1, 0.018, 0.045]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#726cff"
          depthWrite={false}
          opacity={0.55}
          toneMapped={false}
          transparent
        />
      </instancedMesh>
      <instancedMesh ref={crackRef} args={[undefined, undefined, cracks.length]}>
        <boxGeometry args={[1, 0.016, 0.025]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#3e74ba"
          depthWrite={false}
          opacity={0.38}
          toneMapped={false}
          transparent
        />
      </instancedMesh>
    </group>
  );
}
