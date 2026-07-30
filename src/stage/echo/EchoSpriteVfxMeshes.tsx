import type { RefObject } from 'react';
import {
  AdditiveBlending,
  DoubleSide,
  type Group,
} from 'three';

export function EchoPredictionReticle({
  root,
}: {
  readonly root: RefObject<Group | null>;
}) {
  return (
    <group ref={root} visible={false}>
      {[0.32, 0.46, 0.62].map((radius, index) => (
        <mesh key={radius} rotation-z={index * 0.6}>
          <ringGeometry args={[radius, radius + 0.018, 40]} />
          <Glow color={index === 1 ? '#ffffff' : '#52eaff'} opacity={0.72} />
        </mesh>
      ))}
      {[0, Math.PI / 2].map((rotation) => (
        <mesh key={rotation} rotation-z={rotation}>
          <planeGeometry args={[1.62, 0.018]} />
          <Glow color="#4f8cff" opacity={0.58} />
        </mesh>
      ))}
      <mesh>
        <circleGeometry args={[0.052, 12]} />
        <Glow color="#ffffff" opacity={0.9} />
      </mesh>
    </group>
  );
}

export function EchoFutureTrajectories({
  root,
}: {
  readonly root: RefObject<Group | null>;
}) {
  return (
    <group ref={root} visible={false}>
      {Array.from({ length: 7 }, (_, index) => (
        <mesh key={index}>
          <planeGeometry args={[1.35 - index * 0.08, 0.022]} />
          <Glow
            color={index === 3 ? '#ffffff' : '#4f8cff'}
            opacity={index === 3 ? 0.82 : 0.34}
          />
        </mesh>
      ))}
    </group>
  );
}

export function EchoDataFragments({
  root,
}: {
  readonly root: RefObject<Group | null>;
}) {
  return (
    <group ref={root} visible={false}>
      {Array.from({ length: 12 }, (_, index) => (
        <mesh key={index}>
          <planeGeometry args={[0.08 + (index % 3) * 0.045, 0.018]} />
          <Glow
            color={index % 4 === 0 ? '#ffffff' : '#52eaff'}
            opacity={0.38 + (index % 3) * 0.12}
          />
        </mesh>
      ))}
    </group>
  );
}

function Glow({
  color,
  opacity,
}: {
  readonly color: string;
  readonly opacity: number;
}) {
  return (
    <meshBasicMaterial
      blending={AdditiveBlending}
      color={color}
      depthWrite={false}
      opacity={opacity}
      side={DoubleSide}
      toneMapped={false}
      transparent
    />
  );
}
