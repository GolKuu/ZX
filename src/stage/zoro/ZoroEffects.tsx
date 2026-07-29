/* eslint-disable react-hooks/refs -- R3F refs are attached here, never read during render. */
import type { ZoroRigRefs } from './zoroRigRefs';
import type { ZoroMaterials } from './zoroMaterials';
import type { ZoroResources } from './zoroResources';

interface ZoroEffectsProps {
  readonly materials: ZoroMaterials;
  readonly refs: ZoroRigRefs;
  readonly resources: ZoroResources;
}

const echoArms = [
  [-0.48, 2.0, 0, 0.6],
  [-0.52, 1.7, 0, 1.2],
  [-0.5, 1.4, 0, 1.75],
  [0.48, 2.0, 0, -0.6],
  [0.52, 1.7, 0, -1.2],
  [0.5, 1.4, 0, -1.75],
] as const;

export function ZoroEffects({
  materials,
  refs,
  resources,
}: ZoroEffectsProps) {
  return (
    <>
      <group ref={refs.slash}>
        <mesh geometry={resources.slash} material={materials.aura} />
      </group>
      <group ref={refs.projectile}>
        <mesh geometry={resources.projectile} material={materials.aura} />
        <mesh
          geometry={resources.projectile}
          material={materials.phantom}
          scale={1.18}
        />
      </group>
      <group ref={refs.aura} position={[0, 1.35, -0.08]}>
        {[0.7, 1, 1.3].map((scale, index) => (
          <mesh
            key={scale}
            geometry={resources.slash}
            material={index === 1 ? materials.aura : materials.phantom}
            rotation={[Math.PI / 2, index * 0.8, index * 0.5]}
            scale={scale}
          />
        ))}
      </group>
      <group ref={refs.echoes}>
        <EchoHead x={-0.42} materials={materials} resources={resources} />
        <EchoHead x={0.42} materials={materials} resources={resources} />
        {echoArms.map(([x, y, z, rotation]) => (
          <group key={`${x}-${y}`} position={[x, y, z]} rotation-z={rotation}>
            <mesh
              geometry={resources.arm}
              material={materials.phantom}
              position={[0, -0.34, 0]}
            />
            <mesh
              geometry={resources.blade}
              material={materials.phantom}
              position={[0, -1.0, 0]}
            />
          </group>
        ))}
      </group>
    </>
  );
}

function EchoHead({
  x,
  materials,
  resources,
}: {
  readonly x: number;
  readonly materials: ZoroMaterials;
  readonly resources: ZoroResources;
}) {
  return (
    <group position={[x, 2.52, -0.05]}>
      <mesh geometry={resources.head} material={materials.phantom} />
      <mesh
        geometry={resources.hair}
        material={materials.phantom}
        position={[0, 0.35, 0]}
      />
    </group>
  );
}
