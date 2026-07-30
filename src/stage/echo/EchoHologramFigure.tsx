import { AdditiveBlending, DoubleSide } from 'three';

export function EchoHologramFigure() {
  return (
    <group>
      <HoloPart position={[0, 1.58, 0]} scale={[0.2, 0.23, 1]} shape="head" />
      <HoloPart position={[0, 1.12, 0]} scale={[0.28, 0.56, 1]} />
      <HoloPart
        position={[-0.27, 1.12, 0]}
        rotation={-0.12}
        scale={[0.1, 0.52, 1]}
      />
      <HoloPart
        position={[0.27, 1.12, 0]}
        rotation={0.12}
        scale={[0.1, 0.52, 1]}
      />
      <HoloPart
        position={[-0.13, 0.46, 0]}
        rotation={-0.06}
        scale={[0.12, 0.68, 1]}
      />
      <HoloPart
        position={[0.13, 0.46, 0]}
        rotation={0.06}
        scale={[0.12, 0.68, 1]}
      />
      <HoloPart
        position={[-0.19, 0.72, -0.01]}
        rotation={-0.2}
        scale={[0.15, 0.74, 1]}
      />
      <HoloPart
        position={[0.19, 0.72, -0.01]}
        rotation={0.2}
        scale={[0.15, 0.74, 1]}
      />
    </group>
  );
}

function HoloPart({
  position,
  rotation = 0,
  scale,
  shape = 'body',
}: {
  readonly position: [number, number, number];
  readonly rotation?: number;
  readonly scale: [number, number, number];
  readonly shape?: 'body' | 'head';
}) {
  return (
    <mesh position={position} rotation-z={rotation} scale={scale}>
      {shape === 'head' ? <circleGeometry args={[1, 12]} /> : <planeGeometry />}
      <meshBasicMaterial
        blending={AdditiveBlending}
        color="#58eaff"
        depthWrite={false}
        opacity={0.2}
        side={DoubleSide}
        toneMapped={false}
        transparent
      />
    </mesh>
  );
}
