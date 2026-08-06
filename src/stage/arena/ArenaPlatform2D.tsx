'use client';

const FACE_PANELS = Array.from({ length: 32 }, (_, index) => -15.5 + index);

export function ArenaPlatform2D() {
  return (
    <group>
      <group position-z={-0.42}>
        <mesh position={[0, -0.48, 0]}>
          <planeGeometry args={[32, 0.96]} />
          <meshBasicMaterial color="#4d7763" fog={false} />
        </mesh>
        <mesh position={[0, -0.04, 0.02]}>
          <planeGeometry args={[32, 0.12]} />
          <meshBasicMaterial color="#fff0ae" fog={false} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.17, 0.01]}>
          <planeGeometry args={[32, 0.08]} />
          <meshBasicMaterial color="#9dcf5b" fog={false} toneMapped={false} />
        </mesh>

        {FACE_PANELS.map((x, index) => (
          <group key={x} position={[x, -0.52, 0.02]}>
            <mesh>
              <planeGeometry args={[0.42, 0.22]} />
              <meshBasicMaterial
                color={index % 2 === 0 ? '#789484' : '#628276'}
                fog={false}
              />
            </mesh>
            <mesh position={[0, -0.35, 0]}>
              <planeGeometry args={[0.72, 0.035]} />
              <meshBasicMaterial color={index % 4 === 0 ? '#d3d96d' : '#427a67'} fog={false} />
            </mesh>
          </group>
        ))}
      </group>

      <mesh position={[0, -0.012, 0]} receiveShadow rotation-x={-Math.PI / 2}>
        <planeGeometry args={[32, 8.5]} />
        <shadowMaterial color="#162722" opacity={0.42} transparent />
      </mesh>

    </group>
  );
}
