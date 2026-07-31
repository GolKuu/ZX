/* eslint-disable react-hooks/refs -- R3F attaches these refs during render. */
import type { FighterRigRefs } from '../fighterRigRefs';
import { TitanArmorPlate } from './TitanArmorPlate';
import { TitanDetails } from './TitanDetails';
import { TitanEffects } from './TitanEffects';
import { TitanArm, TitanLeg } from './TitanLimbs';

const DARK = '#0d1114';
const ORANGE = '#ff7417';

export function TitanBody({ refs }: { readonly refs: FighterRigRefs }) {
  return (
    <group ref={refs.root}>
      <group ref={refs.torso}>
        <mesh castShadow receiveShadow scale={[0.48, 0.53, 0.28]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial color={DARK} metalness={0.82} roughness={0.36} clearcoat={0.2} />
        </mesh>
        <TitanArmorPlate position={[0, 0.08, 0.31]} scale={[0.78, 0.72, 0.72]} />
        <TitanArmorPlate position={[-0.38, 0.24, 0.14]} rotation={[0, -0.35, 0.15]} scale={[0.4, 0.37, 1.25]} />
        <TitanArmorPlate position={[0.38, 0.24, 0.14]} rotation={[0, 0.35, -0.15]} scale={[0.4, 0.37, 1.25]} />
        <TitanArmorPlate position={[0, -0.32, 0.24]} scale={[0.5, 0.2, 0.9]} color="#20282d" inset />
        <mesh position={[0, 0.06, 0.43]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.145, 0.034, 12, 48]} />
          <meshBasicMaterial color={ORANGE} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.06, 0.45]} scale={[0.1, 0.1, 0.025]}>
          <cylinderGeometry args={[1, 1, 1, 24]} />
          <meshBasicMaterial color="#ffd18b" toneMapped={false} />
        </mesh>
      </group>

      <group ref={refs.head}>
        <mesh castShadow scale={[0.27, 0.24, 0.26]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshPhysicalMaterial color={DARK} metalness={0.86} roughness={0.25} clearcoat={0.3} />
        </mesh>
        <TitanArmorPlate position={[0, 0.18, 0]} scale={[0.5, 0.18, 1.35]} />
        <TitanArmorPlate position={[-0.22, -0.05, 0.12]} rotation={[0, -0.28, -0.08]} scale={[0.18, 0.34, 1]} />
        <TitanArmorPlate position={[0.22, -0.05, 0.12]} rotation={[0, 0.28, 0.08]} scale={[0.18, 0.34, 1]} />
        <mesh position={[0, 0.01, 0.285]} scale={[0.22, 0.036, 0.018]}>
          <boxGeometry args={[1, 1, 1, 2, 1, 1]} />
          <meshBasicMaterial color={ORANGE} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.18, 0.18]} rotation={[Math.PI / 2, 0, 0]} scale={[0.13, 0.04, 0.13]}>
          <cylinderGeometry args={[1, 0.72, 1, 6]} />
          <meshStandardMaterial color="#505b62" metalness={0.92} roughness={0.24} />
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
