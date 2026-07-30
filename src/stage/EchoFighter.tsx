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
import { EchoBody } from './echo/EchoBody';
import { applyEchoCombatAnimation } from './echo/echoCombatAnimation';
import {
  createEchoObservation,
  observeOpponent,
} from './echo/echoObservation';
import { layoutEchoPredictionFx } from './echo/echoPredictionFx';
import {
  createEchoMaterials,
  disposeEchoMaterials,
  echoToonMaterials,
} from './echo/echoMaterials';
import {
  createEchoResources,
  disposeEchoResources,
} from './echo/echoResources';
import { resetEchoRig } from './echo/echoRig';
import {
  applyWalkCycle,
  turnTowardOpponent,
  withOpponentFacing,
} from './fighterPresentation';
import { readFighterRig, type FighterRigRefs } from './fighterRigRefs';

export function EchoFighter({
  auraColor,
  fighterId,
}: {
  readonly auraColor: string;
  readonly fighterId: 'p1' | 'p2';
}) {
  const outer = useRef<Group>(null);
  const predictionRef = useRef<Group>(null);
  const refs = useRigRefs();
  const observation = useRef(createEchoObservation());
  const resources = useMemo(() => createEchoResources(), []);
  const gradient = useMemo(() => createCelGradient(), []);
  const outline = useMemo(() => createOutlineMaterial(), []);
  const materials = useMemo(
    () => createEchoMaterials(gradient, auraColor),
    [auraColor, gradient],
  );
  const toonMaterials = useMemo(
    () => echoToonMaterials(materials),
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
    disposeEchoResources(resources);
    disposeEchoMaterials(materials);
    gradient.dispose();
    outline.dispose();
  }, [gradient, materials, outline, resources]);

  useFrame(({ camera: activeCamera, clock }, delta) => {
    const rig = readFighterRig(refs);
    const fighter = readCombatFighter(fighterId);
    const outerGroup = outer.current;
    if (rig === null || fighter === null || outerGroup === null) return;
    const opponent = readCombatFighter(opponentId);
    const readout = observeOpponent(observation.current, opponent, delta);
    resetEchoRig(rig, clock.elapsedTime, readout);
    const alpha = combatRenderFrame.interpolationAlpha;
    outerGroup.position.x = (
      fighter.previousPosition.x
      + (fighter.position.x - fighter.previousPosition.x) * alpha
    ) / FIXED_SCALE;
    outerGroup.position.y = fighter.position.y / FIXED_SCALE;
    const presentation = withOpponentFacing(fighter, opponent);
    const visualFacing = presentation.facing;
    turnTowardOpponent(outerGroup, rig.head, visualFacing);
    applyWalkCycle(rig, fighter, clock.elapsedTime, visualFacing, 0.9);
    applyEchoCombatAnimation(rig, presentation);
    if (predictionRef.current !== null) {
      layoutEchoPredictionFx(
        predictionRef.current,
        readout,
        presentation,
        opponent,
        clock.elapsedTime,
      );
    }

    const self = { x: outerGroup.position.x, z: outerGroup.position.z };
    const other = opponent === null
      ? { x: self.x + visualFacing, z: self.z }
      : { x: opponent.position.x / FIXED_SCALE, z: self.z };
    for (const material of toonMaterials) {
      updateRimAxis(material, self, other, activeCamera.matrixWorldInverse);
    }
  });

  return (
    <group ref={outer}>
      <EchoBody
        materials={materials}
        outline={outline}
        predictionRef={predictionRef}
        refs={refs}
        resources={resources}
      />
    </group>
  );
}

function useRigRefs(): FighterRigRefs {
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
