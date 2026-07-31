/* eslint-disable react-hooks/refs -- R3F attaches these refs during render. */
import type { FighterRigRefs } from '../fighterRigRefs';
import { TitanDetails } from './TitanDetails';

const METAL = '#252c31';
const DARK = '#0d1114';
const STEEL = '#465057';
const ORANGE = '#ff7417';

export function TitanBody({ refs }: { readonly refs: FighterRigRefs }) {
  return (
    <group ref={refs.root}>
      <group ref={refs.torso}>
        <mesh scale={[0.58, 0.62, 0.34]}>
          <boxGeometry args={[1, 1, 1, 2, 2, 1]} />
          <meshStandardMaterial color={METAL} metalness={0.78} roughness={0.34} />
        </mesh>
        <Plate position={[0, 0.08, 0.37]} scale={[0.48, 0.43, 0.07]} />
        <Plate position={[-0.49, 0.26, 0.08]} scale={[0.22, 0.2, 0.3]} />
        <Plate position={[0.49, 0.26, 0.08]} scale={[0.22, 0.2, 0.3]} />
        <mesh position={[0, 0.06, 0.46]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.16, 0.045, 8, 24]} />
          <meshBasicMaterial color={ORANGE} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.06, 0.46]} scale={[0.11, 0.11, 0.035]}>
          <cylinderGeometry args={[1, 1, 1, 12]} />
          <meshBasicMaterial color="#ffc05c" toneMapped={false} />
        </mesh>
      </group>

      <group ref={refs.head}>
        <mesh scale={[0.31, 0.27, 0.29]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={DARK} metalness={0.72} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.28]} scale={[0.23, 0.055, 0.035]}>
          <boxGeometry />
          <meshBasicMaterial color={ORANGE} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.27, -0.02]} scale={[0.36, 0.07, 0.34]}>
          <boxGeometry />
          <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.28} />
        </mesh>
      </group>

      <TitanArm refValue={refs.leftArm} side={-1} />
      <TitanArm refValue={refs.rightArm} side={1} />
      <TitanLeg refValue={refs.leftLeg} side={-1} />
      <TitanLeg refValue={refs.rightLeg} side={1} />
      <TitanDetails />

      <group ref={refs.leftSword} />
      <group ref={refs.rightSword} />
      <group ref={refs.mouthSword} />
      <TitanEffects refs={refs} />
    </group>
  );
}

function TitanArm({ refValue, side }: {
  readonly refValue: FighterRigRefs['leftArm'];
  readonly side: -1 | 1;
}) {
  return (
    <group ref={refValue}>
      <mesh position={[0, -0.25, 0]} scale={[0.23, 0.4, 0.23]}>
        <capsuleGeometry args={[0.5, 1, 5, 10]} />
        <meshStandardMaterial color={METAL} metalness={0.72} roughness={0.4} />
      </mesh>
      <Plate position={[side * 0.04, -0.12, 0.12]} scale={[0.25, 0.3, 0.14]} />
      <mesh position={[0, -0.62, 0]} scale={[0.25, 0.36, 0.24]}>
        <capsuleGeometry args={[0.5, 1, 5, 10]} />
        <meshStandardMaterial color={STEEL} metalness={0.82} roughness={0.32} />
      </mesh>
      <mesh position={[0, -0.93, 0.04]} scale={[0.28, 0.22, 0.28]}>
        <boxGeometry />
        <meshStandardMaterial color={DARK} metalness={0.75} />
      </mesh>
    </group>
  );
}

function TitanLeg({ refValue, side }: {
  readonly refValue: FighterRigRefs['leftLeg'];
  readonly side: -1 | 1;
}) {
  return (
    <group ref={refValue}>
      <mesh position={[0, -0.2, 0]} scale={[0.22, 0.43, 0.22]}>
        <capsuleGeometry args={[0.5, 1, 5, 10]} />
        <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.4} />
      </mesh>
      <Plate position={[side * 0.02, -0.48, 0.08]} scale={[0.24, 0.32, 0.2]} />
      <mesh position={[side * 0.08, -0.86, 0.15]} scale={[0.27, 0.14, 0.42]}>
        <boxGeometry />
        <meshStandardMaterial color={DARK} metalness={0.78} roughness={0.38} />
      </mesh>
    </group>
  );
}

function Plate({ position, scale }: {
  readonly position: [number, number, number];
  readonly scale: [number, number, number];
}) {
  return (
    <mesh position={position} scale={scale}>
      <boxGeometry />
      <meshStandardMaterial color={STEEL} metalness={0.88} roughness={0.27} />
    </mesh>
  );
}

function TitanEffects({ refs }: { readonly refs: FighterRigRefs }) {
  return (
    <>
      <group ref={refs.slash}><ImpactRing /></group>
      <group ref={refs.projectile}><ImpactRing /></group>
      <group ref={refs.aura}>
        {[0, 1, 2].map((index) => (
          <mesh key={index} rotation={[Math.PI / 2, 0, 0]} scale={1 + index * 0.25}>
            <torusGeometry args={[0.58, 0.035, 6, 24]} />
            <meshBasicMaterial color={ORANGE} transparent opacity={0.55} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <group ref={refs.echoes}>
        {[-1, 0, 1].map((x) => (
          <mesh key={x} position={[x * 0.42, 0.08, 0]} rotation={[0, 0, x * 0.3]}>
            <boxGeometry args={[0.3, 0.05, 0.4]} />
            <meshBasicMaterial color={x === 0 ? '#ffc45c' : ORANGE} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </>
  );
}

function ImpactRing() {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.55, 0.055, 6, 24]} />
      <meshBasicMaterial color={ORANGE} transparent opacity={0.82} toneMapped={false} />
    </mesh>
  );
}
