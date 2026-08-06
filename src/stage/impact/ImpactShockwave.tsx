'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type { Mesh, ShaderMaterial } from 'three';
import { readLatestHit } from '@/src/game/combatRuntime';
import { createShockwaveMaterial } from '@/src/render/shockwaveMaterial';

const POOL = 4;
/** Seconds a ring takes to run its course. */
const LIFETIME = 0.42;

interface Wave {
  bornAt: number;
  power: number;
  x: number;
  y: number;
  size: number;
}

/**
 * A shock ring on every landed blow, scaled to how hard it landed.
 *
 * This is the piece that was missing from the hit read. The sim already froze,
 * the camera already shook and sparks already flew, but nothing in the frame
 * marked *where* the blow connected — so a heavy landed at the same visual
 * volume as a jab, one metre off from where the player was looking. A ring
 * pinned to the contact point fixes the location and the weight in one mark.
 *
 * Four is enough for any combo: rings live 0.42 s and no character can chain
 * five confirmed hits inside that.
 */
export function ImpactShockwave() {
  const camera = useThree((state) => state.camera);
  const meshes = useRef<Array<Mesh | null>>([]);
  const waves = useRef<Wave[]>(
    Array.from({ length: POOL }, () => ({ bornAt: -10, power: 0, x: 0, y: 0, size: 1 })),
  );
  const cursor = useRef(0);
  const seen = useRef({ p1: 0, p2: 0 });

  const materials = useMemo(
    () => Array.from({ length: POOL }, () => createShockwaveMaterial('#ff9b46', '#fff6e0')),
    [],
  );
  useEffect(
    () => () => { for (const material of materials) material.dispose(); },
    [materials],
  );

  // Three.js uniforms are intentionally mutable render state; driving them from
  // the frame loop is the documented way to animate a shader.
  // eslint-disable-next-line react-hooks/immutability
  useFrame(({ clock }) => {
    const now = clock.elapsedTime;

    for (const fighterId of ['p1', 'p2'] as const) {
      const hit = readLatestHit(fighterId);
      if (hit === null || hit.serial === seen.current[fighterId]) continue;
      seen.current[fighterId] = hit.serial;
      const wave = waves.current[cursor.current];
      cursor.current = (cursor.current + 1) % POOL;
      if (wave === undefined) continue;
      const weight = Math.min(1, hit.damage / 78);
      wave.bornAt = now;
      wave.power = 0.4 + weight * 0.6;
      // Roughly a shoulder-width at its smallest, never larger than a fighter
      // is tall. Anything past that reads as a stage effect rather than as
      // something one body did to another.
      wave.size = 0.85 + weight * 1.45;
      wave.x = hit.x;
      wave.y = hit.y;
    }

    for (let index = 0; index < POOL; index += 1) {
      const wave = waves.current[index];
      const mesh = meshes.current[index];
      const material = materials[index];
      if (wave === undefined || mesh === undefined || mesh === null || material === undefined) {
        continue;
      }
      const progress = (now - wave.bornAt) / LIFETIME;
      if (progress >= 1 || progress < 0) {
        mesh.visible = false;
        continue;
      }
      mesh.visible = true;
      mesh.position.set(wave.x, wave.y, 0.5);
      // Billboarded: a ring lying in the world plane turns into a line the
      // moment the camera rolls or pans, and the roll is exactly when it fires.
      mesh.quaternion.copy(camera.quaternion);
      mesh.scale.setScalar(wave.size);
      const uniforms = material.uniforms as ShaderMaterial['uniforms'];
      /* eslint-disable react-hooks/immutability */
      uniforms.uProgress!.value = progress;
      uniforms.uPower!.value = wave.power;
      /* eslint-enable react-hooks/immutability */
    }
  });

  return (
    <group>
      {materials.map((material, index) => (
        <mesh
          frustumCulled={false}
          key={material.uuid}
          material={material}
          ref={(mesh) => { meshes.current[index] = mesh; }}
          renderOrder={30}
          visible={false}
        >
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  );
}
