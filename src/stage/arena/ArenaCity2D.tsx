'use client';

const BUILDINGS = [
  [-9.2, 1.15, 3.2], [-7.7, 1.4, 4.1], [-6, 1.05, 2.7],
  [-4.7, 1.55, 4.8], [-2.8, 1.2, 3.4], [-1.35, 1.7, 5.2],
  [0.7, 1.3, 3.6], [2.25, 1.55, 4.5], [4.2, 1.1, 3.2],
  [5.65, 1.7, 5], [7.7, 1.25, 3.8], [9.25, 1.4, 4.4],
] as const;

export function ArenaCity2D() {
  return (
    <group position={[0, -0.65, -15.9]} renderOrder={-13}>
      {BUILDINGS.map(([x, width, height], buildingIndex) => (
        <group key={`${x}-${height}`} position={[x, height * 0.5, 0]}>
          <mesh>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial color="#17162d" depthWrite={false} fog={false} />
          </mesh>
          <mesh position={[0, height * 0.5 + 0.22, 0]}>
            <planeGeometry args={[width * 0.72, 0.44]} />
            <meshBasicMaterial color="#17162d" depthWrite={false} fog={false} />
          </mesh>
          {[0.26, 0.52, 0.78].map((heightRatio, windowIndex) => (
            <mesh
              key={heightRatio}
              position={[
                windowIndex % 2 === 0 ? -width * 0.2 : width * 0.2,
                -height * 0.5 + height * heightRatio,
                0.02,
              ]}
            >
              <planeGeometry args={[0.1, 0.06]} />
              <meshBasicMaterial
                color={buildingIndex % 3 === 0 ? '#db8b73' : '#705070'}
                depthWrite={false}
                fog={false}
              />
            </mesh>
          ))}
        </group>
      ))}

      <group position={[-5.2, 4.55, 0.04]}>
        <mesh>
          <planeGeometry args={[0.16, 2.15]} />
          <meshBasicMaterial color="#111326" depthWrite={false} fog={false} />
        </mesh>
        {[0, 0.54, 1.05].map((offset, index) => (
          <mesh key={offset} position={[0, -0.62 + offset, 0]} scale={[1 - index * 0.14, 1, 1]}>
            <planeGeometry args={[1.75, 0.12]} />
            <meshBasicMaterial color="#111326" depthWrite={false} fog={false} />
          </mesh>
        ))}
      </group>

      <mesh position={[0, 0.12, 0.05]}>
        <planeGeometry args={[28, 0.08]} />
        <meshBasicMaterial color="#d37a68" depthWrite={false} fog={false} />
      </mesh>
    </group>
  );
}
