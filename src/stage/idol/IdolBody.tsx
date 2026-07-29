/* eslint-disable react-hooks/refs -- refs are attached only to R3F groups. */
import type { BufferGeometry, Material } from 'three';
import { FighterPart } from '../FighterPart';
import type { FighterResources } from '../fighterResources';
import type { IdolMaterials } from './idolMaterials';
import type { IdolRigRefs } from './idolRig';

interface IdolBodyProps {
  readonly materials: IdolMaterials;
  readonly outline: Material;
  readonly refs: IdolRigRefs;
  readonly resources: FighterResources;
  readonly star: BufferGeometry;
}

export function IdolBody(props: IdolBodyProps) {
  const { materials, outline, refs, resources, star } = props;
  return (
    <group ref={refs.root} scale={1.22}>
      <IdolLeg direction={-1} material={materials.white} outline={outline} refGroup={refs.leftLeg} resources={resources} />
      <IdolLeg direction={1} material={materials.white} outline={outline} refGroup={refs.rightLeg} resources={resources} />

      <group ref={refs.torso} position={[0, 1.08, 0]}>
        <FighterPart geometry={resources.hips} outlineMaterial={outline} position={[0, -0.3, 0]} scale={[0.9, 0.78, 0.9]} toonMaterial={materials.white} />
        <FighterPart geometry={resources.waist} outlineMaterial={outline} position={[0, -0.04, 0]} scale={[0.9, 0.78, 0.9]} toonMaterial={materials.gold} />
        <FighterPart geometry={resources.chest} outlineMaterial={outline} position={[0, 0.28, 0]} scale={[0.8, 0.72, 0.78]} toonMaterial={materials.pink} />
        <mesh castShadow material={materials.white} position={[0, -0.32, 0]}>
          <cylinderGeometry args={[0.29, 0.43, 0.34, 10, 1, true]} />
        </mesh>
        <mesh geometry={star} material={materials.gold} position={[0, 0.28, 0.15]} scale={0.11} />
      </group>

      <IdolArm direction={-1} material={materials.pink} outline={outline} refGroup={refs.leftArm} resources={resources} skin={materials.skin} />
      <IdolArm direction={1} material={materials.pink} microphoneRef={refs.microphone} outline={outline} refGroup={refs.rightArm} resources={resources} skin={materials.skin} />

      <group ref={refs.head} position={[0, 1.78, 0]}>
        <FighterPart geometry={resources.neck} outlineMaterial={outline} position={[0, -0.19, 0]} scale={[0.84, 0.75, 0.84]} toonMaterial={materials.skin} />
        <FighterPart geometry={resources.hairBack} outlineMaterial={outline} position={[0, 0.02, -0.04]} scale={[1.02, 1.08, 1]} toonMaterial={materials.pink} />
        <FighterPart geometry={resources.head} outlineMaterial={outline} position={[0, 0, 0.03]} scale={[0.9, 1, 0.88]} toonMaterial={materials.skin} />
        <FighterPart geometry={resources.hairSpike} outlineMaterial={outline} position={[0.14, 0.14, -0.08]} rotation={[0.2, 0, -0.8]} scale={[0.8, 1.2, 0.8]} toonMaterial={materials.pink} />
        <mesh geometry={star} material={materials.gold} position={[0.13, 0.12, 0.13]} scale={0.07} />
      </group>

      <group ref={refs.starEffect} position={[0.62, 1.22, 0.18]} visible={false}>
        <mesh geometry={star} material={materials.glow} scale={0.3} />
        <mesh material={materials.glow} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.38, 0.025, 6, 32]} />
        </mesh>
      </group>
    </group>
  );
}

function IdolLeg({
  direction,
  material,
  outline,
  refGroup,
  resources,
}: {
  readonly direction: -1 | 1;
  readonly material: Material;
  readonly outline: Material;
  readonly refGroup: IdolRigRefs['leftLeg'];
  readonly resources: FighterResources;
}) {
  return (
    <group ref={refGroup} position={[direction * 0.14, 0.66, 0]}>
      <FighterPart geometry={resources.thigh} outlineMaterial={outline} position={[0, -0.06, 0]} scale={[0.7, 0.7, 0.7]} toonMaterial={material} />
      <FighterPart geometry={resources.shin} outlineMaterial={outline} position={[0, -0.36, 0]} scale={[0.68, 0.7, 0.68]} toonMaterial={material} />
      <FighterPart geometry={resources.foot} outlineMaterial={outline} position={[0, -0.58, 0.06]} scale={[0.92, 0.86, 0.92]} toonMaterial={material} />
    </group>
  );
}

function IdolArm({
  direction,
  material,
  microphoneRef,
  outline,
  refGroup,
  resources,
  skin,
}: {
  readonly direction: -1 | 1;
  readonly material: Material;
  readonly microphoneRef?: IdolRigRefs['microphone'];
  readonly outline: Material;
  readonly refGroup: IdolRigRefs['leftArm'];
  readonly resources: FighterResources;
  readonly skin: Material;
}) {
  return (
    <group ref={refGroup} position={[direction * 0.32, 1.39, 0]}>
      <FighterPart geometry={resources.shoulder} outlineMaterial={outline} scale={[0.72, 0.72, 0.72]} toonMaterial={material} />
      <FighterPart geometry={resources.upperArm} outlineMaterial={outline} position={[direction * 0.03, -0.2, 0]} scale={[0.7, 0.72, 0.7]} toonMaterial={material} />
      <FighterPart geometry={resources.forearm} outlineMaterial={outline} position={[direction * 0.05, -0.43, 0.02]} scale={[0.7, 0.72, 0.7]} toonMaterial={skin} />
      <FighterPart geometry={resources.hand} outlineMaterial={outline} position={[direction * 0.06, -0.59, 0.03]} scale={[0.7, 0.7, 0.7]} toonMaterial={skin} />
      {microphoneRef !== undefined && (
        <group ref={microphoneRef} position={[0.08, -0.72, 0.04]} rotation-z={0.1}>
          <mesh castShadow material={material}>
            <cylinderGeometry args={[0.025, 0.035, 0.48, 8]} />
          </mesh>
          <mesh castShadow material={material} position={[0, 0.27, 0]} scale={[1.8, 1.3, 1.8]}>
            <sphereGeometry args={[0.05, 10, 8]} />
          </mesh>
        </group>
      )}
    </group>
  );
}
