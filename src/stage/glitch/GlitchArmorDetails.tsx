import type { GlitchMaterials } from './glitchMaterials';
import type { GlitchResources } from './glitchResources';

export function GlitchArmorDetails({
  materials,
  resources,
}: {
  readonly materials: GlitchMaterials;
  readonly resources: GlitchResources;
}) {
  return (
    <group>
      <mesh
        castShadow
        geometry={resources.chestCore}
        material={materials.darkMetal}
        position={[0, 1.52, 0.19]}
        rotation={[0.12, 0, Math.PI / 4]}
        scale={[1.35, 1.7, 0.48]}
      />
      <mesh
        geometry={resources.chestCore}
        material={materials.cyanCore}
        position={[-0.055, 1.54, 0.225]}
        rotation={[0.12, 0, Math.PI / 4]}
        scale={[0.38, 1.18, 0.2]}
      />
      <mesh
        geometry={resources.collar}
        material={materials.ceramic}
        position={[0, 1.86, 0.02]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      <mesh
        castShadow
        geometry={resources.armourPlate}
        material={materials.darkMetal}
        position={[0, 2.08, 0.17]}
        scale={[1.26, 0.6, 0.72]}
      />
      <mesh
        geometry={resources.armourPlate}
        material={materials.cyanCore}
        position={[-0.055, 2.1, 0.207]}
        rotation-z={-0.08}
        scale={[0.5, 0.055, 0.76]}
      />
      <mesh
        geometry={resources.armourPlate}
        material={materials.violetCore}
        position={[0.09, 2.055, 0.209]}
        rotation-z={0.12}
        scale={[0.42, 0.045, 0.76]}
      />
      {[1.14, 1.31, 1.78].map((y, index) => (
        <mesh
          key={y}
          geometry={resources.shard}
          material={index === 1 ? materials.violetCore : materials.cyanCore}
          position={[0.33 + index * 0.04, y, 0.2]}
          rotation={[index * 0.5, index * 0.6, index * 0.35]}
          scale={[0.45, 1.15, 0.3]}
        />
      ))}
    </group>
  );
}
