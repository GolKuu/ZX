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
import { GlitchBody } from './glitch/GlitchBody';
import { applyGlitchCombatAnimation } from './glitch/glitchCombatAnimation';
import {
  createGlitchMaterials,
  disposeGlitchMaterials,
  toonMaterialsOf,
} from './glitch/glitchMaterials';
import {
  createGlitchResources,
  disposeGlitchResources,
} from './glitch/glitchResources';
import { resetZoroRig, type ZoroRig } from './zoro/zoroRig';
import { readZoroRig, type ZoroRigRefs } from './zoro/zoroRigRefs';

export function GlitchFighter({
  fighterId,
}: {
  readonly fighterId: 'p1' | 'p2';
}) {
  const outer = useRef<Group>(null);
  const fragments = useRef<Group>(null);
  const refs = useRigRefs();
  const rig = useRef<ZoroRig | null>(null);
  const resources = useMemo(() => createGlitchResources(), []);
  const gradient = useMemo(() => createCelGradient(), []);
  const outline = useMemo(() => createOutlineMaterial({ pixelWidth: 2.3 }), []);
  const materials = useMemo(() => createGlitchMaterials(gradient), [gradient]);
  const toonMaterials = useMemo(() => toonMaterialsOf(materials), [materials]);
  const viewportHeight = useThree((state) => state.size.height);
  const camera = useThree((state) => state.camera);
  const opponentId = fighterId === 'p1' ? 'p2' : 'p1';

  useEffect(() => {
    const fov = camera instanceof PerspectiveCamera ? camera.fov : 45;
    updateOutlineProjection(outline, viewportHeight, fov);
  }, [camera, outline, viewportHeight]);

  useEffect(() => () => {
    disposeGlitchResources(resources);
    disposeGlitchMaterials(materials);
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
    resetZoroRig(currentRig, 'one', time);
    const alpha = combatRenderFrame.interpolationAlpha;
    outerGroup.position.x = (
      fighter.previousPosition.x
      + (fighter.position.x - fighter.previousPosition.x) * alpha
    ) / FIXED_SCALE;
    outerGroup.position.y = fighter.position.y / FIXED_SCALE;

    const opponent = readCombatFighter(opponentId);
    const visualFacing = facingOpponent(fighter, opponent);
    turnTowardOpponent(outerGroup, currentRig.head, visualFacing);
    applyWalkCycle(currentRig, fighter, time, visualFacing);
    applyGlitchCombatAnimation(currentRig, fighter);

    const floating = fragments.current;
    if (floating !== null) {
      floating.position.y = Math.sin(time * 2.8) * 0.035;
      floating.rotation.y = time * 0.72;
      floating.rotation.z = Math.sin(time * 1.7) * 0.08;
    }

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
      <GlitchBody
        fragments={fragments}
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
