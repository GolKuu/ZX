'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  Color,
  MeshBasicMaterial,
  type Mesh,
} from 'three';
import { readLatestHit } from '@/src/game/combatRuntime';
import { useRenderStore } from '@/src/store/renderStore';

/** Just past the near plane, so nothing in the world can occlude it. */
const LENS_DISTANCE = 0.22;
/** Below this share of a fighter's health bar, a blow does not earn a flash. */
const HEAVY_DAMAGE = 46;

/**
 * One frame of white on a heavy landing.
 *
 * Every fighting game worth the name blows the exposure for two or three frames
 * when something big connects, and the reason is physiological rather than
 * artistic: a flash resets the eye, so the pose *after* it lands with the force
 * of a first impression. Gated hard on damage — a flash on every jab is a
 * strobe, and reads as a bug rather than as a hit.
 */
export function ImpactFlash() {
  const camera = useThree((state) => state.camera);
  const quad = useRef<Mesh>(null);
  const energy = useRef(0);
  const seen = useRef({ p1: 0, p2: 0 });
  const superVersionRef = useRef(
    useRenderStore.getState().mimSuperVersion
    + useRenderStore.getState().glitchSuperVersion
    + useRenderStore.getState().luckySuperVersion,
  );
  const superVersion = useRenderStore(
    (state) =>
      state.mimSuperVersion + state.glitchSuperVersion + state.luckySuperVersion,
  );
  const effectsEnabled = useRenderStore((state) => state.effectsEnabled);

  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        blending: AdditiveBlending,
        color: new Color('#ffeedd'),
        depthTest: false,
        depthWrite: false,
        opacity: 0,
        toneMapped: false,
        transparent: true,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);

  const size = useMemo(() => {
    const height = 2 * LENS_DISTANCE * Math.tan((39 * Math.PI) / 360) * 1.4;
    return [height * 2.6, height] as const;
  }, []);

  // The material's opacity is this effect's entire state, and it is written
  // every frame from the loop — the documented way to drive three.js.
  // eslint-disable-next-line react-hooks/immutability
  useFrame((_, delta) => {
    if (superVersion !== superVersionRef.current) {
      superVersionRef.current = superVersion;
      energy.current = 1;
    }
    for (const fighterId of ['p1', 'p2'] as const) {
      const hit = readLatestHit(fighterId);
      if (hit === null || hit.serial === seen.current[fighterId]) continue;
      seen.current[fighterId] = hit.serial;
      if (hit.damage < HEAVY_DAMAGE) continue;
      energy.current = Math.max(
        energy.current,
        Math.min(1, (hit.damage - HEAVY_DAMAGE) / 40) * 0.7 + 0.3,
      );
    }

    // Roughly four frames at 60 Hz. Any longer and it stops being a punctuation
    // mark and starts being a fade.
    energy.current = Math.max(0, energy.current - delta * 14);

    const glass = quad.current;
    if (glass === null) return;
    glass.quaternion.copy(camera.quaternion);
    glass.position.copy(camera.position);
    glass.translateZ(-LENS_DISTANCE);
    /* eslint-disable-next-line react-hooks/immutability */
    material.opacity = effectsEnabled ? energy.current * 0.26 : 0;
    glass.visible = material.opacity > 0.002;
  });

  return (
    <mesh
      frustumCulled={false}
      material={material}
      ref={quad}
      renderOrder={95}
      visible={false}
    >
      <planeGeometry args={[size[0], size[1]]} />
    </mesh>
  );
}
