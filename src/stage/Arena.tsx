'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BackSide,
  Color,
  DoubleSide,
  Group,
  MeshBasicMaterial,
  ShaderMaterial,
  type IUniform,
} from 'three';
import { createCelGradient } from '@/src/render/celGradient';
import { createToonMaterial } from '@/src/render/toonMaterial';

/**
 * The Circle — a fractured ring platform suspended inside a storm.
 *
 * Four depth layers so the frame has somewhere to go behind the fighters:
 * platform, broken pillars, drifting debris, gradient dome. Everything past the
 * platform stays desaturated and low-contrast on purpose — the band of screen
 * the fighters occupy has to remain the highest-contrast thing in the shot.
 */

const RADIUS = 5.1;

const domeVertex = /* glsl */ `
  varying vec3 vLocal;
  void main() {
    vLocal = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const domeFragment = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uStorm;
  uniform float uTime;
  varying vec3 vLocal;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  void main() {
    vec3 dir = normalize(vLocal);
    float height = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 sky = mix(uHorizon, uTop, pow(height, 0.75));

    // Slow churn above the horizon — reads as a storm without a texture fetch.
    vec2 uv = vec2(atan(dir.z, dir.x) * 1.4, dir.y * 2.6);
    float churn = noise(uv * 1.6 + vec2(uTime * 0.03, uTime * -0.02));
    churn += noise(uv * 3.7 - vec2(uTime * 0.05, 0.0)) * 0.5;
    float band = smoothstep(0.62, 0.06, abs(dir.y - 0.06));
    sky += uStorm * churn * band * 0.42;

    gl_FragColor = vec4(sky, 1.0);
  }
`;

const floorVertex = /* glsl */ `
  varying vec2 vXz;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vXz = world.xz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const floorFragment = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uLine;
  uniform vec3 uEdge;
  uniform float uRadius;
  uniform float uTime;
  varying vec2 vXz;

  void main() {
    float dist = length(vXz);
    float t = clamp(dist / uRadius, 0.0, 1.0);
    vec3 color = mix(uBase, uBase * 0.55, t);

    float rings = abs(fract(dist * 1.55) - 0.5) * 2.0;
    color += uLine * smoothstep(0.94, 1.0, rings) * (0.25 + t * 0.35);

    // Boundary band with a slow pulse, so the edge is always findable.
    float edge = smoothstep(0.82, 0.97, t) * (1.0 - smoothstep(0.985, 1.0, t));
    color += uEdge * edge * (0.75 + sin(uTime * 1.4) * 0.18);

    color += uLine * smoothstep(0.055, 0.0, abs(dist - 0.42)) * 0.5;
    gl_FragColor = vec4(color, 1.0);
  }
`;

interface Debris {
  readonly position: readonly [number, number, number];
  readonly scale: readonly [number, number, number];
  readonly rotation: readonly [number, number, number];
  readonly speed: number;
}

function buildDebris(count: number, seed: number): Debris[] {
  const items: Debris[] = [];
  let state = seed;
  const random = (): number => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
  for (let index = 0; index < count; index += 1) {
    const angle = random() * Math.PI * 2;
    const distance = RADIUS + 1.4 + random() * 8;
    items.push({
      position: [
        Math.cos(angle) * distance,
        -1.2 + random() * 5.5,
        Math.sin(angle) * distance,
      ],
      scale: [
        0.18 + random() * 0.5,
        0.14 + random() * 0.8,
        0.16 + random() * 0.45,
      ],
      rotation: [random() * 3.1, random() * 3.1, random() * 3.1],
      speed: 0.1 + random() * 0.35,
    });
  }
  return items;
}

export function Arena() {
  const debrisRef = useRef<Group>(null);
  const gradient = useMemo(() => createCelGradient(), []);

  // Resolved in an effect so the per-frame writes below target a ref rather
  // than a value produced during render.
  const clocks = useRef<{ dome: IUniform<number>; floor: IUniform<number> } | null>(null);

  const dome = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTop: { value: new Color('#0a0c1d') },
          uHorizon: { value: new Color('#2b1c4a') },
          uStorm: { value: new Color('#6d3ea8') },
          uTime: { value: 0 },
        },
        vertexShader: domeVertex,
        fragmentShader: domeFragment,
        side: BackSide,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );

  const floor = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uBase: { value: new Color('#161a2c') },
          uLine: { value: new Color('#4a6fa0') },
          uEdge: { value: new Color('#9fd8ff') },
          uRadius: { value: RADIUS },
          uTime: { value: 0 },
        },
        vertexShader: floorVertex,
        fragmentShader: floorFragment,
        toneMapped: false,
      }),
    [],
  );

  const stone = useMemo(
    () =>
      createToonMaterial({
        color: '#232a44',
        gradientMap: gradient,
        shadowTint: '#3b2a63',
        shadowStrength: 0.9,
        rimColor: '#8f6ad6',
        rimStrength: 0.4,
      }),
    [gradient],
  );

  const glow = useMemo(
    () =>
      new MeshBasicMaterial({
        color: new Color('#9fd8ff'),
        toneMapped: false,
        transparent: true,
        opacity: 0.5,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide,
      }),
    [],
  );

  const nearDebris = useMemo(() => buildDebris(26, 12345), []);
  const pillars = useMemo(() => buildDebris(9, 777), []);

  useEffect(() => {
    const domeTime = dome.uniforms.uTime;
    const floorTime = floor.uniforms.uTime;
    if (domeTime === undefined || floorTime === undefined) return;
    clocks.current = { dome: domeTime, floor: floorTime };
  }, [dome, floor]);

  useEffect(
    () => () => {
      gradient.dispose();
      dome.dispose();
      floor.dispose();
      stone.dispose();
      glow.dispose();
    },
    [dome, floor, glow, gradient, stone],
  );

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    const uniforms = clocks.current;
    if (uniforms !== null) {
      uniforms.dome.value = time;
      uniforms.floor.value = time;
    }

    const group = debrisRef.current;
    if (group === null) return;
    for (let index = 0; index < group.children.length; index += 1) {
      const child = group.children[index];
      const item = nearDebris[index];
      if (child === undefined || item === undefined) continue;
      child.position.y = item.position[1] + Math.sin(time * item.speed) * 0.32;
      child.rotation.y = item.rotation[1] + time * item.speed * 0.22;
    }
  });

  return (
    <group>
      <mesh material={dome} renderOrder={-10}>
        <sphereGeometry args={[52, 32, 20]} />
      </mesh>

      <mesh material={floor} rotation-x={-Math.PI / 2} position={[0, 0.002, 0]}>
        <circleGeometry args={[RADIUS, 96]} />
      </mesh>
      <mesh material={stone} position={[0, -0.42, 0]}>
        <cylinderGeometry args={[RADIUS, RADIUS * 0.82, 0.84, 96, 1]} />
      </mesh>

      <mesh material={glow} position={[0, 0.02, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[RADIUS - 0.09, RADIUS + 0.02, 96]} />
      </mesh>

      {pillars.map((item, index) => (
        <mesh
          key={`pillar-${String(index)}`}
          material={stone}
          position={[item.position[0], -0.8 + item.scale[1] * 2.4, item.position[2]]}
          rotation={[item.rotation[0] * 0.06, item.rotation[1], item.rotation[2] * 0.06]}
        >
          <boxGeometry args={[item.scale[0] * 1.6, item.scale[1] * 5.5, item.scale[2] * 1.6]} />
        </mesh>
      ))}

      <group ref={debrisRef}>
        {nearDebris.map((item, index) => (
          <mesh
            key={`debris-${String(index)}`}
            material={stone}
            position={[item.position[0], item.position[1], item.position[2]]}
            rotation={[item.rotation[0], item.rotation[1], item.rotation[2]]}
            scale={[item.scale[0], item.scale[1], item.scale[2]]}
          >
            <boxGeometry args={[1, 1, 1]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
