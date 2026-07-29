'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  Group,
  MeshBasicMaterial,
  Shape,
  ShapeGeometry,
} from 'three';

function makeRift(width: number) {
  const shape = new Shape();
  const left = [-0.08, -0.46, -0.2, -0.64, -0.3, -0.78, -0.22];
  const right = [0.12, 0.5, 0.24, 0.72, 0.32, 0.62, 0.2];
  const step = 10 / (left.length - 1);
  shape.moveTo(left[0] * width, -5);
  left.slice(1).forEach((x, index) => shape.lineTo(x * width, -5 + step * (index + 1)));
  [...right].reverse().forEach((x, index) => shape.lineTo(x * width, 5 - step * index));
  shape.closePath();
  return new ShapeGeometry(shape, 1);
}

export function VoidRift() {
  const groupRef = useRef<Group>(null);
  const outerGeometry = useMemo(() => makeRift(4.8), []);
  const middleGeometry = useMemo(() => makeRift(2.8), []);
  const coreGeometry = useMemo(() => makeRift(0.9), []);
  const outerMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: new Color('#6e21d2'),
        blending: AdditiveBlending,
        depthWrite: false,
        fog: false,
        opacity: 0.44,
        side: DoubleSide,
        transparent: true,
        toneMapped: false,
      }),
    [],
  );

  useEffect(
    () => () => {
      outerGeometry.dispose();
      middleGeometry.dispose();
      coreGeometry.dispose();
      outerMaterial.dispose();
    },
    [coreGeometry, middleGeometry, outerGeometry, outerMaterial],
  );

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (group === null) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 1.7) * 0.025;
    group.scale.set(pulse, 1 + Math.cos(clock.elapsedTime * 1.2) * 0.012, 1);
    group.rotation.z = Math.sin(clock.elapsedTime * 0.28) * 0.015;
  });

  return (
    <group ref={groupRef} position={[0, 4.7, -15.5]} renderOrder={-7}>
      <mesh geometry={outerGeometry} material={outerMaterial} scale={1.18} />
      <mesh geometry={middleGeometry}>
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#b53dff"
          depthWrite={false}
          fog={false}
          opacity={0.72}
          side={DoubleSide}
          toneMapped={false}
          transparent
        />
      </mesh>
      <mesh geometry={coreGeometry} position-z={0.02}>
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#f7d7ff"
          depthWrite={false}
          fog={false}
          opacity={0.92}
          side={DoubleSide}
          toneMapped={false}
          transparent
        />
      </mesh>
    </group>
  );
}
