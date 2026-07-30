'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
  Color,
  InstancedMesh,
  MeshBasicMaterial,
  Object3D,
  Shape,
  ShapeGeometry,
  type Material,
} from 'three';

interface RuinedMegacityProps {
  readonly ruinMaterial: Material;
}

const TOWERS = [
  [-7.5, 1.5, 5.8, 0.45],
  [-5.7, 1.2, 3.7, 0.7],
  [-4.2, 1.6, 7.1, 0.32],
  [-2.1, 1.3, 4.6, 0.62],
  [-0.4, 1.6, 6.2, 0.28],
  [1.6, 1.4, 4.1, 0.74],
  [3.4, 1.7, 7.5, 0.4],
  [5.6, 1.25, 5.2, 0.66],
  [7.2, 1.55, 6.7, 0.25],
] as const;

const WINDOWS = [
  [-6.9, 2.2], [-6.4, 4.1], [-4.8, 3.3], [-3.7, 5.1],
  [-2.5, 2.4], [-0.9, 4.4], [0.1, 2.8], [2.2, 3.0],
  [3.2, 5.4], [4.0, 3.8], [5.8, 2.5], [6.8, 4.7],
] as const;

const MONOLITHS = [
  [-10.2, 3.3, 2.2, 0.8, 6.6, 0.9],
  [-8.7, 5.2, 0.8, 0.52, 4.8, 0.62],
  [-6.5, 4.7, 2.7, 0.72, 7.4, 0.82],
  [-3.5, 5.9, 1.3, 0.58, 5.2, 0.7],
  [-1.7, 4.9, 3.2, 0.86, 8.1, 0.9],
  [1.2, 5.4, 1.9, 0.66, 6.4, 0.74],
  [3.1, 4.5, 3.6, 0.9, 7.8, 1.05],
  [5.2, 5.7, 1.2, 0.58, 5.9, 0.68],
  [7.4, 4.8, 2.9, 0.82, 7.2, 0.9],
  [9.6, 3.6, 1.5, 0.64, 5.8, 0.75],
] as const;

function makeSkyline() {
  const shapes = TOWERS.map(([x, width, height, damage]) => {
    const tower = new Shape();
    tower.moveTo(x, 0);
    tower.lineTo(x, height * (1 - damage * 0.25));
    tower.lineTo(x + width * 0.24, height * (1 - damage));
    tower.lineTo(x + width * 0.48, height * (1 - damage * 0.48));
    tower.lineTo(x + width * 0.72, height * (1 - damage * 0.86));
    tower.lineTo(x + width, height * (1 - damage * 0.18));
    tower.lineTo(x + width, 0);
    tower.closePath();
    return tower;
  });
  return new ShapeGeometry(shapes, 1);
}

export function RuinedMegacity({ ruinMaterial }: RuinedMegacityProps) {
  const windowRef = useRef<InstancedMesh>(null);
  const skylineGeometry = useMemo(() => makeSkyline(), []);
  const cityMaterial = useMemo(
    () => new MeshBasicMaterial({ color: new Color('#151122'), fog: false }),
    [],
  );

  useEffect(() => {
    const windows = windowRef.current;
    if (windows !== null) {
      const transform = new Object3D();
      WINDOWS.forEach(([x, y], index) => {
        transform.position.set(x, y, 0);
        transform.scale.set(index % 3 === 0 ? 0.34 : 0.2, 0.06, 1);
        transform.updateMatrix();
        windows.setMatrixAt(index, transform.matrix);
      });
      windows.instanceMatrix.needsUpdate = true;
    }

    return () => {
      skylineGeometry.dispose();
      cityMaterial.dispose();
    };
  }, [cityMaterial, skylineGeometry]);

  return (
    <group position={[0, -1.15, -13]} renderOrder={-3}>
      <mesh geometry={skylineGeometry} material={cityMaterial} />
      <mesh geometry={skylineGeometry} material={cityMaterial} position={[0.8, 0.2, -2.6]} scale={1.18} />

      <instancedMesh ref={windowRef} args={[undefined, undefined, WINDOWS.length]} position-z={0.04}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#d26cff" toneMapped={false} fog={false} />
      </instancedMesh>

      {MONOLITHS.map(([x, y, z, width, height, depth], index) => (
        <group
          key={`${x}-${z}`}
          position={[x, y, z]}
          rotation={[0.02 * (index % 3), 0.08 * (index % 2), 0.025 * ((index % 4) - 2)]}
        >
          <mesh material={ruinMaterial}>
            <boxGeometry args={[width, height, depth]} />
          </mesh>
          <mesh position={[0, height * 0.05, depth * 0.51]}>
            <planeGeometry args={[0.055, height * (0.38 + (index % 3) * 0.08)]} />
            <meshBasicMaterial
              color={index % 3 === 0 ? '#8b52ff' : '#386fc4'}
              depthWrite={false}
              opacity={0.78}
              toneMapped={false}
              transparent
            />
          </mesh>
        </group>
      ))}

      <group position={[0, 0.4, 3]}>
        <mesh material={ruinMaterial} position={[-8.2, 3.1, 0]} rotation={[0.08, 0, -0.15]}>
          <boxGeometry args={[1.4, 6.2, 1.3]} />
        </mesh>
        <mesh material={ruinMaterial} position={[8.5, 2.5, -0.4]} rotation={[-0.06, 0, 0.18]}>
          <boxGeometry args={[1.8, 5.1, 1.6]} />
        </mesh>
        <mesh material={ruinMaterial} position={[-6.7, 6.4, -0.3]} rotation={[0.4, 0.2, 0.2]}>
          <boxGeometry args={[1.3, 0.55, 1.1]} />
        </mesh>
        <mesh material={ruinMaterial} position={[6.9, 6.0, -0.8]} rotation={[0.25, -0.3, -0.2]}>
          <boxGeometry args={[1.1, 0.7, 1.5]} />
        </mesh>
      </group>
    </group>
  );
}
