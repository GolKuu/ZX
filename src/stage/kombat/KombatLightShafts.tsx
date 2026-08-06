'use client';

import { useEffect, useMemo } from 'react';
import { AdditiveBlending, Color, DoubleSide, ShaderMaterial } from 'three';
import type { KombatTheme } from './kombatTheme';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * A shaft of light falling through an arch opening.
 *
 * Drawn as a leaning quad whose alpha is strongest along its spine and dies at
 * both ends. It is a cheat — there is no participating medium here — but it is
 * the cheat every cinematic stage uses, because a beam is how an audience reads
 * "there is dust in this air and a hard light above". Additive and depth-write
 * off, so it lays over the architecture instead of clipping into it.
 */
const fragmentShader = /* glsl */ `
  uniform vec3  uColour;
  uniform float uStrength;
  varying vec2 vUv;

  void main() {
    float spine = 1.0 - smoothstep(0.0, 0.5, abs(vUv.x - 0.5));
    float fall = smoothstep(0.0, 0.35, vUv.y) * (1.0 - smoothstep(0.45, 1.0, vUv.y));
    float beam = pow(spine, 2.2) * fall;
    gl_FragColor = vec4(uColour * beam * uStrength, beam * uStrength * 0.5);
  }
`;

const SHAFTS = [
  { x: -7.7, tilt: 0.2, width: 2.6, height: 13 },
  { x: -3.9, tilt: 0.11, width: 2.2, height: 12 },
  { x: 3.9, tilt: -0.11, width: 2.2, height: 12 },
  { x: 7.7, tilt: -0.2, width: 2.6, height: 13 },
] as const;

export function KombatLightShafts({ theme }: { readonly theme: KombatTheme }) {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uColour: { value: new Color(theme.beacon) },
          uStrength: { value: 0.5 },
        },
        vertexShader,
        fragmentShader,
        blending: AdditiveBlending,
        depthWrite: false,
        fog: false,
        side: DoubleSide,
        toneMapped: false,
        transparent: true,
      }),
    [theme],
  );
  useEffect(() => () => material.dispose(), [material]);

  return (
    <group position={[0, 2.6, -13.4]} renderOrder={-2}>
      {SHAFTS.map((shaft) => (
        <mesh
          key={shaft.x}
          material={material}
          position={[shaft.x, 0, 0]}
          rotation-z={shaft.tilt}
        >
          <planeGeometry args={[shaft.width, shaft.height]} />
        </mesh>
      ))}
    </group>
  );
}
