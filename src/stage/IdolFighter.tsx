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
import {
  createFighterResources,
  disposeFighterResources,
} from './fighterResources';
import { IdolBody } from './idol/IdolBody';
import {
  createIdolMaterials,
  disposeIdolMaterials,
  idolToonMaterials,
} from './idol/idolMaterials';
import {
  createIdolResources,
  disposeIdolResources,
} from './idol/idolResources';
import {
  applyIdolCombatAnimation,
  readIdolRig,
  resetIdolRig,
  type IdolRig,
  type IdolRigRefs,
} from './idol/idolRig';

export function IdolFighter({
  auraColor,
  fighterId,
}: {
  readonly auraColor: string;
  readonly fighterId: 'p1' | 'p2';
}) {
  const outer = useRef<Group>(null);
  const refs = useRigRefs();
  const rig = useRef<IdolRig | null>(null);
  const body = useMemo(() => createFighterResources(), []);
  const idol = useMemo(() => createIdolResources(), []);
  const gradient = useMemo(() => createCelGradient(), []);
  const outline = useMemo(() => createOutlineMaterial(), []);
  const materials = useMemo(
    () => createIdolMaterials(gradient, auraColor),
    [auraColor, gradient],
  );
  const toonMaterials = useMemo(() => idolToonMaterials(materials), [materials]);
  const viewportHeight = useThree((state) => state.size.height);
  const camera = useThree((state) => state.camera);
  const opponentId = fighterId === 'p1' ? 'p2' : 'p1';

  useEffect(() => {
    const fov = camera instanceof PerspectiveCamera ? camera.fov : 45;
    updateOutlineProjection(outline, viewportHeight, fov);
  }, [camera, outline, viewportHeight]);

  useEffect(() => () => {
    disposeFighterResources(body);
    disposeIdolResources(idol);
    disposeIdolMaterials(materials);
    gradient.dispose();
    outline.dispose();
  }, [body, gradient, idol, materials, outline]);

  useFrame(({ camera: activeCamera, clock }) => {
    rig.current ??= readIdolRig(refs);
    const currentRig = rig.current;
    const fighter = readCombatFighter(fighterId);
    const outerGroup = outer.current;
    if (currentRig === null || fighter === null || outerGroup === null) return;

    resetIdolRig(currentRig, clock.elapsedTime);
    const alpha = combatRenderFrame.interpolationAlpha;
    outerGroup.position.x = (
      fighter.previousPosition.x
      + (fighter.position.x - fighter.previousPosition.x) * alpha
    ) / FIXED_SCALE;
    outerGroup.position.y = fighter.position.y / FIXED_SCALE;
    const opponent = readCombatFighter(opponentId);
    const visualFacing = facingOpponent(fighter, opponent);
    turnTowardOpponent(outerGroup, currentRig.head, visualFacing);
    applyWalkCycle(currentRig, fighter, clock.elapsedTime, visualFacing, 0.84);
    applyIdolCombatAnimation(currentRig, fighter);

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
      <IdolBody
        materials={materials}
        outline={outline}
        refs={refs}
        resources={body}
        star={idol.star}
      />
    </group>
  );
}

function useRigRefs(): IdolRigRefs {
  return {
    root: useRef<Group>(null),
    torso: useRef<Group>(null),
    head: useRef<Group>(null),
    leftArm: useRef<Group>(null),
    rightArm: useRef<Group>(null),
    leftLeg: useRef<Group>(null),
    rightLeg: useRef<Group>(null),
    microphone: useRef<Group>(null),
    starEffect: useRef<Group>(null),
  };
}
