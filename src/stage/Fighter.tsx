'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  Color,
  Group,
  MeshBasicMaterial,
  MeshToonMaterial,
  type ColorRepresentation,
} from 'three';
import { createCelGradient } from '@/src/render/celGradient';
import { createOutlineMaterial } from '@/src/render/outlineMaterial';
import { FighterPart } from './FighterPart';
import { createFighterResources, disposeFighterResources } from './fighterResources';

type FighterProps = {
  accent: ColorRepresentation;
  color: ColorRepresentation;
  position: [number, number, number];
  facing: 1 | -1;
};

export function Fighter({ accent, color, facing, position }: FighterProps) {
  const groupRef = useRef<Group>(null);
  const resources = useMemo(createFighterResources, []);
  const gradient = useMemo(createCelGradient, []);
  const outline = useMemo(createOutlineMaterial, []);
  const toon = useMemo(
    () => new MeshToonMaterial({
      color,
      emissive: new Color(accent),
      emissiveIntensity: 0.08,
      gradientMap: gradient,
    }),
    [accent, color, gradient],
  );
  const accentMaterial = useMemo(
    () => new MeshBasicMaterial({ color: accent, toneMapped: false }),
    [accent],
  );

  useEffect(() => () => {
    disposeFighterResources(resources);
    gradient.dispose();
    outline.dispose();
    toon.dispose();
    accentMaterial.dispose();
  }, [accentMaterial, gradient, outline, resources, toon]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const time = clock.elapsedTime;
    groupRef.current.position.y = Math.sin(time * 2.1 + facing) * 0.018;
    groupRef.current.rotation.z = Math.sin(time * 1.3 + facing) * 0.012;
  });

  return (
    <group ref={groupRef} position={position} rotation-y={facing * -0.16}>
      <FighterPart geometry={resources.body} toonMaterial={toon} outlineMaterial={outline} position={[0, 1.35, 0]} />
      <FighterPart geometry={resources.head} toonMaterial={toon} outlineMaterial={outline} position={[0, 2.36, 0]} />
      <FighterPart geometry={resources.hair} toonMaterial={toon} outlineMaterial={outline} position={[-0.12, 2.83, -0.02]} rotation={[0.12, 0, -0.25]} />
      <FighterPart geometry={resources.hair} toonMaterial={toon} outlineMaterial={outline} position={[0.18, 2.82, -0.03]} rotation={[-0.1, 0, 0.32]} />
      <FighterPart geometry={resources.arm} toonMaterial={toon} outlineMaterial={outline} position={[-0.52, 1.45, 0]} rotation={[0, 0, 0.42]} />
      <FighterPart geometry={resources.arm} toonMaterial={toon} outlineMaterial={outline} position={[0.52, 1.45, 0]} rotation={[0, 0, -0.42]} />
      <FighterPart geometry={resources.leg} toonMaterial={toon} outlineMaterial={outline} position={[-0.22, 0.42, 0]} rotation={[0, 0, 0.08]} />
      <FighterPart geometry={resources.leg} toonMaterial={toon} outlineMaterial={outline} position={[0.22, 0.42, 0]} rotation={[0, 0, -0.08]} />
      <mesh geometry={resources.belt} material={accentMaterial} position={[0, 1.04, 0]} rotation-x={Math.PI / 2} />
      <mesh geometry={resources.fist} material={accentMaterial} position={[-0.72, 1.15, 0.03]} />
      <mesh geometry={resources.fist} material={accentMaterial} position={[0.72, 1.15, 0.03]} />
    </group>
  );
}
