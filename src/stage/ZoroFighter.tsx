'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { Group } from 'three';
import { createCelGradient } from '@/src/render/celGradient';
import { createOutlineMaterial } from '@/src/render/outlineMaterial';
import { useRenderStore } from '@/src/store/renderStore';
import { ZoroBody } from './zoro/ZoroBody';
import { applyZoroAnimation } from './zoro/zoroAnimation';
import { ZORO_ACTION_BY_ID, type ZoroActionId } from './zoro/zoroActions';
import {
  createZoroMaterials,
  disposeZoroMaterials,
} from './zoro/zoroMaterials';
import {
  createZoroResources,
  disposeZoroResources,
} from './zoro/zoroResources';
import { resetZoroRig, type ZoroRig } from './zoro/zoroRig';
import { readZoroRig, type ZoroRigRefs } from './zoro/zoroRigRefs';

interface ZoroFighterProps {
  readonly auraColor: string;
  readonly controlled?: boolean;
  readonly facing: 1 | -1;
  readonly position: [number, number, number];
}

interface ActiveAnimation {
  readonly action: ZoroActionId;
  readonly duration: number;
  readonly start: number;
}

export function ZoroFighter({
  auraColor,
  controlled = false,
  facing,
  position,
}: ZoroFighterProps) {
  const refs = useRigRefs();
  const rig = useRef<ZoroRig | null>(null);
  const pending = useRef<ZoroActionId | null>(null);
  const active = useRef<ActiveAnimation | null>(null);
  const stance = useRef(useRenderStore.getState().zoroStance);
  const resources = useMemo(() => createZoroResources(), []);
  const gradient = useMemo(() => createCelGradient(), []);
  const outline = useMemo(() => createOutlineMaterial(), []);
  const materials = useMemo(
    () => createZoroMaterials(gradient, auraColor),
    [auraColor, gradient],
  );

  useEffect(() => useRenderStore.subscribe((state, previous) => {
    stance.current = state.zoroStance;
    if (
      controlled
      && state.zoroActionVersion !== previous.zoroActionVersion
    ) {
      pending.current = state.zoroAction;
    }
  }), [controlled]);

  useEffect(() => () => {
    disposeZoroResources(resources);
    disposeZoroMaterials(materials);
    gradient.dispose();
    outline.dispose();
  }, [gradient, materials, outline, resources]);

  useFrame(({ clock }) => {
    rig.current ??= readZoroRig(refs);
    const currentRig = rig.current;
    if (currentRig === null) return;
    const time = clock.elapsedTime;
    resetZoroRig(currentRig, stance.current, time);
    if (pending.current !== null) {
      const definition = ZORO_ACTION_BY_ID.get(pending.current);
      if (definition !== undefined) {
        active.current = {
          action: pending.current,
          duration: definition.duration,
          start: time,
        };
      }
      pending.current = null;
    }
    if (active.current === null) return;
    const progress = (time - active.current.start) / active.current.duration;
    if (progress >= 1) {
      active.current = null;
      return;
    }
    applyZoroAnimation(currentRig, active.current.action, progress);
  });

  return (
    <group
      position={position}
      rotation-y={facing === 1 ? -0.08 : Math.PI + 0.08}
    >
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
