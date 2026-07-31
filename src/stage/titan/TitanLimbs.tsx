import type { FighterRigRefs } from '../fighterRigRefs';
import { TitanArmorPlate } from './TitanArmorPlate';

const IRON = '#20272c';
const STEEL = '#4a565e';
const JOINT = '#090d10';
const ORANGE = '#ff7417';

export function TitanArm({ refValue, side }: {
  readonly refValue: FighterRigRefs['leftArm'];
  readonly side: -1 | 1;
}) {
  return (
    <group ref={refValue}>
      <TitanArmorPlate
        position={[side * 0.02, -0.08, 0]}
        rotation={[0, side * 0.08, side * 0.06]}
        scale={[0.42, 0.3, 1.7]}
      />
      <Joint position={[0, -0.31, 0]} />
      <mesh castShadow position={[0, -0.48, 0]} scale={[0.16, 0.32, 0.16]}>
        <capsuleGeometry args={[0.5, 1, 6, 12]} />
        <meshPhysicalMaterial color={IRON} metalness={0.86} roughness={0.3} />
      </mesh>
      <TitanArmorPlate
        position={[0, -0.55, 0.12]}
        rotation={[0.08, 0, side * 0.03]}
        scale={[0.34, 0.42, 1.45]}
        color={STEEL}
      />
      <group position={[0, -0.88, 0.04]}>
        <mesh castShadow scale={[0.25, 0.17, 0.28]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial color={JOINT} metalness={0.8} roughness={0.28} />
        </mesh>
        {[-1, 0, 1].map((finger) => (
          <mesh
            key={finger}
            castShadow
            position={[finger * 0.105, -0.13, 0.14]}
            scale={[0.045, 0.12, 0.07]}
          >
            <capsuleGeometry args={[0.5, 0.7, 4, 8]} />
            <meshStandardMaterial color={STEEL} metalness={0.88} roughness={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function TitanLeg({ refValue, side }: {
  readonly refValue: FighterRigRefs['leftLeg'];
  readonly side: -1 | 1;
}) {
  return (
    <group ref={refValue}>
      <mesh castShadow position={[0, -0.18, 0]} scale={[0.17, 0.36, 0.17]}>
        <capsuleGeometry args={[0.5, 1, 6, 12]} />
        <meshPhysicalMaterial color={IRON} metalness={0.84} roughness={0.33} />
      </mesh>
      <TitanArmorPlate position={[0, -0.22, 0.1]} scale={[0.36, 0.42, 1.55]} />
      <Joint position={[0, -0.51, 0]} />
      <TitanArmorPlate
        position={[side * 0.015, -0.68, 0.12]}
        rotation={[0.06, 0, -side * 0.025]}
        scale={[0.34, 0.4, 1.65]}
        color={STEEL}
      />
      <mesh castShadow receiveShadow position={[side * 0.04, -0.91, 0.15]} scale={[0.27, 0.14, 0.4]}>
        <boxGeometry args={[1, 1, 1, 2, 1, 2]} />
        <meshPhysicalMaterial color={JOINT} metalness={0.82} roughness={0.34} clearcoat={0.25} />
      </mesh>
      <mesh position={[side * 0.04, -0.9, 0.55]} rotation={[Math.PI / 2, 0, 0]} scale={[0.12, 0.05, 0.12]}>
        <cylinderGeometry args={[1, 1, 1, 12]} />
        <meshBasicMaterial color={ORANGE} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Joint({ position }: { readonly position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow scale={[0.13, 0.13, 0.13]}>
        <cylinderGeometry args={[1, 1, 1.35, 16]} />
        <meshStandardMaterial color={JOINT} metalness={0.9} roughness={0.24} />
      </mesh>
      <mesh position={[0, 0.1, 0]} scale={[0.055, 0.02, 0.055]}>
        <cylinderGeometry args={[1, 1, 1, 12]} />
        <meshBasicMaterial color={ORANGE} toneMapped={false} />
      </mesh>
    </group>
  );
}
