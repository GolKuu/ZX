'use client';

import { useEffect, useMemo } from 'react';
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  MeshBasicMaterial,
  ShaderMaterial,
  type Material,
} from 'three';
import { ARENA_RADIUS, buildDebris } from './arenaData';
import { floorFragment, floorVertex } from './arenaShaders';

interface ArenaPlatformProps {
  readonly stoneMaterial: Material;
}

export function ArenaPlatform({ stoneMaterial }: ArenaPlatformProps) {
  const pillars = useMemo(() => buildDebris(9, 777), []);
  const floorMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uBase: { value: new Color('#141021') },
          uLine: { value: new Color('#6f3eb3') },
          uEdge: { value: new Color('#d78cff') },
          uRadius: { value: ARENA_RADIUS },
        },
        vertexShader: floorVertex,
        fragmentShader: floorFragment,
        toneMapped: false,
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

  useEffect(() => {
    return () => {
      floorMaterial.dispose();
      edgeMaterial.dispose();
    };
  }, [edgeMaterial, floorMaterial]);

  return (
    <group>
      <mesh material={floorMaterial} rotation-x={-Math.PI / 2} position={[0, 0.002, 0]}>
        <circleGeometry args={[ARENA_RADIUS, 96]} />
      </mesh>
      <mesh material={stoneMaterial} position={[0, -0.42, 0]}>
        <cylinderGeometry args={[ARENA_RADIUS, ARENA_RADIUS * 0.82, 0.84, 96, 1]} />
      </mesh>
      <mesh material={edgeMaterial} position={[0, 0.02, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[ARENA_RADIUS - 0.09, ARENA_RADIUS + 0.02, 96]} />
      </mesh>

      {pillars.map((item, index) => (
        <mesh
          key={`pillar-${String(index)}`}
          material={stoneMaterial}
          position={[item.position[0], -0.8 + item.scale[1] * 2.4, item.position[2]]}
          rotation={[item.rotation[0] * 0.06, item.rotation[1], item.rotation[2] * 0.06]}
        >
          <boxGeometry args={[item.scale[0] * 1.6, item.scale[1] * 5.5, item.scale[2] * 1.6]} />
        </mesh>
      ))}
    </group>
  );
}
