'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  DoubleSide,
  Group,
  MeshBasicMaterial,
  PerspectiveCamera,
  type ColorRepresentation,
} from 'three';
import { createCelGradient } from '@/src/render/celGradient';
import {
  createOutlineMaterial,
  updateOutlineProjection,
} from '@/src/render/outlineMaterial';
import {
  createToonMaterial,
  decayFlash,
  updateRimAxis,
  type ToonMaterial,
} from '@/src/render/toonMaterial';
import { FighterPart } from './FighterPart';
import {
  createFighterResources,
  disposeFighterResources,
} from './fighterResources';

type FighterProps = {
  accent: ColorRepresentation;
  color: ColorRepresentation;
  position: [number, number, number];
  facing: 1 | -1;
  /** World position of the other fighter — drives the rim gate. */
  opponent?: readonly [number, number, number];
};

/** Skin sits warmer and lighter than cloth so the face reads first. */
const SKIN_COLOR = '#e8cbb4';
const SKIN_SHADOW = '#a5657a';
const CLOTH_SHADOW = '#3f5590';

/** Head radius; the whole rig is laid out against it. */
const H = 0.125;

export function Fighter({
  accent,
  color,
  facing,
  position,
  opponent,
}: FighterProps) {
  const groupRef = useRef<Group>(null);
  const resources = useMemo(() => createFighterResources(), []);
  const gradient = useMemo(() => createCelGradient(), []);
  const outline = useMemo(() => createOutlineMaterial({ pixelWidth: 2.4 }), []);
  const outlineThin = useMemo(
    () => createOutlineMaterial({ pixelWidth: 1.1 }),
    [],
  );

  const cloth = useMemo(
    () =>
      createToonMaterial({
        color,
        gradientMap: gradient,
        shadowTint: CLOTH_SHADOW,
        rimColor: accent,
      }),
    [accent, color, gradient],
  );
  const skin = useMemo(
    () =>
      createToonMaterial({
        color: SKIN_COLOR,
        gradientMap: gradient,
        shadowTint: SKIN_SHADOW,
        shadowStrength: 0.65,
        rimColor: accent,
        rimStrength: 0.7,
      }),
    [accent, gradient],
  );
  const coatMaterial = useMemo(() => {
    const material = createToonMaterial({
      color,
      gradientMap: gradient,
      shadowTint: CLOTH_SHADOW,
      rimColor: accent,
    });
    material.side = DoubleSide;
    return material;
  }, [accent, color, gradient]);

  const accentMaterial = useMemo(
    () => new MeshBasicMaterial({ color: accent, toneMapped: false }),
    [accent],
  );

  const viewportHeight = useThree((state) => state.size.height);
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    const fov = camera instanceof PerspectiveCamera ? camera.fov : 45;
    updateOutlineProjection(outline, viewportHeight, fov);
    updateOutlineProjection(outlineThin, viewportHeight, fov);
  }, [camera, outline, outlineThin, viewportHeight]);

  useEffect(
    () => () => {
      disposeFighterResources(resources);
      gradient.dispose();
      outline.dispose();
      outlineThin.dispose();
      cloth.dispose();
      skin.dispose();
      coatMaterial.dispose();
      accentMaterial.dispose();
    },
    [
      accentMaterial,
      cloth,
      coatMaterial,
      gradient,
      outline,
      outlineThin,
      resources,
      skin,
    ],
  );

  useFrame(({ clock, camera: activeCamera }, delta) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    const time = clock.elapsedTime;
    group.position.y = position[1] + Math.sin(time * 2.1 + facing) * 0.014;
    group.rotation.z = Math.sin(time * 1.3 + facing) * 0.009;

    const target = opponent ?? [position[0] + facing, 0, position[2]];
    const self = { x: position[0], z: position[2] };
    const other = { x: target[0] ?? 0, z: target[2] ?? 0 };
    const deltaFrames = delta * 60;
    const materials: readonly ToonMaterial[] = [cloth, skin, coatMaterial];
    for (const material of materials) {
      updateRimAxis(material, self, other, activeCamera.matrixWorldInverse);
      decayFlash(material, deltaFrames);
    }
  });

  return (
    <group ref={groupRef} position={position} rotation-y={facing * -0.18}>
      {/* legs */}
      <FighterPart geometry={resources.foot} toonMaterial={cloth} outlineMaterial={outlineThin} position={[-H * 0.7, H * 0.2, H * 0.3]} />
      <FighterPart geometry={resources.foot} toonMaterial={cloth} outlineMaterial={outlineThin} position={[H * 0.7, H * 0.2, H * 0.3]} />
      <FighterPart geometry={resources.shin} toonMaterial={cloth} outlineMaterial={outline} position={[-H * 0.7, H * 1.7, 0]} />
      <FighterPart geometry={resources.shin} toonMaterial={cloth} outlineMaterial={outline} position={[H * 0.7, H * 1.7, 0]} />
      <FighterPart geometry={resources.thigh} toonMaterial={cloth} outlineMaterial={outline} position={[-H * 0.72, H * 4.0, 0]} />
      <FighterPart geometry={resources.thigh} toonMaterial={cloth} outlineMaterial={outline} position={[H * 0.72, H * 4.0, 0]} />

      {/* hips, coat, belt */}
      <FighterPart geometry={resources.hips} toonMaterial={cloth} outlineMaterial={outline} position={[0, H * 5.6, 0]} />
      <mesh geometry={resources.coat} material={coatMaterial} position={[0, H * 5.1, 0]} renderOrder={1} />
      <mesh geometry={resources.belt} material={accentMaterial} position={[0, H * 6.1, 0]} />

      {/* torso */}
      <FighterPart geometry={resources.waist} toonMaterial={cloth} outlineMaterial={outline} position={[0, H * 6.6, 0]} />
      <FighterPart geometry={resources.chest} toonMaterial={cloth} outlineMaterial={outline} position={[0, H * 8.1, 0]} />
      <mesh geometry={resources.collar} material={coatMaterial} position={[0, H * 9.5, 0]} renderOrder={1} />

      {/* arms */}
      <FighterPart geometry={resources.shoulder} toonMaterial={cloth} outlineMaterial={outline} position={[-H * 1.62, H * 9.0, 0]} />
      <FighterPart geometry={resources.shoulder} toonMaterial={cloth} outlineMaterial={outline} position={[H * 1.62, H * 9.0, 0]} />
      <FighterPart geometry={resources.upperArm} toonMaterial={cloth} outlineMaterial={outline} position={[-H * 1.82, H * 7.7, 0]} rotation={[0, 0, 0.16]} />
      <FighterPart geometry={resources.upperArm} toonMaterial={cloth} outlineMaterial={outline} position={[H * 1.82, H * 7.7, 0]} rotation={[0, 0, -0.16]} />
      <FighterPart geometry={resources.forearm} toonMaterial={skin} outlineMaterial={outline} position={[-H * 2.05, H * 6.1, H * 0.15]} rotation={[0.2, 0, 0.1]} />
      <FighterPart geometry={resources.forearm} toonMaterial={skin} outlineMaterial={outline} position={[H * 2.05, H * 6.1, H * 0.15]} rotation={[0.2, 0, -0.1]} />
      <FighterPart geometry={resources.hand} toonMaterial={skin} outlineMaterial={outlineThin} position={[-H * 2.15, H * 5.0, H * 0.3]} />
      <FighterPart geometry={resources.hand} toonMaterial={skin} outlineMaterial={outlineThin} position={[H * 2.15, H * 5.0, H * 0.3]} />

      {/* head */}
      <FighterPart geometry={resources.neck} toonMaterial={skin} outlineMaterial={outlineThin} position={[0, H * 9.7, 0]} />
      <FighterPart geometry={resources.head} toonMaterial={skin} outlineMaterial={outline} position={[0, H * 10.5, 0]} />
      <FighterPart geometry={resources.hairBack} toonMaterial={cloth} outlineMaterial={outline} position={[0, H * 10.7, -H * 0.14]} scale={[1, 0.94, 1]} />
      <FighterPart geometry={resources.hairSpike} toonMaterial={cloth} outlineMaterial={outlineThin} position={[-H * 0.5, H * 11.4, -H * 0.1]} rotation={[0.1, 0, 0.42]} />
      <FighterPart geometry={resources.hairSpike} toonMaterial={cloth} outlineMaterial={outlineThin} position={[H * 0.18, H * 11.6, -H * 0.12]} rotation={[-0.08, 0, -0.12]} />
      <FighterPart geometry={resources.hairSpike} toonMaterial={cloth} outlineMaterial={outlineThin} position={[H * 0.72, H * 11.3, -H * 0.08]} rotation={[0.05, 0, -0.5]} />
    </group>
  );
}
