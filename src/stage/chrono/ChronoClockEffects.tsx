/* eslint-disable react-hooks/refs -- refs are attached to R3F groups only. */
import type { Material } from 'three';
import type { ChronoRigRefs } from './chronoRig';

const FRAGMENTS: readonly (readonly [number, number, number, number])[] = [
  [-0.72, 0.38, -0.12, -0.4],
  [0.68, 0.22, 0.04, 1.8],
  [-0.52, -0.58, 0.08, 3.5],
  [0.44, -0.5, -0.08, 2.6],
  [-0.2, 0.64, 0.02, 0.9],
  [0.82, -0.2, 0.06, 4.2],
];
const TICKS = Array.from({ length: 12 }, (_, index) => {
  const angle = index * Math.PI / 6;
  return [Math.cos(angle) * 0.34, Math.sin(angle) * 0.34, angle] as const;
});

export function ChronoClockEffects({
  material,
  refs,
}: {
  readonly material: Material;
  readonly refs: ChronoRigRefs;
}) {
  return (
    <>
      <group ref={refs.fragments}>
        {FRAGMENTS.map(([x, y, z, rotation], index) => (
          <mesh
            key={index}
            material={material}
            position={[x, y, z]}
            rotation-z={rotation}
          >
            <torusGeometry args={[0.13, 0.018, 5, 18, Math.PI * 0.72]} />
          </mesh>
        ))}
      </group>
      <group ref={refs.effect} visible={false}>
        <mesh material={material}>
          <torusGeometry args={[0.42, 0.035, 8, 48]} />
        </mesh>
        <mesh material={material} scale={0.72}>
          <torusGeometry args={[0.42, 0.014, 6, 36]} />
        </mesh>
        {TICKS.map(([x, y, angle], index) => (
          <mesh
            key={index}
            material={material}
            position={[x, y, 0.01]}
            rotation-z={angle}
          >
            <boxGeometry args={[0.09, 0.012, 0.025]} />
          </mesh>
        ))}
        <mesh material={material} rotation-z={0.45}>
          <boxGeometry args={[0.58, 0.018, 0.035]} />
        </mesh>
        <mesh material={material} rotation-z={-0.82}>
          <boxGeometry args={[0.42, 0.014, 0.035]} />
        </mesh>
        <mesh material={material} position={[-0.18, 0.12, -0.01]} rotation-z={2.3}>
          <torusGeometry args={[0.58, 0.022, 4, 20, Math.PI * 0.42]} />
        </mesh>
        <mesh material={material} position={[0.19, -0.16, 0.02]} rotation-z={-0.6}>
          <torusGeometry args={[0.54, 0.018, 4, 18, Math.PI * 0.36]} />
        </mesh>
      </group>
    </>
  );
}
