'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  Color,
  Group,
  MeshBasicMaterial,
} from 'three';
import type { KombatTheme } from './kombatTheme';

const PANEL_X = [-7.6, -3.8, 0, 3.8, 7.6] as const;

/**
 * Luminous industrial core behind the arcade.
 *
 * It gives the fighters a controlled bright value to silhouette against and
 * turns the empty black band behind the ring into layered architecture. All
 * shapes are procedural and stay behind the combat plane.
 */
export function KombatBackdropCore({ theme }: { readonly theme: KombatTheme }) {
  const pulse = useRef<Group>(null);
  const materials = useMemo(() => {
    const panel = new MeshBasicMaterial({
      blending: AdditiveBlending,
      color: new Color(theme.beacon),
      depthWrite: false,
      opacity: 0.15,
      toneMapped: false,
      transparent: true,
    });
    const line = new MeshBasicMaterial({
      blending: AdditiveBlending,
      color: new Color(theme.rimCool),
      depthWrite: false,
      opacity: 0.46,
      toneMapped: false,
      transparent: true,
    });
    return { line, panel };
  }, [theme]);

  useEffect(() => () => {
    materials.panel.dispose();
    materials.line.dispose();
  }, [materials]);

  useFrame(({ clock }) => {
    const group = pulse.current;
    if (group === null) return;
    const wave = 1 + Math.sin(clock.elapsedTime * 0.72) * 0.035;
    group.scale.setScalar(wave);
  });

  return (
    <group position={[0, 0, -16.2]}>
      {PANEL_X.map((x, index) => (
        <group key={x} position={[x, 3.7, 0]}>
          <mesh material={materials.panel}>
            <planeGeometry args={[2.75, 5.4]} />
          </mesh>
          <mesh material={materials.line} position={[0, 0, 0.02]}>
            <ringGeometry args={[0.72 + index * 0.025, 0.76 + index * 0.025, 48]} />
          </mesh>
          <mesh material={materials.line} position={[0, -2.35, 0.025]}>
            <planeGeometry args={[2.35, 0.035]} />
          </mesh>
        </group>
      ))}

      <group ref={pulse} position={[0, 3.75, 0.08]}>
        <mesh material={materials.line}>
          <ringGeometry args={[1.3, 1.38, 72]} />
        </mesh>
        <mesh material={materials.line} rotation-z={Math.PI / 4}>
          <ringGeometry args={[0.82, 0.87, 4]} />
        </mesh>
      </group>

      <mesh material={materials.line} position={[0, 7.15, 0]}>
        <boxGeometry args={[20.8, 0.08, 0.08]} />
      </mesh>
    </group>
  );
}
