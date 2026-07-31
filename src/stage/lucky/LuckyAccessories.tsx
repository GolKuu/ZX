export function LuckyAccessories() {
  return (
    <>
      <group position={[0, 1.34, 0]}>
        <mesh position={[-0.18, 0.42, 0.02]} rotation={[0.08, 0.18, -0.42]} scale={[0.11, 0.31, 0.08]}>
          <boxGeometry />
          <meshStandardMaterial color="#b58c34" metalness={0.72} roughness={0.3} />
        </mesh>
        <mesh position={[0.1, -0.55, 0.01]} rotation={[0, 0, -0.12]} scale={[0.35, 0.06, 0.21]}>
          <boxGeometry />
          <meshStandardMaterial color="#8f1b31" metalness={0.3} roughness={0.42} />
        </mesh>
        <JacketTail x={-0.19} length={0.76} rotation={0.12} color="#0a1410" />
        <JacketTail x={0.18} length={0.94} rotation={-0.19} color="#154d37" />
      </group>
      <group position={[-0.43, 1.05, 0.03]}>
        <Token scale={0.62} />
      </group>
      <group position={[0.38, 0.92, 0.02]}>
        <Token scale={0.48} />
      </group>
    </>
  );
}

function JacketTail({
  color,
  length,
  rotation,
  x,
}: {
  readonly color: string;
  readonly length: number;
  readonly rotation: number;
  readonly x: number;
}) {
  return (
    <mesh
      position={[x, -0.45 - length * 0.25, -0.03]}
      rotation={[0.08, 0, rotation]}
      scale={[0.24, length, 0.055]}
    >
      <boxGeometry />
      <meshStandardMaterial color={color} roughness={0.68} />
    </mesh>
  );
}

function Token({ scale }: { readonly scale: number }) {
  return (
    <group scale={scale}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.025, 10]} />
        <meshStandardMaterial color="#d3a942" metalness={0.82} roughness={0.24} />
      </mesh>
      <mesh position={[0, 0, 0.018]} rotation={[0, 0, Math.PI / 4]} scale={[0.025, 0.13, 0.02]}>
        <boxGeometry />
        <meshBasicMaterial color="#71172a" toneMapped={false} />
      </mesh>
    </group>
  );
}
