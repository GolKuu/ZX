/* eslint-disable react-hooks/refs -- R3F attaches these refs during commit. */
import type { MimMaterials } from './mimMaterials';
import type { MimResources } from './mimResources';
import type { MimRigRefs } from './mimRig';

export function MimProps({
  materials,
  refs,
  resources,
}: {
  readonly materials: MimMaterials;
  readonly refs: MimRigRefs;
  readonly resources: MimResources;
}) {
  return (
    <>
      <group ref={refs.cursor}>
        <mesh geometry={resources.cursor} material={materials.cursor} />
      </group>
      <group ref={refs.banana}>
        <mesh geometry={resources.banana} material={materials.yellow} />
        <mesh
          geometry={resources.bananaTip}
          material={materials.purple}
          position={[0.22, 0.03, 0]}
          rotation={[0, 0, -0.7]}
        />
      </group>
      <group ref={refs.chair}>
        <mesh geometry={resources.chairSeat} material={materials.purple} />
        <mesh
          geometry={resources.chairBack}
          material={materials.hoodie}
          position={[0, 0.34, -0.18]}
        />
        <mesh
          geometry={resources.chairPost}
          material={materials.yellow}
          position={[0, -0.27, 0]}
        />
      </group>
      <group ref={refs.snap}>
        <mesh geometry={resources.snapRing} material={materials.snap} />
      </group>
    </>
  );
}
