'use client';

import { useEffect, useMemo } from 'react';
import { BackSide, Color, ShaderMaterial } from 'three';
import type { KombatTheme } from './kombatTheme';

/**
 * The room the fight happens in, closed off by a real sphere.
 *
 * A flat backdrop plane keystones the moment the camera tilts or pans, which is
 * exactly what gave the old stage away as painted card. A dome has no edges to
 * betray: the camera can look anywhere and still be inside the world. The
 * gradient is banded and dithered in the shader because a smooth 8-bit ramp
 * across 60° of sky visibly stair-steps.
 */
const vertexShader = /* glsl */ `
  varying vec3 vDirection;
  void main() {
    vDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uBeacon;
  varying vec3 vDirection;

  float hash(vec2 seed) {
    return fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    // Ramp biased toward the horizon colour.
    // A fight camera looks slightly *down*, so the band of sky it actually
    // frames sits just above the skyline — with an even gradient that band came
    // out at zenith black and the top of every shot was a hole. Holding the
    // horizon tone up through the lower sky puts the light where the lens is
    // pointed.
    float height = clamp(vDirection.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 sky = mix(uHorizon, uTop, pow(clamp((height - 0.5) * 2.0, 0.0, 1.0), 0.85));

    // Glow pooled above the horizon behind the arena: the set's own skyline
    // light, which is what stops the dome reading as an empty gradient.
    float back = clamp(-vDirection.z, 0.0, 1.0);
    float pool = pow(back, 2.4) * (1.0 - smoothstep(0.5, 0.86, height));
    sky += uBeacon * pool * 0.22;

    // A disc hanging behind and above the arena.
    // The top half of a fight camera's frame is mostly sky, and sky with
    // nothing in it is a hole. One bright object fixes the eye, gives the
    // architecture something to be silhouetted against, and — being the only
    // thing up there — tells the audience which way the key light comes from.
    vec3 toBeacon = normalize(vec3(0.26, 0.34, -1.0));
    float aim = dot(normalize(vDirection), toBeacon);
    float disc = smoothstep(0.9955, 0.9975, aim);
    float halo = pow(max(0.0, aim), 220.0) * 0.55 + pow(max(0.0, aim), 22.0) * 0.12;
    sky += uBeacon * (disc * 1.5 + halo);

    // Torn cloud band, cheap and directional.
    float band = sin(vDirection.x * 3.1 + vDirection.z * 1.7) * 0.5 + 0.5;
    float cloud = smoothstep(0.55, 1.0, band) * smoothstep(0.52, 0.78, height);
    sky = mix(sky, sky + uBeacon * 0.08, cloud);

    // Dither: kills the banding a smooth ramp shows across a 60° field.
    sky += (hash(gl_FragCoord.xy) - 0.5) * 0.006;
    gl_FragColor = vec4(sky, 1.0);
  }
`;

export function KombatSky({ theme }: { readonly theme: KombatTheme }) {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTop: { value: new Color(theme.skyTop) },
          uHorizon: { value: new Color(theme.skyHorizon) },
          uBeacon: { value: new Color(theme.beacon) },
        },
        vertexShader,
        fragmentShader,
        depthWrite: false,
        fog: false,
        side: BackSide,
        toneMapped: false,
      }),
    [theme],
  );
  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh material={material} renderOrder={-100} frustumCulled={false}>
      <sphereGeometry args={[62, 32, 20]} />
    </mesh>
  );
}
