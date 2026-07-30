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
  turnTowardOpponent,
  withOpponentFacing,
} from './fighterPresentation';
import { ChronoBody } from './chrono/ChronoBody';
import { ChronoTemporalFx } from './chrono/ChronoTemporalFx';
import {
  chronoToonMaterials,
  createChronoMaterials,
  disposeChronoMaterials,
} from './chrono/chronoMaterials';
import {
  applyChronoCombatAnimation,
  readChronoRig,
  resetChronoRig,
  type ChronoRig,
  type ChronoRigRefs,
} from './chrono/chronoRig';
import {
  createFighterResources,
  disposeFighterResources,
} from './fighterResources';

export function ChronoFighter({
  auraColor,
  fighterId,
}: {
  readonly auraColor: string;
  readonly fighterId: 'p1' | 'p2';
}) {
  const outer = useRef<Group>(null);
  const refs = useRigRefs();
  const rig = useRef<ChronoRig | null>(null);
  const resources = useMemo(() => createFighterResources(), []);
  const gradient = useMemo(() => createCelGradient(), []);
  const outline = useMemo(() => createOutlineMaterial(), []);
  const materials = useMemo(
    () => createChronoMaterials(gradient, auraColor),
    [auraColor, gradient],
  );
  const toonMaterials = useMemo(
    () => chronoToonMaterials(materials),
    [materials],
  );
  const viewportHeight = useThree((state) => state.size.height);
  const camera = useThree((state) => state.camera);
  const opponentId = fighterId === 'p1' ? 'p2' : 'p1';

  useEffect(() => {
    const fov = camera instanceof PerspectiveCamera ? camera.fov : 45;
    updateOutlineProjection(outline, viewportHeight, fov);
  }, [camera, outline, viewportHeight]);

  useEffect(() => () => {
    disposeFighterResources(resources);
    disposeChronoMaterials(materials);
    gradient.dispose();
    outline.dispose();
  }, [gradient, materials, outline, resources]);

  useFrame(({ camera: activeCamera, clock }) => {
    rig.current ??= readChronoRig(refs);
    const currentRig = rig.current;
    const fighter = readCombatFighter(fighterId);
    const group = outer.current;
    if (currentRig === null || fighter === null || group === null) return;

    resetChronoRig(currentRig, clock.elapsedTime);
    const alpha = combatRenderFrame.interpolationAlpha;
    group.position.x = (
      fighter.previousPosition.x
      + (fighter.position.x - fighter.previousPosition.x) * alpha
    ) / FIXED_SCALE;
    group.position.y = fighter.position.y / FIXED_SCALE;
    const opponent = readCombatFighter(opponentId);
    const presentation = withOpponentFacing(fighter, opponent);
    const visualFacing = presentation.facing;
    turnTowardOpponent(group, currentRig.head, visualFacing);
    if (fighter.dashFrames === 0) {
      applyWalkCycle(currentRig, fighter, clock.elapsedTime, visualFacing, 0.9);
    }
    applyChronoCombatAnimation(currentRig, presentation);

    const self = { x: group.position.x, z: group.position.z };
    const other = opponent === null
      ? { x: self.x + visualFacing, z: self.z }
      : { x: opponent.position.x / FIXED_SCALE, z: self.z };
    for (const material of toonMaterials) {
      updateRimAxis(material, self, other, activeCamera.matrixWorldInverse);
    }
  });

  return (
    <group ref={outer}>
      <ChronoBody
        materials={materials}
        outline={outline}
        refs={refs}
        resources={resources}
      />
      <ChronoTemporalFx fighterId={fighterId} resources={resources} />
    </group>
  );
}

function useRigRefs(): ChronoRigRefs {
  return {
    root: useRef<Group>(null),
    torso: useRef<Group>(null),
    head: useRef<Group>(null),
    leftArm: useRef<Group>(null),
    rightArm: useRef<Group>(null),
    leftLeg: useRef<Group>(null),
    rightLeg: useRef<Group>(null),
    coat: useRef<Group>(null),
    fragments: useRef<Group>(null),
    effect: useRef<Group>(null),
  };
}
