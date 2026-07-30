/* eslint-disable react-hooks/refs -- R3F refs are attached, not read in render. */
import type { Material } from 'three';
import { FighterPart } from '../FighterPart';
import type { FighterRigRefs } from '../fighterRigRefs';
import type { EchoMaterials } from './echoMaterials';
import type { EchoResources } from './echoResources';

export interface EchoPartsProps {
  readonly materials: EchoMaterials;
  readonly outline: Material;
  readonly refs: FighterRigRefs;
  readonly resources: EchoResources;
}

export function EchoHead({
  materials,
  outline,
  refs,
  resources,
}: EchoPartsProps) {
  return (
    <group ref={refs.head} position={[0, 2.08, 0]}>
      <mesh
        geometry={resources.neck}
        material={materials.navy}
        position={[0, -0.19, 0]}
      />
      <FighterPart
        geometry={resources.head}
        outlineMaterial={outline}
        scale={[0.88, 1.08, 0.9]}
        toonMaterial={materials.white}
      />
      <mesh
        geometry={resources.visor}
        material={materials.visor}
        position={[0, 0.015, 0.14]}
        rotation-x={-0.12}
        scale={[1.18, 1, 0.8]}
      />
      <mesh
        geometry={resources.telemetry}
        material={materials.glow}
        position={[0, 0.015, 0.187]}
        rotation-z={Math.PI / 2}
        scale={[0.9, 0.62, 1]}
      />
    </group>
  );
}

export function EchoArm({
  side,
  materials,
  outline,
  refs,
  resources,
}: EchoPartsProps & { readonly side: 'left' | 'right' }) {
  const left = side === 'left';
  return (
    <group
      ref={left ? refs.leftArm : refs.rightArm}
      position={[left ? -0.43 : 0.43, 1.64, 0]}
    >
      <FighterPart
        geometry={resources.shoulder}
        outlineMaterial={outline}
        toonMaterial={materials.white}
      />
      <FighterPart
        geometry={resources.upperArm}
        outlineMaterial={outline}
        position={[0, -0.2, 0]}
        toonMaterial={materials.navy}
      />
      <FighterPart
        geometry={resources.forearm}
        outlineMaterial={outline}
        position={[0, -0.49, 0]}
        toonMaterial={materials.white}
      />
      <mesh
        geometry={resources.telemetry}
        material={materials.cyan}
        position={[0, -0.5, 0.066]}
        scale={[0.6, 0.58, 1]}
      />
      <FighterPart
        geometry={resources.hand}
        outlineMaterial={outline}
        position={[0, -0.69, 0.02]}
        toonMaterial={materials.navy}
      />
    </group>
  );
}

export function EchoLeg({
  side,
  materials,
  outline,
  refs,
  resources,
}: EchoPartsProps & { readonly side: 'left' | 'right' }) {
  const left = side === 'left';
  return (
    <group
      ref={left ? refs.leftLeg : refs.rightLeg}
      position={[left ? -0.2 : 0.2, 0.72, 0]}
    >
      <FighterPart
        geometry={resources.thigh}
        outlineMaterial={outline}
        position={[0, -0.2, 0]}
        toonMaterial={materials.navy}
      />
      <FighterPart
        geometry={resources.shin}
        outlineMaterial={outline}
        position={[0, -0.56, 0]}
        toonMaterial={materials.white}
      />
      <FighterPart
        geometry={resources.boot}
        outlineMaterial={outline}
        position={[0, -0.76, 0.08]}
        toonMaterial={materials.navy}
      />
    </group>
  );
}
