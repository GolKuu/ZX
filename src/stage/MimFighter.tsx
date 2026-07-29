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
  applyWalkCycle,
  facingOpponent,
  turnTowardOpponent,
} from './fighterPresentation';
import { MimBody } from './mim/MimBody';
import { applyMimCombatAnimation } from './mim/mimAnimation';
import {
  createMimMaterials,
  disposeMimMaterials,
  mimToonMaterials,
} from './mim/mimMaterials';
import {
  createMimResources,
  disposeMimResources,
} from './mim/mimResources';
import {
  readMimRig,
  resetMimRig,
  type MimRig,
  type MimRigRefs,
} from './mim/mimRig';

export function MimFighter({
  auraColor,
  fighterId,
}: {
  readonly auraColor: string;
  readonly fighterId: 'p1' | 'p2';
}) {
  const outer = useRef<Group>(null);
  const refs = useRigRefs();
  const rig = useRef<MimRig | null>(null);
  const resources = useMemo(() => createMimResources(), []);
  const gradient = useMemo(() => createCelGradient(), []);
  const outline = useMemo(() => createOutlineMaterial({ pixelWidth: 2.2 }), []);
  const materials = useMemo(
    () => createMimMaterials(gradient, auraColor),
    [auraColor, gradient],
  );
  const toonMaterials = useMemo(() => mimToonMaterials(materials), [materials]);
  const viewportHeight = useThree((state) => state.size.height);
  const camera = useThree((state) => state.camera);
  const opponentId = fighterId === 'p1' ? 'p2' : 'p1';

  useEffect(() => {
    const fov = camera instanceof PerspectiveCamera ? camera.fov : 45;
    updateOutlineProjection(outline, viewportHeight, fov);
  }, [camera, outline, viewportHeight]);

  useEffect(() => () => {
    disposeMimResources(resources);
    disposeMimMaterials(materials);
    gradient.dispose();
    outline.dispose();
  }, [gradient, materials, outline, resources]);

  useFrame(({ camera: activeCamera, clock }) => {
    rig.current ??= readMimRig(refs);
    const currentRig = rig.current;
    const fighter = readCombatFighter(fighterId);
    const outerGroup = outer.current;
    if (currentRig === null || fighter === null || outerGroup === null) return;

    const time = clock.elapsedTime;
    resetMimRig(currentRig, time);
    const alpha = combatRenderFrame.interpolationAlpha;
    outerGroup.position.x = (
      fighter.previousPosition.x
      + (fighter.position.x - fighter.previousPosition.x) * alpha
    ) / FIXED_SCALE;
    outerGroup.position.y = fighter.position.y / FIXED_SCALE;
    const opponent = readCombatFighter(opponentId);
    const visualFacing = facingOpponent(fighter, opponent);
    turnTowardOpponent(outerGroup, currentRig.head, visualFacing);
    applyWalkCycle(currentRig, fighter, time, visualFacing, 0.9);
    applyMimCombatAnimation(currentRig, fighter);

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
      <MimBody
        materials={materials}
        outline={outline}
        refs={refs}
        resources={resources}
      />
    </group>
  );
}

function useRigRefs(): MimRigRefs {
  return {
    root: useRef<Group>(null),
    torso: useRef<Group>(null),
    head: useRef<Group>(null),
    leftArm: useRef<Group>(null),
    rightArm: useRef<Group>(null),
    leftLeg: useRef<Group>(null),
    rightLeg: useRef<Group>(null),
    scarf: useRef<Group>(null),
    cursor: useRef<Group>(null),
    banana: useRef<Group>(null),
    chair: useRef<Group>(null),
    snap: useRef<Group>(null),
  };
}
