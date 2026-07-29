'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { PointLight } from 'three';
import { ARENA_RADIUS } from './arena/arenaData';

/**
 * Three-point rig for the Null Circle, plus two practicals.
 *
 * The scene previously ran on one huge ambient term (1.18) and two directional
 * lights with no shadow map. Ambient that strong is the flattest possible
 * lighting model — it adds the same value to every normal, so form disappears
 * and every character reads as a paper cut-out. The rig here inverts that
 * balance: ambient does almost nothing, and the shape comes from a hard key,
 * a coloured back rim and a cold bounce.
 *
 * Colour discipline: the key is warm, everything filling it is cool. That is
 * what keeps a near-monochrome violet stage from going muddy.
 */

/** Push the shadow frustum a little past the disc so ring debris still casts. */
const SHADOW_EXTENT = ARENA_RADIUS + 3.4;

export function StageLighting() {
  const riftLight = useRef<PointLight>(null);

  useFrame(({ clock }) => {
    const light = riftLight.current;
    if (light === null) return;
    // The rift is unstable, so its practical breathes. Kept small — a light
    // that visibly flickers pulls the eye off the fighters.
    const time = clock.elapsedTime;
    light.intensity = 20 + Math.sin(time * 1.7) * 3 + Math.sin(time * 4.3) * 1.5;
  });

  return (
    <>
      {/* Sky/ground wrap. Replaces the flat ambient: the disc now bounces a
          different hue than the storm overhead, which is most of what stops
          the underside of a jumping fighter from going pure black. */}
      <hemisphereLight args={['#6d4bb0', '#180c26', 0.34]} />
      <ambientLight color="#2a1a44" intensity={0.11} />

      {/* Key — warm, hard, the only shadow caster. Placed high and camera-left
          so the shadow falls to the right and never sits under the fighter,
          where the HUD combo counter lives. */}
      <directionalLight
        castShadow
        color="#fff0d6"
        intensity={3.1}
        position={[-5.2, 8.6, 5.4]}
        shadow-bias={-0.0006}
        shadow-camera-bottom={-SHADOW_EXTENT}
        shadow-camera-far={34}
        shadow-camera-left={-SHADOW_EXTENT}
        shadow-camera-near={0.5}
        shadow-camera-right={SHADOW_EXTENT}
        shadow-camera-top={SHADOW_EXTENT}
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
        shadow-normalBias={0.028}
        shadow-radius={3}
      />

      {/* Back rim — the separation light. Violet, from behind and above, so
          every silhouette gets a lit contour against the storm. */}
      <directionalLight
        color="#c06bff"
        intensity={2.4}
        position={[4.6, 5.8, -6.2]}
      />

      {/* Cold fill from camera-right. Low, and deliberately not white: it eats
          the black out of the shadow side without flattening the key. */}
      <directionalLight
        color="#3f7ddb"
        intensity={0.85}
        position={[6.4, 2.1, 4.2]}
      />

      {/* Practical: the rift. Sits at the rift plane and rakes the far side of
          both fighters, which is what ties them to the backdrop. */}
      <pointLight
        ref={riftLight}
        color="#c07bff"
        decay={2}
        distance={38}
        intensity={20}
        position={[0, 4.7, -13.5]}
      />

      {/* Practical: floor bounce. Just above the disc, warm-violet, short
          range — it lifts boots and calves off the ground plane. */}
      <pointLight
        color="#8b52d6"
        decay={2}
        distance={9}
        intensity={3.2}
        position={[0, 0.55, 0.6]}
      />
    </>
  );
}
