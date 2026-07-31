const METAL = '#20272b';
const EDGE = '#68737a';
const DAMAGE = '#120b08';
const ORANGE = '#ff7417';

/** Secondary forms that sell scale without external textures or models. */
export function TitanDetails() {
  return (
    <group>
      <Hydraulic side={-1} />
      <Hydraulic side={1} />
      <BackVents />
      <BattleDamage />
      <BeltMechanics />
    </group>
  );
}

function Hydraulic({ side }: { readonly side: -1 | 1 }) {
  return (
    <group position={[side * 0.55, 1.58, -0.04]} rotation={[0, 0, side * 0.18]}>
      <mesh scale={[0.055, 0.34, 0.055]}>
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshStandardMaterial color={EDGE} metalness={0.92} roughness={0.23} />
      </mesh>
      <mesh position={[0, -0.19, 0]} scale={[0.085, 0.18, 0.085]}>
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshStandardMaterial color={METAL} metalness={0.84} roughness={0.33} />
      </mesh>
      <mesh position={[0, 0.22, 0]} scale={[0.09, 0.055, 0.09]}>
        <cylinderGeometry args={[1, 1, 1, 10]} />
        <meshBasicMaterial color={ORANGE} toneMapped={false} />
      </mesh>
    </group>
  );
}

function BackVents() {
  return (
    <group position={[0, 1.48, -0.36]}>
      {[-1, 0, 1].map((x) => (
        <mesh key={x} position={[x * 0.18, 0, 0]} scale={[0.055, 0.28, 0.04]}>
          <boxGeometry />
          <meshStandardMaterial color={DAMAGE} metalness={0.55} roughness={0.72} />
        </mesh>
      ))}
    </group>
  );
}

function BattleDamage() {
  return (
    <group position={[0, 1.39, 0.43]}>
      <mesh position={[-0.24, 0.2, 0]} rotation={[0, 0, -0.72]} scale={[0.16, 0.018, 0.012]}>
        <boxGeometry />
        <meshBasicMaterial color={DAMAGE} />
      </mesh>
      <mesh position={[-0.18, 0.11, 0]} rotation={[0, 0, 0.48]} scale={[0.11, 0.015, 0.012]}>
        <boxGeometry />
        <meshBasicMaterial color={DAMAGE} />
      </mesh>
      <mesh position={[0.31, -0.18, 0]} rotation={[0, 0, -0.24]} scale={[0.13, 0.02, 0.012]}>
        <boxGeometry />
        <meshBasicMaterial color="#8a3b1c" />
      </mesh>
    </group>
  );
}

function BeltMechanics() {
  return (
    <group position={[0, 0.78, 0.22]}>
      {[-2, -1, 0, 1, 2].map((index) => (
        <mesh key={index} position={[index * 0.17, 0, Math.abs(index) * -0.015]} scale={[0.075, 0.1, 0.08]}>
          <boxGeometry />
          <meshStandardMaterial
            color={index === 0 ? ORANGE : EDGE}
            emissive={index === 0 ? '#6a1f00' : '#000000'}
            emissiveIntensity={index === 0 ? 1.4 : 0}
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}
