'use client';

const STONE_ROWS = [-0.25, -0.72, -1.28, -1.95, -2.78, -3.78, -4.95, -6.35, -8, -9.9, -12.1];
const STONE_SEAMS = Array.from({ length: 19 }, (_, index) => -9 + index);
const MOSS_PATCHES = Array.from({ length: 28 }, (_, index) => ({
  x: -9.4 + ((index * 23) % 47) * 0.4,
  z: -0.35 - ((index * 31) % 45) * 0.25,
  width: 0.18 + (index % 4) * 0.1,
}));

export function RetroGridFloor() {
  return (
    <group position-y={-0.006}>
      <mesh position={[0, 0, -5.15]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[26, 15.4]} />
        <meshBasicMaterial color="#536e63" fog={false} />
      </mesh>
      <mesh position={[0, 0.006, -4.6]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[20.5, 12.8]} />
        <meshBasicMaterial color="#849584" fog={false} />
      </mesh>

      {STONE_SEAMS.map((x, index) => (
        <mesh key={x} position={[x, 0.014, -5]} rotation-x={-Math.PI / 2} rotation-z={(index % 3 - 1) * 0.006}>
          <planeGeometry args={[index % 4 === 0 ? 0.055 : 0.025, 13.5]} />
          <meshBasicMaterial color={index % 4 === 0 ? '#455b54' : '#65776c'} depthWrite={false} fog={false} />
        </mesh>
      ))}

      {STONE_ROWS.map((z, index) => (
        <mesh key={z} position={[0, 0.018, z]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[22, index % 3 === 0 ? 0.075 : 0.04]} />
          <meshBasicMaterial color={index % 3 === 0 ? '#415b55' : '#647a6e'} depthWrite={false} fog={false} />
        </mesh>
      ))}

      {MOSS_PATCHES.map((patch, index) => (
        <mesh key={`${patch.x}-${patch.z}`} position={[patch.x, 0.024, patch.z]} rotation-x={-Math.PI / 2} rotation-z={(index % 5) * 0.2}>
          <planeGeometry args={[patch.width, 0.045 + (index % 3) * 0.025]} />
          <meshBasicMaterial color={index % 3 === 0 ? '#8fa34f' : '#5f8b55'} depthWrite={false} opacity={0.72} transparent />
        </mesh>
      ))}

      <mesh position={[0, 0.026, -12.65]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[28, 0.18]} />
        <meshBasicMaterial color="#d7e8c5" depthWrite={false} opacity={0.72} toneMapped={false} transparent />
      </mesh>
    </group>
  );
}
