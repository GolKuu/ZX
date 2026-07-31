import type { SetVorghJoint, VorghJointName } from './VorghBody';

const DARK = '#090608';
const ARMOUR = '#2a171b';
const CRIMSON = '#781e27';
const BONE = '#d6bf95';
const RAGE = '#ff5417';

export function VorghLeg({
  dark = false, depth, name, setJoint, x,
}: {
  readonly dark?: boolean;
  readonly depth: number;
  readonly name: 'frontLeg' | 'backLeg';
  readonly setJoint: SetVorghJoint;
  readonly x: number;
}) {
  return (
    <group ref={(node) => setJoint(name, node)} position={[x, 0.98, depth]}>
      <mesh position={[0, -0.34, 0]} scale={[0.25, 0.52, 0.22]}>
        <capsuleGeometry args={[0.5, 0.72, 5, 8]} />
        <meshStandardMaterial color={dark ? DARK : ARMOUR} metalness={0.55} roughness={0.38} />
      </mesh>
      <ArmourPlate position={[0.07, -0.38, 0.18]} scale={[0.27, 0.43, 0.08]} color={dark ? '#1c0c10' : CRIMSON} />
      <mesh position={[0.1, -0.87, 0.07]} scale={[0.42, 0.18, 0.3]}>
        <dodecahedronGeometry args={[0.62, 0]} />
        <meshStandardMaterial color={DARK} metalness={0.65} roughness={0.3} />
      </mesh>
      {!dark && <RageCrack position={[0.1, -0.36, 0.28]} rotation={0.22} length={0.28} />}
    </group>
  );
}

export function VorghArm({
  dark = false, depth, forearmName, name, setJoint, x,
}: {
  readonly dark?: boolean;
  readonly depth: number;
  readonly forearmName: 'frontForearm' | 'backForearm';
  readonly name: 'frontArm' | 'backArm';
  readonly setJoint: SetVorghJoint;
  readonly x: number;
}) {
  return (
    <group ref={(node) => setJoint(name, node)} position={[x, 1.78, depth]}>
      <mesh position={[0, -0.24, 0]} scale={[0.24, 0.4, 0.22]}>
        <capsuleGeometry args={[0.5, 0.62, 5, 8]} />
        <meshStandardMaterial color={dark ? DARK : ARMOUR} metalness={0.62} roughness={0.32} />
      </mesh>
      <ArmourPlate position={[0.03, 0.06, 0.06]} scale={[0.36, 0.23, 0.3]} color={dark ? '#1c0c10' : CRIMSON} />
      <BoneSpike position={[0, 0.2, 0]} rotation={dark ? -0.7 : 0.7} length={0.27} />
      <group ref={(node) => setJoint(forearmName, node)} position={[0, -0.58, 0]}>
        <mesh position={[0, -0.2, 0]} scale={[0.26, 0.42, 0.23]}>
          <capsuleGeometry args={[0.48, 0.65, 5, 8]} />
          <meshStandardMaterial color={dark ? '#321016' : CRIMSON} metalness={0.68} roughness={0.28} />
        </mesh>
        <ArmourPlate position={[0.08, -0.2, 0.2]} scale={[0.24, 0.36, 0.07]} color={DARK} />
        <ClawGauntlet y={-0.52} />
      </group>
    </group>
  );
}

function ClawGauntlet({ y }: { readonly y: number }) {
  return (
    <group position={[0.1, y, 0.08]} rotation-z={-0.16}>
      {[0, 0.09, 0.18].map((x, index) => (
        <mesh key={x} position={[x, -0.19 - index * 0.025, 0]} rotation-z={-0.12}>
          <coneGeometry args={[0.035, 0.48 - index * 0.04, 6]} />
          <meshStandardMaterial color={BONE} metalness={0.28} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

export function ArmourPlate({
  color, position, scale,
}: {
  readonly color: string;
  readonly position: [number, number, number];
  readonly scale: [number, number, number];
}) {
  return (
    <mesh position={position} scale={scale}>
      <dodecahedronGeometry args={[0.72, 0]} />
      <meshStandardMaterial color={color} metalness={0.76} roughness={0.26} />
    </mesh>
  );
}

export function RageCrack({
  length, position, rotation,
}: {
  readonly length: number;
  readonly position: [number, number, number];
  readonly rotation: number;
}) {
  return (
    <mesh position={position} rotation-z={rotation}>
      <boxGeometry args={[0.025, length, 0.018]} />
      <meshStandardMaterial
        color={RAGE} emissive={RAGE} emissiveIntensity={5}
        roughness={0.18} toneMapped={false}
      />
    </mesh>
  );
}

export function BoneSpike({
  length, position, rotation,
}: {
  readonly length: number;
  readonly position: [number, number, number];
  readonly rotation: number;
}) {
  return (
    <mesh position={position} rotation-z={rotation}>
      <coneGeometry args={[0.07, length, 7]} />
      <meshStandardMaterial color={BONE} roughness={0.4} />
    </mesh>
  );
}

export type { VorghJointName };
