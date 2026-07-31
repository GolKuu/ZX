const METAL = '#151b1f';
const EDGE = '#6f7b82';
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
      <ArmorFasteners />
    </group>
  );
}

function Hydraulic({ side }: { readonly side: -1 | 1 }) {
  return (
    <group position={[side * 0.51, 1.57, -0.08]} rotation={[0.18, 0, side * 0.28]}>
      {[-1, 1].map((track) => (
        <group key={track} position={[track * 0.055, 0, 0]}>
          <mesh castShadow scale={[0.035, 0.31, 0.035]}>
            <cylinderGeometry args={[1, 1, 1, 12]} />
            <meshStandardMaterial color={EDGE} metalness={0.96} roughness={0.16} />
          </mesh>
          <mesh castShadow position={[0, -0.18, 0]} scale={[0.065, 0.17, 0.065]}>
            <cylinderGeometry args={[1, 1, 1, 12]} />
            <meshPhysicalMaterial color={METAL} metalness={0.88} roughness={0.3} clearcoat={0.24} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.25, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.09, 0.045, 0.09]}>
        <cylinderGeometry args={[1, 1, 1, 16]} />
        <meshBasicMaterial color={ORANGE} toneMapped={false} />
      </mesh>
    </group>
  );
}

function BackVents() {
  return (
    <group position={[0, 1.48, -0.31]} rotation={[-0.18, 0, 0]}>
      {[-1, 1].map((x) => (
        <group key={x} position={[x * 0.25, 0.05, 0]} rotation={[0, 0, -x * 0.12]}>
          <mesh castShadow scale={[0.13, 0.29, 0.12]}>
            <cylinderGeometry args={[0.72, 1, 1, 8]} />
            <meshStandardMaterial color={METAL} metalness={0.86} roughness={0.38} />
          </mesh>
          <mesh position={[0, 0.18, 0]} scale={[0.075, 0.025, 0.075]}>
            <cylinderGeometry args={[1, 1, 1, 16]} />
            <meshBasicMaterial color="#ff9b3d" toneMapped={false} />
          </mesh>
        </group>
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
        <mesh
          key={index}
          castShadow
          position={[index * 0.16, 0, Math.abs(index) * -0.018]}
          rotation={[0, 0, index * -0.035]}
          scale={[0.09, 0.1, 0.075]}
        >
          <dodecahedronGeometry />
          <meshPhysicalMaterial
            color={index === 0 ? ORANGE : EDGE}
            emissive={index === 0 ? '#6a1f00' : '#000000'}
            emissiveIntensity={index === 0 ? 1.4 : 0}
            metalness={0.86}
            roughness={0.25}
            clearcoat={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

function ArmorFasteners() {
  return (
    <group position={[0, 1.3, 0.39]}>
      {[-1, 1].flatMap((side) => (
        [-1, 1].map((row) => (
          <mesh
            key={`${side}:${row}`}
            position={[side * 0.32, row * 0.23, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[0.025, 0.018, 0.025]}
          >
            <cylinderGeometry args={[1, 1, 1, 10]} />
            <meshStandardMaterial color={row > 0 ? EDGE : DAMAGE} metalness={0.95} roughness={0.2} />
          </mesh>
        ))
      ))}
    </group>
  );
}
