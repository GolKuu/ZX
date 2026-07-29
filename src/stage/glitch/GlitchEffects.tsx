/* eslint-disable react-hooks/refs -- R3F attaches these refs during render. */
import type { ZoroRigRefs } from '../zoro/zoroRigRefs';
import type { GlitchMaterials } from './glitchMaterials';
import type { GlitchResources } from './glitchResources';

export function GlitchEffects({
  materials,
  refs,
  resources,
}: {
  readonly materials: GlitchMaterials;
  readonly refs: ZoroRigRefs;
  readonly resources: GlitchResources;
}) {
  return (
    <>
      <group ref={refs.slash}>
        <mesh geometry={resources.slash} material={materials.magenta} />
        <mesh
          geometry={resources.slash}
          material={materials.phantomCyan}
          rotation-z={0.18}
          scale={1.16}
        />
        {[-0.48, -0.15, 0.24, 0.5].map((x, index) => (
          <mesh
            key={x}
            geometry={resources.pixel}
            material={index % 2 === 0 ? materials.cyan : materials.magenta}
            position={[x, 0.12 * (index % 3), 0]}
            scale={0.7 + index * 0.12}
          />
        ))}
      </group>

      <group ref={refs.projectile}>
        <mesh geometry={resources.packet} material={materials.magenta} />
        {([
          [-0.24, 0.16, 0],
          [0.22, 0.13, 0.04],
          [-0.18, -0.2, -0.04],
          [0.2, -0.18, 0],
        ] as const).map(([x, y, z], index) => (
          <mesh
            key={`${x}-${y}`}
            geometry={resources.pixel}
            material={index % 2 === 0 ? materials.cyan : materials.magenta}
            position={[x, y, z]}
            scale={0.85}
          />
        ))}
      </group>

      <group ref={refs.aura}>
        {[0.72, 1, 1.28].map((scale, index) => (
          <mesh
            key={scale}
            geometry={resources.zone}
            material={index % 2 === 0 ? materials.phantomCyan : materials.phantomMagenta}
            rotation-x={Math.PI / 2}
            scale={scale}
          />
        ))}
      </group>

      <group ref={refs.echoes}>
        {[-0.55, -0.28, 0.32, 0.62].map((x, index) => (
          <mesh
            key={x}
            geometry={resources.pixel}
            material={index % 2 === 0 ? materials.phantomCyan : materials.phantomMagenta}
            position={[x, 1 + index * 0.26, index % 2 === 0 ? -0.12 : 0.12]}
            scale={1.5 - index * 0.12}
          />
        ))}
      </group>
    </>
  );
}
