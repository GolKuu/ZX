/* eslint-disable react-hooks/refs -- R3F refs are attached here, never read during render. */
import type { VoidWalkerMaterials } from './voidWalkerMaterials';
import type { VoidWalkerResources } from './voidWalkerResources';
import type { ZoroRigRefs } from '../zoro/zoroRigRefs';

interface VoidWalkerEffectsProps {
  readonly materials: VoidWalkerMaterials;
  readonly refs: ZoroRigRefs;
  readonly resources: VoidWalkerResources;
}

/** Lashes that whip out of the barrier when it is up. */
const TENDRILS = [
  { id: 't-0', azimuth: 0.4, tilt: 1.15, scale: 1.0 },
  { id: 't-1', azimuth: -0.75, tilt: 1.35, scale: 0.82 },
  { id: 't-2', azimuth: 1.9, tilt: 1.0, scale: 0.92 },
  { id: 't-3', azimuth: -2.3, tilt: 1.25, scale: 1.08 },
  { id: 't-4', azimuth: 2.9, tilt: 1.45, scale: 0.76 },
] as const;

const ECHOES = [-0.34, -0.62, -0.9] as const;

export function VoidWalkerEffects({
  materials,
  refs,
  resources,
}: VoidWalkerEffectsProps) {
  return (
    <>
      <group ref={refs.slash}>
        <mesh geometry={resources.slash} material={materials.aura} />
        <mesh
          geometry={resources.slash}
          material={materials.phantom}
          scale={1.22}
        />
      </group>

      {/* Void orb: a dark core with the light on its shell, not a glowing
          ball. The hole is what makes it read as absence rather than fire. */}
      <group ref={refs.projectile}>
        <mesh geometry={resources.orb} material={materials.voidCore} />
        <mesh
          geometry={resources.orb}
          material={materials.aura}
          scale={1.28}
        />
        <mesh
          geometry={resources.ring}
          material={materials.aura}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.7}
        />
      </group>

      {/* The barrier. Additive shell plus two off-axis rings so it has an
          orientation the player can read while it spins. */}
      <group ref={refs.aura}>
        <mesh geometry={resources.barrier} material={materials.phantom} />
        <mesh
          geometry={resources.ring}
          material={materials.aura}
          rotation={[Math.PI / 2, 0, 0]}
          scale={1.85}
        />
        <mesh
          geometry={resources.ring}
          material={materials.aura}
          rotation={[Math.PI / 2.4, 0.7, 0]}
          scale={1.6}
        />
        {TENDRILS.map(({ id, azimuth, tilt, scale }) => (
          <group key={id} rotation={[0, azimuth, 0]}>
            <group rotation={[-tilt, 0, 0]}>
              <mesh
                geometry={resources.tendril}
                material={materials.aura}
                position={[0, 0.42 * scale, 0]}
                scale={[1, scale, 0.4]}
              />
            </group>
          </group>
        ))}
      </group>

      {/* Afterimages trail behind the movement axis, never in front of it. */}
      <group ref={refs.echoes}>
        {ECHOES.map((offset, index) => (
          <group key={offset} position={[offset, 0, offset * 0.22]}>
            <mesh
              geometry={resources.chest}
              material={materials.phantom}
              position={[0, 1.51, 0]}
              scale={[1.3 - index * 0.1, 1 - index * 0.08, 0.72]}
            />
            <mesh
              geometry={resources.head}
              material={materials.phantom}
              position={[0, 2.45, 0]}
              scale={1 - index * 0.08}
            />
            <mesh
              geometry={resources.hairMass}
              material={materials.phantom}
              position={[0, 2.65, -0.01]}
              scale={1 - index * 0.08}
            />
          </group>
        ))}
      </group>
    </>
  );
}
