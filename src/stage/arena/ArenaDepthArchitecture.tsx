'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { AdditiveBlending, Group, MeshBasicMaterial } from 'three';
import type { ArenaId } from '@/src/data/arenas';

const PALETTES: Record<ArenaId, { readonly primary: string; readonly secondary: string; readonly shadow: string }> = {
  'null-circle': { primary: '#8ef7d6', secondary: '#f4ca70', shadow: '#071619' },
  'storm-dome': { primary: '#63dfff', secondary: '#b06cff', shadow: '#07152a' },
  'ruined-megacity': { primary: '#ff9b68', secondary: '#ff416c', shadow: '#1d0b16' },
};

/** Distant, procedural set dressing that gives each arena a physical horizon. */
export function ArenaDepthArchitecture({ arenaId }: { readonly arenaId: ArenaId }) {
  const root = useRef<Group>(null);
  const pulseMaterials = useRef<Array<MeshBasicMaterial | null>>([]);
  const palette = PALETTES[arenaId];

  useFrame(({ clock }) => {
    const group = root.current;
    if (group === null) return;
    group.rotation.y = Math.sin(clock.elapsedTime * 0.12) * 0.006;
    for (let index = 0; index < pulseMaterials.current.length; index += 1) {
      const material = pulseMaterials.current[index];
      if (material !== null && material !== undefined) {
        material.opacity = 0.13 + (Math.sin(clock.elapsedTime * 1.5 + index * 0.7) + 1) * 0.055;
      }
    }
  });

  return (
    <group ref={root} position={[0, 0.1, -5.4]} renderOrder={-7}>
      {arenaId === 'null-circle' ? (
        <NullCircleArchitecture palette={palette} pulseMaterials={pulseMaterials} />
      ) : null}
      {arenaId === 'storm-dome' ? (
        <StormDomeArchitecture palette={palette} pulseMaterials={pulseMaterials} />
      ) : null}
      {arenaId === 'ruined-megacity' ? (
        <RuinedCityArchitecture palette={palette} pulseMaterials={pulseMaterials} />
      ) : null}
    </group>
  );
}

function NullCircleArchitecture({
  palette,
  pulseMaterials,
}: {
  readonly palette: (typeof PALETTES)[ArenaId];
  readonly pulseMaterials: React.MutableRefObject<Array<MeshBasicMaterial | null>>;
}) {
  return (
    <>
      {[-5.4, 0, 5.4].map((x, index) => (
        <group key={`monolith-${x}`} position={[x, 1.7 + (index % 2) * 0.45, index === 1 ? -0.4 : 0.25]} scale={[1, 1 + (index % 2) * 0.22, 1]}>
          <mesh>
            <cylinderGeometry args={[0.7, 1.05, 5.2, 6]} />
            <meshBasicMaterial color={palette.shadow} depthWrite={false} opacity={0.9} transparent />
          </mesh>
          <mesh position={[0, 0.1, 0.56]}>
            <planeGeometry args={[0.045, 4.1]} />
            <meshBasicMaterial
              ref={(material) => { pulseMaterials.current.push(material); }}
              blending={AdditiveBlending}
              color={index === 1 ? palette.secondary : palette.primary}
              depthWrite={false}
              opacity={0.16}
              transparent
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 4.4, -0.3]} rotation-z={Math.PI / 2}>
        <torusGeometry args={[3.8, 0.045, 8, 64]} />
        <meshBasicMaterial color={palette.secondary} depthWrite={false} opacity={0.18} transparent toneMapped={false} />
      </mesh>
    </>
  );
}

function StormDomeArchitecture({
  palette,
  pulseMaterials,
}: {
  readonly palette: (typeof PALETTES)[ArenaId];
  readonly pulseMaterials: React.MutableRefObject<Array<MeshBasicMaterial | null>>;
}) {
  return (
    <>
      {[0, 1, 2].map((index) => (
        <mesh key={`dome-ring-${index}`} position={[0, 2.5 + index * 0.72, 0.35 - index * 0.2]} rotation-x={Math.PI / 2} rotation-z={index * 0.38} scale={[1 + index * 0.14, 1, 1]}>
          <torusGeometry args={[2.35 + index * 0.72, 0.035, 8, 72]} />
          <meshBasicMaterial color={index % 2 === 0 ? palette.primary : palette.secondary} depthWrite={false} opacity={0.2 - index * 0.035} transparent toneMapped={false} />
        </mesh>
      ))}
      {[-4.8, -2.4, 2.4, 4.8].map((x, index) => (
        <mesh key={`storm-spire-${x}`} position={[x, 2.55 + (index % 2) * 0.6, 0]} rotation-z={index % 2 === 0 ? 0.12 : -0.12}>
          <coneGeometry args={[0.26, 5.7, 5]} />
          <meshBasicMaterial
            ref={(material) => { pulseMaterials.current.push(material); }}
            blending={AdditiveBlending}
            color={index % 2 === 0 ? palette.primary : palette.secondary}
            depthWrite={false}
            opacity={0.15}
            transparent
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}

function RuinedCityArchitecture({
  palette,
  pulseMaterials,
}: {
  readonly palette: (typeof PALETTES)[ArenaId];
  readonly pulseMaterials: React.MutableRefObject<Array<MeshBasicMaterial | null>>;
}) {
  const blocks = [
    [-6.2, 2.2, 1.4, 4.4], [-4.4, 1.3, 1.1, 2.6], [-2.7, 2.8, 1.5, 5.6],
    [2.8, 1.8, 1.4, 3.6], [4.6, 2.7, 1.2, 5.4], [6.25, 1.55, 1.3, 3.1],
  ] as const;
  return (
    <>
      {blocks.map(([x, y, width, height], index) => (
        <group key={`city-block-${x}`} position={[x, y, 0]}>
          <mesh>
            <boxGeometry args={[width, height, 0.42]} />
            <meshBasicMaterial color={palette.shadow} depthWrite={false} opacity={0.94} transparent />
          </mesh>
          {Array.from({ length: Math.max(2, Math.floor(height)) }).map((_, row) => (
            <mesh key={`window-${x}-${row}`} position={[0, -height * 0.34 + row * 0.65, 0.23]}>
              <planeGeometry args={[width * 0.62, 0.035]} />
              <meshBasicMaterial
                ref={(material) => { pulseMaterials.current.push(material); }}
                blending={AdditiveBlending}
                color={index % 2 === 0 ? palette.primary : palette.secondary}
                depthWrite={false}
                opacity={0.16}
                transparent
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.35, 0.5]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[14, 0.08]} />
        <meshBasicMaterial color={palette.secondary} depthWrite={false} opacity={0.12} transparent toneMapped={false} />
      </mesh>
    </>
  );
}
