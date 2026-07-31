import type { Group } from 'three';

export type VorghJointName =
  | 'root' | 'torso' | 'head'
  | 'frontArm' | 'backArm' | 'frontForearm' | 'backForearm'
  | 'frontLeg' | 'backLeg';
export type VorghJoints = Record<VorghJointName, Group | null>;
type SetJoint = (name: VorghJointName, node: Group | null) => void;

const DARK = '#090607';
const ARMOUR = '#2b1618';
const CRIMSON = '#761d21';
const BONE = '#d2b68d';
const SKIN = '#9b6754';
const RAGE = '#ff5a16';

export function VorghBody({ setJoint }: { readonly setJoint: SetJoint }) {
  return (
    <group ref={(node) => setJoint('root', node)}>
      <Leg name="backLeg" setJoint={setJoint} x={-0.17} dark />
      <Leg name="frontLeg" setJoint={setJoint} x={0.2} />
      <group ref={(node) => setJoint('torso', node)} position={[0, 1.34, 0]}>
        <Pixel size={[0.78, 0.92, 0.18]} color={ARMOUR} />
        <Pixel position={[0.26, 0.26, 0.11]} size={[0.3, 0.22, 0.08]} color={CRIMSON} />
        <Pixel position={[-0.28, 0.36, 0.11]} size={[0.24, 0.12, 0.08]} color={BONE} />
        <Crack position={[0.1, 0.08, 0.15]} rotation={-0.55} />
        <Crack position={[-0.18, -0.15, 0.15]} rotation={0.8} />
      </group>
      <Arm name="backArm" forearmName="backForearm" setJoint={setJoint} x={-0.43} dark />
      <Arm name="frontArm" forearmName="frontForearm" setJoint={setJoint} x={0.43} />
      <group ref={(node) => setJoint('head', node)} position={[0.08, 2.12, 0]}>
        <Pixel size={[0.44, 0.48, 0.18]} color={SKIN} />
        <Pixel position={[-0.08, 0.22, 0.02]} size={[0.42, 0.15, 0.2]} color={DARK} />
        <Pixel position={[0.17, 0.08, 0.11]} size={[0.07, 0.055, 0.04]} color={RAGE} />
        <Pixel position={[0.04, 0.02, 0.13]} size={[0.025, 0.24, 0.025]} color={CRIMSON} rotationZ={-0.35} />
        <Pixel position={[-0.2, -0.18, 0.06]} size={[0.14, 0.14, 0.16]} color={BONE} />
      </group>
      <Pixel position={[-0.13, 0.96, -0.02]} size={[0.76, 0.18, 0.2]} color={CRIMSON} />
    </group>
  );
}

function Leg({
  dark = false,
  name,
  setJoint,
  x,
}: {
  readonly dark?: boolean;
  readonly name: 'frontLeg' | 'backLeg';
  readonly setJoint: SetJoint;
  readonly x: number;
}) {
  return (
    <group ref={(node) => setJoint(name, node)} position={[x, 0.96, 0]}>
      <Pixel position={[0, -0.36, 0]} size={[0.32, 0.76, 0.2]} color={dark ? DARK : ARMOUR} />
      <Pixel position={[0.08, -0.82, 0.05]} size={[0.42, 0.22, 0.24]} color={DARK} />
      {!dark && <Crack position={[0.08, -0.35, 0.13]} rotation={0.25} />}
    </group>
  );
}

function Arm({
  dark = false,
  forearmName,
  name,
  setJoint,
  x,
}: {
  readonly dark?: boolean;
  readonly forearmName: 'frontForearm' | 'backForearm';
  readonly name: 'frontArm' | 'backArm';
  readonly setJoint: SetJoint;
  readonly x: number;
}) {
  return (
    <group ref={(node) => setJoint(name, node)} position={[x, 1.7, 0]}>
      <Pixel position={[0, -0.28, 0]} size={[0.32, 0.62, 0.2]} color={dark ? DARK : ARMOUR} />
      <group ref={(node) => setJoint(forearmName, node)} position={[0, -0.58, 0]}>
        <Pixel position={[0, -0.22, 0]} size={[0.34, 0.52, 0.22]} color={dark ? '#311113' : CRIMSON} />
        <Pixel position={[0.08, -0.52, 0.04]} size={[0.34, 0.22, 0.24]} color={DARK} />
        <Claw y={-0.72} length={0.34} />
      </group>
    </group>
  );
}

function Claw({ length, y }: { readonly length: number; readonly y: number }) {
  return (
    <group position={[0.13, y, 0.05]} rotation-z={-0.18}>
      {[0, 0.09, 0.18].map((x) => (
        <Pixel key={x} position={[x, -0.08, 0]} size={[0.045, length, 0.05]} color={BONE} />
      ))}
    </group>
  );
}

function Crack({ position, rotation }: {
  readonly position: [number, number, number];
  readonly rotation: number;
}) {
  return <Pixel position={position} rotationZ={rotation} size={[0.035, 0.3, 0.025]} color={RAGE} />;
}

function Pixel({
  color,
  position = [0, 0, 0],
  rotationZ = 0,
  size,
}: {
  readonly color: string;
  readonly position?: [number, number, number];
  readonly rotationZ?: number;
  readonly size: [number, number, number];
}) {
  return (
    <mesh position={position} rotation-z={rotationZ}>
      <boxGeometry args={size} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}
