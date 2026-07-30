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
import {
  AANG_ELEMENT_INFO,
} from '@/src/aang/combat/elements';
import { useRenderStore } from '@/src/store/renderStore';
import {
  applyWalkCycle,
  facingOpponent,
  turnTowardOpponent,
} from './fighterPresentation';
import { AangBody } from './aang3d/AangBody';
import {
  createAangMaterials,
  disposeAangMaterials,
  toonMaterialsOf,
} from './aang3d/aangMaterials';
import {
  applyAangCombatAnimation,
  readAangRig,
  resetAangRig,
  type AangRig,
  type AangRigRefs,
} from './aang3d/aangRig';
import {
  createFighterResources,
  disposeFighterResources,
} from './fighterResources';

export function AangFighter({
  auraColor,
  fighterId,
}: {
  readonly auraColor: string;
  readonly fighterId: 'p1' | 'p2';
}) {
  const outer = useRef<Group>(null);
  const refs = useRigRefs();
  const rig = useRef<AangRig | null>(null);
  const resources = useMemo(() => createFighterResources(), []);
  const gradient = useMemo(() => createCelGradient(), []);
  const outline = useMemo(() => createOutlineMaterial(), []);
  const materials = useMemo(
    () => createAangMaterials(gradient, auraColor),
    [auraColor, gradient],
  );
  const toonMaterials = useMemo(() => toonMaterialsOf(materials), [materials]);
  const viewportHeight = useThree((state) => state.size.height);
  const camera = useThree((state) => state.camera);
  const opponentId = fighterId === 'p1' ? 'p2' : 'p1';

  useEffect(() => {
    const fov = camera instanceof PerspectiveCamera ? camera.fov : 45;
    updateOutlineProjection(outline, viewportHeight, fov);
  }, [camera, outline, viewportHeight]);

  useEffect(() => () => {
    disposeFighterResources(resources);
    disposeAangMaterials(materials);
    gradient.dispose();
    outline.dispose();
  }, [gradient, materials, outline, resources]);

  useFrame(({ camera: activeCamera, clock }) => {
    rig.current ??= readAangRig(refs);
    const currentRig = rig.current;
    const fighter = readCombatFighter(fighterId);
    const outerGroup = outer.current;
    if (currentRig === null || fighter === null || outerGroup === null) return;
    resetAangRig(currentRig, clock.elapsedTime);
    const alpha = combatRenderFrame.interpolationAlpha;
    outerGroup.position.x = (
      fighter.previousPosition.x
      + (fighter.position.x - fighter.previousPosition.x) * alpha
    ) / FIXED_SCALE;
    outerGroup.position.y = fighter.position.y / FIXED_SCALE;
    const opponent = readCombatFighter(opponentId);
    const visualFacing = facingOpponent(fighter, opponent);
    turnTowardOpponent(outerGroup, currentRig.head, visualFacing);
    applyWalkCycle(currentRig, fighter, clock.elapsedTime, visualFacing, 0.82);
    applyAangCombatAnimation(currentRig, fighter);
    const element = useRenderStore.getState().aangElements[fighterId];
    const elementColor = AANG_ELEMENT_INFO[element].color;
    materials.glow.color.set(elementColor);
    materials.effect.color.set(elementColor);

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
      <AangBody
        materials={materials}
        outline={outline}
        refs={refs}
        resources={resources}
      />
    </group>
  );
}

function useRigRefs(): AangRigRefs {
  return {
    root: useRef<Group>(null),
    torso: useRef<Group>(null),
    head: useRef<Group>(null),
    leftArm: useRef<Group>(null),
    rightArm: useRef<Group>(null),
    leftLeg: useRef<Group>(null),
    rightLeg: useRef<Group>(null),
    staff: useRef<Group>(null),
    effect: useRef<Group>(null),
  };
}
