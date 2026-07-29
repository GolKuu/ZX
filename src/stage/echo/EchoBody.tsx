/* eslint-disable react-hooks/refs -- R3F refs are attached, not read in render. */
import { FighterPart } from '../FighterPart';
import type { ZoroRigRefs } from '../zoro/zoroRigRefs';
import { EchoArm, EchoHead, EchoLeg } from './EchoParts';
import type { EchoMaterials } from './echoMaterials';
import type { EchoResources } from './echoResources';
import type { Material } from 'three';

export function EchoBody({
  materials,
  outline,
  refs,
  resources,
}: {
  readonly materials: EchoMaterials;
  readonly outline: Material;
  readonly refs: ZoroRigRefs;
  readonly resources: EchoResources;
}) {
  return (
    <group ref={refs.root}>
      <group ref={refs.torso} position={[0, 1.3, 0]}>
        <FighterPart
          geometry={resources.chest}
          outlineMaterial={outline}
          position={[0, 0.08, 0]}
          scale={[1.08, 1, 0.72]}
          toonMaterial={materials.navy}
        />
        <FighterPart
          geometry={resources.chestPlate}
          outlineMaterial={outline}
          position={[0, 0.12, 0.12]}
          rotation={[0.08, 0, 0]}
          toonMaterial={materials.white}
        />
        <mesh
          geometry={resources.telemetry}
          material={materials.cyan}
          position={[0, 0.12, 0.183]}
        />
        <FighterPart
          geometry={resources.waist}
          outlineMaterial={outline}
          position={[0, -0.28, 0]}
          toonMaterial={materials.navy}
        />
        {[-1, 1].map((side) => (
          <FighterPart
            key={side}
            geometry={resources.coatTail}
            outlineMaterial={outline}
            position={[side * 0.17, -0.73, -0.04]}
            rotation={[0.06, 0, side * -0.08]}
            scale={[1, 1, 0.9]}
            toonMaterial={materials.white}
          />
        ))}
      </group>

      <EchoHead {...{ materials, outline, refs, resources }} />
      <EchoArm side="left" {...{ materials, outline, refs, resources }} />
      <EchoArm side="right" {...{ materials, outline, refs, resources }} />
      <EchoLeg side="left" {...{ materials, outline, refs, resources }} />
      <EchoLeg side="right" {...{ materials, outline, refs, resources }} />
      <FighterPart
        geometry={resources.hips}
        outlineMaterial={outline}
        position={[0, 0.94, 0]}
        toonMaterial={materials.navy}
      />

      <group ref={refs.echoes} position={[0, 1.72, -0.2]}>
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.48, 0, 0]}>
            <mesh geometry={resources.ring} material={materials.glow} />
            <mesh
              geometry={resources.ringNode}
              material={materials.cyan}
              position={[0, -0.31, 0]}
            />
          </group>
        ))}
      </group>

      <group ref={refs.leftSword} />
      <group ref={refs.rightSword} />
      <group ref={refs.mouthSword} />
      <group ref={refs.slash} />
      <group ref={refs.projectile} />
      <group ref={refs.aura} />
    </group>
  );
}
