'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { Group, PerspectiveCamera } from 'three';
import {
  combatRenderFrame,
  readCombatFighter,
} from '@/src/game/combatRuntime';
import { createCelGradient } from '@/src/render/celGradient';
import {
  createOutlineMaterial,
  updateOutlineProjection,
} from '@/src/render/outlineMaterial';
import { updateRimAxis } from '@/src/render/toonMaterial';
import { FIXED_SCALE } from '@/src/sim';
import { useRenderStore } from '@/src/store/renderStore';
import { ZoroBody } from './zoro/ZoroBody';
import { applyZoroCombatAnimation } from './zoro/zoroCombatAnimation';
import {
  createZoroMaterials,
  disposeZoroMaterials,
  toonMaterialsOf,
} from './zoro/zoroMaterials';
import {
  createZoroResources,
  disposeZoroResources,
} from './zoro/zoroResources';
import { resetZoroRig, type ZoroRig } from './zoro/zoroRig';
import { readZoroRig, type ZoroRigRefs } from './zoro/zoroRigRefs';

interface ZoroFighterProps {
  readonly auraColor: string;
  readonly fighterId: 'p1' | 'p2';
}

export function ZoroFighter({
  auraColor,
  fighterId,
}: ZoroFighterProps) {
  const outer = useRef<Group>(null);
  const refs = useRigRefs();
  const rig = useRef<ZoroRig | null>(null);
  const stance = useRef(useRenderStore.getState().zoroStance);
  const resources = useMemo(() => createZoroResources(), []);
  const gradient = useMemo(() => createCelGradient(), []);
  const outline = useMemo(() => createOutlineMaterial(), []);
  const materials = useMemo(
    () => createZoroMaterials(gradient, auraColor),
    [auraColor, gradient],
  );

  const toonMaterials = useMemo(() => toonMaterialsOf(materials), [materials]);
  const viewportHeight = useThree((state) => state.size.height);
  const camera = useThree((state) => state.camera);
  const opponentId = fighterId === 'p1' ? 'p2' : 'p1';

  useEffect(() => useRenderStore.subscribe((state) => {
    stance.current = state.zoroStance;
  }), []);

  useEffect(() => {
    const fov = camera instanceof PerspectiveCamera ? camera.fov : 45;
    updateOutlineProjection(outline, viewportHeight, fov);
  }, [camera, outline, viewportHeight]);

  useEffect(() => () => {
    disposeZoroResources(resources);
    disposeZoroMaterials(materials);
    gradient.dispose();
    outline.dispose();
  }, [gradient, materials, outline, resources]);

  useFrame(({ camera: activeCamera, clock }) => {
    rig.current ??= readZoroRig(refs);
    const currentRig = rig.current;
    const fighter = readCombatFighter(fighterId);
    const outerGroup = outer.current;
    if (currentRig === null || fighter === null || outerGroup === null) return;
    const time = clock.elapsedTime;
    resetZoroRig(currentRig, stance.current, time);
    const alpha = combatRenderFrame.interpolationAlpha;
    outerGroup.position.x = (
      fighter.previousPosition.x
      + (fighter.position.x - fighter.previousPosition.x) * alpha
    ) / FIXED_SCALE;
    outerGroup.position.y = fighter.position.y / FIXED_SCALE;
    outerGroup.rotation.y = fighter.facing === 1 ? -0.08 : Math.PI + 0.08;
    applyZoroCombatAnimation(currentRig, fighter);

    // Rim points at the opponent so both silhouettes separate from the
    // background along the axis the player actually reads.
    const opponent = readCombatFighter(opponentId);
    const self = { x: outerGroup.position.x, z: outerGroup.position.z };
    const other = opponent === null
      ? { x: self.x + fighter.facing, z: self.z }
      : { x: opponent.position.x / FIXED_SCALE, z: self.z };
    for (const material of toonMaterials) {
      updateRimAxis(material, self, other, activeCamera.matrixWorldInverse);
    }
  });

  return (
    <group ref={outer}>
      <ZoroBody
        materials={materials}
        outline={outline}
        refs={refs}
        resources={resources}
      />
    </group>
  );
}

function useRigRefs(): ZoroRigRefs {
  return {
    root: useRef<Group>(null),
    torso: useRef<Group>(null),
    head: useRef<Group>(null),
    leftArm: useRef<Group>(null),
    rightArm: useRef<Group>(null),
    leftLeg: useRef<Group>(null),
    rightLeg: useRef<Group>(null),
    leftSword: useRef<Group>(null),
    rightSword: useRef<Group>(null),
    mouthSword: useRef<Group>(null),
    slash: useRef<Group>(null),
    projectile: useRef<Group>(null),
    aura: useRef<Group>(null),
    echoes: useRef<Group>(null),
  };
}
