/* eslint-disable react-hooks/refs -- R3F attaches these refs during render. */
import type { FighterRigRefs } from '../fighterRigRefs';
import { LuckyAccessories } from './LuckyAccessories';

export function LuckyBody({ refs }: { readonly refs: FighterRigRefs }) {
  return (
    <group ref={refs.root}>
      <group ref={refs.torso}>
        <mesh scale={[0.32, 0.5, 0.2]}>
          <capsuleGeometry args={[0.5, 1, 5, 10]} />
          <meshStandardMaterial color="#101713" roughness={0.62} />
        </mesh>
        <mesh position={[0.11, 0.05, 0.2]} rotation={[0, 0, -0.2]} scale={[0.34, 0.54, 0.04]}>
          <boxGeometry />
          <meshStandardMaterial color="#164d36" roughness={0.52} />
        </mesh>
        <mesh position={[-0.21, -0.36, 0.08]} rotation={[0, 0, 0.18]} scale={[0.25, 0.58, 0.05]}>
          <boxGeometry />
          <meshStandardMaterial color="#0a0d0c" />
        </mesh>
        <ProbabilitySigil />
      </group>

      <group ref={refs.head}>
        <mesh scale={[0.23, 0.28, 0.22]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color="#b87b66" roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.14, -0.03]} scale={[0.25, 0.17, 0.24]}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color="#171512" />
        </mesh>
        <mesh position={[0.08, 0.01, 0.21]} scale={[0.055, 0.025, 0.018]}>
          <boxGeometry />
          <meshBasicMaterial color="#e6bd4f" toneMapped={false} />
        </mesh>
      </group>

      <Limb refs={refs} side="left" />
      <Limb refs={refs} side="right" />
      <Leg refs={refs} side="left" />
      <Leg refs={refs} side="right" />
      <LuckyAccessories />

      <group ref={refs.leftSword} />
      <group ref={refs.rightSword} />
      <group ref={refs.mouthSword} />
      <LuckyEffects refs={refs} />
    </group>
  );
}

function Limb({ refs, side }: {
  readonly refs: FighterRigRefs;
  readonly side: 'left' | 'right';
}) {
  const left = side === 'left';
  return (
    <group ref={left ? refs.leftArm : refs.rightArm}>
      <mesh position={[0, -0.25, 0]} scale={[0.11, 0.38, 0.11]}>
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshStandardMaterial color={left ? '#0d1712' : '#1c503a'} />
      </mesh>
      <mesh position={[0, -0.57, 0]} scale={[0.1, 0.3, 0.1]}>
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshStandardMaterial color="#b87b66" />
      </mesh>
    </group>
  );
}

function Leg({ refs, side }: {
  readonly refs: FighterRigRefs;
  readonly side: 'left' | 'right';
}) {
  const left = side === 'left';
  return (
    <group ref={left ? refs.leftLeg : refs.rightLeg}>
      <mesh position={[0, -0.18, 0]} scale={[0.15, 0.46, 0.14]}>
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshStandardMaterial color="#101713" />
      </mesh>
      <mesh position={[0, -0.62, 0.04]} scale={[0.13, 0.4, 0.12]}>
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshStandardMaterial color="#171b18" />
      </mesh>
      <mesh position={[0.09, -0.89, 0.13]} scale={[0.17, 0.1, 0.32]}>
        <boxGeometry />
        <meshStandardMaterial color="#090b0a" metalness={0.25} />
      </mesh>
    </group>
  );
}

function ProbabilitySigil() {
  return (
    <group position={[0.12, 0.08, 0.25]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.13, 0.018, 6, 16]} />
        <meshBasicMaterial color="#dfb94e" toneMapped={false} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 4]} scale={[0.018, 0.16, 0.018]}>
        <boxGeometry />
        <meshBasicMaterial color="#8f1930" toneMapped={false} />
      </mesh>
    </group>
  );
}

function LuckyEffects({ refs }: { readonly refs: FighterRigRefs }) {
  return (
    <>
      <group ref={refs.slash}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.72, 0.035, 5, 24, Math.PI * 1.35]} />
          <meshBasicMaterial color="#e2ba4b" transparent opacity={0.86} toneMapped={false} />
        </mesh>
      </group>
      <group ref={refs.projectile}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.035, 12]} />
          <meshBasicMaterial color="#d6ad45" toneMapped={false} />
        </mesh>
      </group>
      <group ref={refs.aura}>
        {[0, 1, 2].map((index) => (
          <mesh key={index} rotation={[Math.PI / 2, 0, index * 0.7]} scale={1 + index * 0.28}>
            <torusGeometry args={[0.52, 0.025, 5, 18]} />
            <meshBasicMaterial color={index === 2 ? '#9e1d37' : '#d9b149'} transparent opacity={0.62} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <group ref={refs.echoes}>
        {[-1, 0, 1].map((index) => (
          <mesh key={index} position={[index * 0.32, 1.25 + Math.abs(index) * 0.2, 0]}>
            <octahedronGeometry args={[0.1]} />
            <meshBasicMaterial color={index === 0 ? '#f2ce68' : '#9f2036'} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </>
  );
}
