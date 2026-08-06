'use client';

export function StormSunsetFloor() {
  return (
    <group>
      <mesh position={[0, -0.16, -7]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[46, 34]} />
        <meshStandardMaterial color="#171926" roughness={0.88} metalness={0.14} />
      </mesh>
      <mesh position={[0, 0.012, -6.8]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[1.3, 1.48, 96]} />
        <meshBasicMaterial color="#ffb15e" toneMapped={false} transparent opacity={0.82} />
      </mesh>
      <mesh position={[0, -0.5, -0.55]}>
        <boxGeometry args={[32, 1, 1.05]} />
        <meshStandardMaterial color="#242638" roughness={0.76} metalness={0.22} />
      </mesh>
      <mesh position={[0, 0.02, -0.02]}>
        <boxGeometry args={[32, 0.1, 0.12]} />
        <meshBasicMaterial color="#ffbf76" toneMapped={false} />
      </mesh>
    </group>
  );
}
