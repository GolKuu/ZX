'use client';

import { ARENA_RADIUS } from './arenaData';

const FACE_PANELS = Array.from({ length: 20 }, (_, index) => -9.5 + index);

export function ArenaPlatform2D() {
  return (
    <group>
      <group position-z={-0.42}>
        <mesh position={[0, -0.48, 0]}>
          <planeGeometry args={[20, 0.96]} />
          <meshBasicMaterial color="#4d7763" fog={false} />
        </mesh>
        <mesh position={[0, -0.04, 0.02]}>
          <planeGeometry args={[20, 0.12]} />
          <meshBasicMaterial color="#fff0ae" fog={false} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.17, 0.01]}>
          <planeGeometry args={[20, 0.08]} />
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
        <planeGeometry args={[20, 5.8]} />
        <shadowMaterial color="#162722" opacity={0.42} transparent />
      </mesh>

      <ArenaBoundaryPost x={-ARENA_RADIUS} />
      <ArenaBoundaryPost x={ARENA_RADIUS} />
    </group>
  );
}

function ArenaBoundaryPost({ x }: { readonly x: number }) {
  return (
    <group position={[x, 0.66, -0.36]}>
      <mesh>
        <planeGeometry args={[0.12, 1.45]} />
        <meshBasicMaterial color="#586c61" fog={false} />
      </mesh>
      <mesh position={[0, 0.76, 0.01]}>
        <planeGeometry args={[0.32, 0.2]} />
        <meshBasicMaterial color="#e5d7a3" fog={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.77, 0.01]}>
        <planeGeometry args={[0.34, 0.12]} />
        <meshBasicMaterial color="#75a061" fog={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
