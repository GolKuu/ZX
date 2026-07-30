'use client';

import { AdditiveBlending } from 'three';
import { ArenaCity2D } from './ArenaCity2D';

const STARS = [
  [-8.4, 6.8, 0.025], [-6.9, 5.2, 0.018], [-5.7, 7.5, 0.03],
  [-3.8, 6.1, 0.02], [-2.1, 7.2, 0.016], [0.3, 6.5, 0.025],
  [1.8, 7.7, 0.018], [3.2, 5.9, 0.02], [6.2, 7.4, 0.026],
  [8.1, 6.1, 0.017], [9.5, 7.8, 0.022],
] as const;

const MOUNTAINS = [
  [-9.4, 1.35, 4.4, '#342052'],
  [-6.1, 1.2, 3.8, '#2d1c4c'],
  [-2.8, 1.55, 4.7, '#392257'],
  [1.2, 1.2, 3.6, '#2b1a49'],
  [4.5, 1.5, 4.9, '#382153'],
  [8.6, 1.25, 4.1, '#2b1945'],
] as const;

export function ArenaBackdrop2D() {
  return (
    <group>
      <mesh position={[0, 4.1, -18]} renderOrder={-20}>
        <planeGeometry args={[36, 18]} />
        <meshBasicMaterial color="#120d29" depthWrite={false} fog={false} />
      </mesh>
      <mesh position={[0, 1.65, -17.96]} renderOrder={-19}>
        <planeGeometry args={[36, 4.9]} />
        <meshBasicMaterial color="#44234f" depthWrite={false} fog={false} />
      </mesh>
      <mesh position={[0, 0.3, -17.92]} renderOrder={-18}>
        <planeGeometry args={[36, 2.2]} />
        <meshBasicMaterial color="#8d4d59" depthWrite={false} fog={false} />
      </mesh>

      {STARS.map(([x, y, radius]) => (
        <mesh key={`${x}-${y}`} position={[x, y, -17.86]} renderOrder={-17}>
          <circleGeometry args={[radius, 8]} />
          <meshBasicMaterial color="#f8dfbe" depthWrite={false} fog={false} />
        </mesh>
      ))}

      <group position={[4.8, 4.75, -17.78]} renderOrder={-16}>
        <mesh>
          <circleGeometry args={[1.52, 48]} />
          <meshBasicMaterial color="#f2bd76" depthWrite={false} fog={false} />
        </mesh>
        <mesh position-z={-0.01} scale={1.18}>
          <ringGeometry args={[1.4, 1.62, 48]} />
          <meshBasicMaterial
            blending={AdditiveBlending}
            color="#ef8f66"
            depthWrite={false}
            opacity={0.24}
            toneMapped={false}
            transparent
          />
        </mesh>
        <mesh position={[0.2, 0.35, 0.01]}>
          <circleGeometry args={[0.22, 28]} />
          <meshBasicMaterial color="#d89469" depthWrite={false} fog={false} />
        </mesh>
      </group>

      <group position={[0, -1.05, -17.45]} renderOrder={-15}>
        {MOUNTAINS.map(([x, y, size, color]) => (
          <mesh key={`${x}-${size}`} position={[x, y, 0]} rotation-z={Math.PI / 2}>
            <circleGeometry args={[size, 3]} />
            <meshBasicMaterial color={color} depthWrite={false} fog={false} />
          </mesh>
        ))}
      </group>

      <ArenaCity2D />
    </group>
  );
}
