import type { Group } from 'three';
import {
  ArmourPlate,
  BoneSpike,
  RageCrack,
  VorghArm,
  VorghLeg,
} from './VorghParts';

export type VorghJointName =
  | 'root' | 'torso' | 'head'
  | 'frontArm' | 'backArm' | 'frontForearm' | 'backForearm'
  | 'frontLeg' | 'backLeg';
export type VorghJoints = Record<VorghJointName, Group | null>;
export type SetVorghJoint = (name: VorghJointName, node: Group | null) => void;

const ARMOUR = '#281418';
const CRIMSON = '#741d25';
const SKIN = '#7f4f45';
const DARK = '#080608';

export function VorghBody({ setJoint }: {
  readonly setJoint: SetVorghJoint;
}) {
  return (
    <group ref={(node) => setJoint('root', node)}>
      <VorghLeg name="backLeg" setJoint={setJoint} x={-0.18} depth={-0.08} dark />
      <VorghLeg name="frontLeg" setJoint={setJoint} x={0.2} depth={0.06} />

      <group ref={(node) => setJoint('torso', node)} position={[0, 1.42, 0]}>
        <mesh scale={[0.54, 0.72, 0.28]}>
          <dodecahedronGeometry args={[0.82, 0]} />
          <meshStandardMaterial color={ARMOUR} metalness={0.72} roughness={0.3} />
        </mesh>
        <ArmourPlate position={[0.18, 0.12, 0.25]} scale={[0.43, 0.52, 0.1]} color={CRIMSON} />
        <ArmourPlate position={[-0.25, 0.2, 0.23]} scale={[0.26, 0.44, 0.09]} color={DARK} />
        <ArmourPlate position={[0, -0.35, 0.24]} scale={[0.5, 0.16, 0.08]} color="#12090b" />
        <BoneSpike position={[-0.35, 0.47, 0.13]} rotation={-0.62} length={0.36} />
        <BoneSpike position={[0.38, 0.42, 0.1]} rotation={0.7} length={0.28} />
        <RageCrack position={[0.1, 0.17, 0.34]} rotation={-0.45} length={0.42} />
        <RageCrack position={[-0.13, -0.2, 0.34]} rotation={0.72} length={0.3} />
      </group>

      <VorghArm
        name="backArm" forearmName="backForearm"
        setJoint={setJoint} x={-0.46} depth={-0.12} dark
      />
      <VorghArm
        name="frontArm" forearmName="frontForearm"
        setJoint={setJoint} x={0.47} depth={0.12}
      />

      <group ref={(node) => setJoint('head', node)} position={[0.08, 2.18, 0.03]}>
        <mesh scale={[0.34, 0.4, 0.27]}>
          <icosahedronGeometry args={[0.72, 1]} />
          <meshStandardMaterial color={SKIN} roughness={0.62} />
        </mesh>
        <mesh position={[0.09, -0.22, 0.18]} scale={[0.3, 0.16, 0.22]}>
          <dodecahedronGeometry args={[0.66, 0]} />
          <meshStandardMaterial color={DARK} metalness={0.5} roughness={0.38} />
        </mesh>
        <ArmourPlate position={[-0.08, 0.18, 0.23]} scale={[0.38, 0.16, 0.1]} color={DARK} />
        <mesh position={[0.2, 0.08, 0.29]} scale={[0.075, 0.04, 0.035]}>
          <sphereGeometry args={[1, 10, 6]} />
          <meshBasicMaterial color="#ff8a2b" toneMapped={false} />
        </mesh>
        <RageCrack position={[0.03, 0.01, 0.32]} rotation={-0.32} length={0.28} />
        <BoneSpike position={[-0.28, 0.03, 0.05]} rotation={-1.05} length={0.3} />
      </group>

      <ArmourPlate position={[-0.1, 0.96, 0]} scale={[0.72, 0.16, 0.24]} color={CRIMSON} />
    </group>
  );
}
