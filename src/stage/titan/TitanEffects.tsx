/* eslint-disable react-hooks/refs -- R3F attaches these refs during render. */
import { AdditiveBlending } from 'three';
import type { FighterRigRefs } from '../fighterRigRefs';

const ORANGE = '#ff6a13';
const HOT = '#ffd58a';

export function TitanEffects({ refs }: { readonly refs: FighterRigRefs }) {
  return (
    <>
      <group ref={refs.slash}><ImpactBurst /></group>
      <group ref={refs.projectile}><ImpactBurst /></group>
      <group ref={refs.aura}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.64, 0.42, 0.7, 32, 1, true]} />
          <meshBasicMaterial
            blending={AdditiveBlending}
            color={ORANGE}
            depthWrite={false}
            opacity={0.18}
            side={2}
            toneMapped={false}
            transparent
          />
        </mesh>
        {[0, 1, 2].map((index) => (
          <mesh key={index} rotation={[Math.PI / 2, index * 0.65, 0]} scale={1 + index * 0.18}>
            <torusGeometry args={[0.52, 0.018, 5, 48]} />
            <meshBasicMaterial
              blending={AdditiveBlending}
              color={index === 1 ? HOT : ORANGE}
              depthWrite={false}
              opacity={0.72 - index * 0.16}
              toneMapped={false}
              transparent
            />
          </mesh>
        ))}
      </group>
      <group ref={refs.echoes}>
        {[-1, 0, 1].map((x) => (
          <group key={x} position={[x * 0.38, 0.08 + Math.abs(x) * 0.1, 0]} rotation={[0, 0, x * 0.42]}>
            <mesh rotation={[0, 0, Math.PI / 4]} scale={[0.28, 0.035, 0.06]}>
              <octahedronGeometry />
              <meshBasicMaterial
                blending={AdditiveBlending}
                color={x === 0 ? HOT : ORANGE}
                depthWrite={false}
                opacity={0.8}
                toneMapped={false}
                transparent
              />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
}

function ImpactBurst() {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.032, 6, 48]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={ORANGE}
          depthWrite={false}
          opacity={0.92}
          toneMapped={false}
          transparent
        />
      </mesh>
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index / 8) * Math.PI * 2;
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * 0.43, Math.sin(angle) * 0.43, 0]}
            rotation={[0, 0, angle]}
            scale={[0.16 + (index % 3) * 0.05, 0.025, 0.025]}
          >
            <octahedronGeometry />
            <meshBasicMaterial
              blending={AdditiveBlending}
              color={index % 2 === 0 ? HOT : ORANGE}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
