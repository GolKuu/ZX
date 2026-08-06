'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { MathUtils, ShaderMaterial, type Mesh } from 'three';
import { readCombatFighter } from '@/src/game/combatRuntime';
import { createSpeedLinesMaterial } from '@/src/render/speedLinesMaterial';
import { useRenderStore } from '@/src/store/renderStore';

/**
 * Radial streaks that rush in from the edges of frame while a blow lands.
 *
 * This used to be an 18 × 10 m quad parked in the middle of the arena, which on
 * a flat painted stage was invisible as a cheat and on a built one is a
 * billboard standing behind the fighters — a sunburst hanging in the room.
 * Speed lines are a *lens* effect: they belong on the glass, not in the set.
 * Parented to the camera and pushed just past the near plane, the streaks now
 * ride the frame edge wherever the camera looks, and the middle of the screen —
 * where the fight is — stays clear.
 */

/** Just past the near plane (0.1), so nothing in the world can occlude it. */
const LENS_DISTANCE = 0.24;

export function SpeedLines() {
  const camera = useThree((state) => state.camera);
  const quad = useRef<Mesh>(null);
  const material = useMemo(() => createSpeedLinesMaterial(), []);
  const enabledRef = useRef(useRenderStore.getState().effectsEnabled);
  const intensityRef = useRef(0);

  useEffect(() => {
    const unsubscribe = useRenderStore.subscribe((state) => {
      enabledRef.current = state.effectsEnabled;
    });
    return () => {
      unsubscribe();
      material.dispose();
    };
  }, [material]);

  // Sized to overfill the near plane at the widest aspect the game runs at.
  const size = useMemo(() => {
    const height = 2 * LENS_DISTANCE * Math.tan((39 * Math.PI) / 360) * 1.35;
    return [height * 2.4, height] as const;
  }, []);

  // Three.js uniforms are intentionally mutable render state; driving them from
  // the frame loop is the documented way to animate a shader.
  // eslint-disable-next-line react-hooks/immutability
  useFrame(({ clock }, delta) => {
    const glass = quad.current;
    if (glass !== null) {
      // Pinned to the lens by hand rather than by parenting the camera into the
      // scene graph: the camera is the renderer's, and reparenting it to chase
      // one quad is a much larger commitment than this.
      glass.quaternion.copy(camera.quaternion);
      glass.position.copy(camera.position);
      glass.translateZ(-LENS_DISTANCE);
    }

    const p1 = readCombatFighter('p1');
    const p2 = readCombatFighter('p2');
    // Hitstop only — the frames where the sim itself has stopped to sell the
    // blow. Firing on any action, as this used to, left the streaks on almost
    // permanently and they stopped meaning anything.
    const impact = [p1, p2].some(
      (fighter) => fighter !== null && (fighter.hitstop > 0 || fighter.dashFrames > 0),
    );
    const target = enabledRef.current && impact ? 0.42 : 0;
    // Snap on, ease off: an impact effect that fades *in* has already missed
    // the moment it exists to punctuate.
    const rate = target > intensityRef.current ? 26 : 7;
    intensityRef.current = MathUtils.damp(intensityRef.current, target, rate, delta);

    const shader = material as ShaderMaterial;
    /* eslint-disable react-hooks/immutability */
    shader.uniforms.uTime!.value = clock.elapsedTime;
    shader.uniforms.uIntensity!.value = intensityRef.current;
    /* eslint-enable react-hooks/immutability */
  });

  return (
    <mesh
      frustumCulled={false}
      material={material}
      ref={quad}
      renderOrder={90}
    >
      <planeGeometry args={[size[0], size[1]]} />
    </mesh>
  );
}
