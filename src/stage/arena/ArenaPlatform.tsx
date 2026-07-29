'use client';

import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  MeshBasicMaterial,
  type Material,
} from 'three';
import {
  createArenaFloorMaterial,
  type ArenaFloorMaterial,
} from '@/src/render/arenaFloorMaterial';
import { ARENA_RADIUS, buildDebris } from './arenaData';

interface ArenaPlatformProps {
  readonly stoneMaterial: Material;
}

export function ArenaPlatform({ stoneMaterial }: ArenaPlatformProps) {
  const pillars = useMemo(() => buildDebris(9, 777), []);
  const floorMaterial: ArenaFloorMaterial = useMemo(
    () =>
      createArenaFloorMaterial({
        base: '#1d1530',
        edge: '#d78cff',
        line: '#7b46c8',
        radius: ARENA_RADIUS,
        reflection: '#8c46e0',
      }),
    [],
  );
  const edgeMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: new Color('#c067ff'),
        toneMapped: false,
        transparent: true,
        opacity: 0.62,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide,
      }),
    [],
  );

  useFrame(({ clock }) => {
    floorMaterial.arena.uTime.value = clock.elapsedTime;
  });

  useEffect(() => {
    return () => {
      floorMaterial.dispose();
      edgeMaterial.dispose();
    };
  }, [edgeMaterial, floorMaterial]);

  return (
    <group>
      {/* Segment count is up from 96 so the specular pool the key light lays
          across the disc has a smooth terminator rather than a faceted one. */}
      <mesh
        material={floorMaterial}
        position={[0, 0.002, 0]}
        receiveShadow
        rotation-x={-Math.PI / 2}
      >
        <circleGeometry args={[ARENA_RADIUS, 160]} />
      </mesh>
      <mesh castShadow material={stoneMaterial} position={[0, -0.42, 0]} receiveShadow>
        <cylinderGeometry args={[ARENA_RADIUS, ARENA_RADIUS * 0.82, 0.84, 96, 1]} />
      </mesh>
      <mesh material={edgeMaterial} position={[0, 0.02, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[ARENA_RADIUS - 0.09, ARENA_RADIUS + 0.02, 96]} />
      </mesh>

      {pillars.map((item, index) => (
        <mesh
          key={`pillar-${String(index)}`}
          castShadow
          material={stoneMaterial}
          position={[item.position[0], -0.8 + item.scale[1] * 2.4, item.position[2]]}
          receiveShadow
          rotation={[item.rotation[0] * 0.06, item.rotation[1], item.rotation[2] * 0.06]}
        >
          <boxGeometry args={[item.scale[0] * 1.6, item.scale[1] * 5.5, item.scale[2] * 1.6]} />
        </mesh>
      ))}
    </group>
  );
}
