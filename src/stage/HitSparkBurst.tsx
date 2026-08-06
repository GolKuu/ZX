'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import {
  AdditiveBlending,
  InstancedMesh,
  Matrix4,
  Quaternion,
  Vector3,
} from 'three';
import { readLatestHit } from '@/src/game/combatRuntime';

const POOL_SIZE = 132;

interface Spark {
  readonly position: Vector3;
  readonly velocity: Vector3;
  life: number;
  span: number;
  length: number;
  width: number;
}

function makeSpark(): Spark {
  return {
    position: new Vector3(),
    velocity: new Vector3(),
    life: 0,
    span: 1,
    length: 0,
    width: 0,
  };
}

export function HitSparkBurst() {
  const mesh = useRef<InstancedMesh>(null);
  const sparks = useRef(Array.from({ length: POOL_SIZE }, makeSpark));
  const cursor = useRef(0);
  const seen = useRef({ p1: 0, p2: 0 });
  const hasActiveSparks = useRef(false);
  const initialized = useRef(false);
  const scratch = useRef({
    matrix: new Matrix4(),
    scale: new Vector3(),
    rotation: new Quaternion(),
    axis: new Vector3(0, 0, 1),
  });

  useFrame((_state, delta) => {
    const instances = mesh.current;
    if (instances === null) return;

    let spawned = false;
    for (const fighterId of ['p1', 'p2'] as const) {
      const hit = readLatestHit(fighterId);
      if (hit === null || hit.serial === seen.current[fighterId]) continue;
      seen.current[fighterId] = hit.serial;
      spawned = true;
      // Weighted harder than before. A jab and a launcher used to throw nearly
      // the same shower, which flattened the whole damage range into one
      // effect — the sparks are the closest thing the frame has to a
      // hit-strength readout.
      const intensity = Math.min(2.3, 0.72 + hit.damage / 52);
      const count = Math.round(12 + Math.min(22, hit.damage / 3.4));
      for (let index = 0; index < count; index += 1) {
        spawnSpark(sparks.current, cursor, hit.x, hit.y, hit.away, intensity, index);
      }
    }

    if (!spawned && !hasActiveSparks.current && initialized.current) return;

    const step = Math.min(delta, 1 / 30);
    const { matrix, scale, rotation, axis } = scratch.current;
    let active = false;
    for (let index = 0; index < sparks.current.length; index += 1) {
      const spark = sparks.current[index];
      if (spark === undefined || spark.life <= 0) {
        matrix.makeScale(0, 0, 0);
        instances.setMatrixAt(index, matrix);
        continue;
      }
      spark.life -= step;
      active = active || spark.life > 0;
      spark.velocity.multiplyScalar(Math.exp(-5.5 * step));
      spark.velocity.y -= 1.2 * step;
      spark.position.addScaledVector(spark.velocity, step);
      const remaining = Math.max(0, spark.life / spark.span);
      const speed = spark.velocity.length();
      scale.set(spark.length * (0.55 + speed * 0.09) * remaining, spark.width * remaining, 1);
      rotation.setFromAxisAngle(axis, Math.atan2(spark.velocity.y, spark.velocity.x));
      matrix.compose(spark.position, rotation, scale);
      instances.setMatrixAt(index, matrix);
    }
    initialized.current = true;
    hasActiveSparks.current = active;
    instances.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh args={[undefined, undefined, POOL_SIZE]} frustumCulled={false} ref={mesh}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        blending={AdditiveBlending}
        color="#fff4c8"
        depthWrite={false}
        toneMapped={false}
        transparent
      />
    </instancedMesh>
  );
}

function spawnSpark(
  sparks: readonly Spark[], cursor: { current: number }, x: number, y: number,
  away: number, intensity: number, index: number,
): void {
  const spark = sparks[cursor.current % sparks.length];
  cursor.current = (cursor.current + 1) % sparks.length;
  if (spark === undefined) return;
  // The first four are the star: a fixed cross thrown out along the diagonals,
  // which is what gives the burst a readable shape at the instant it appears.
  // The rest scatter along the direction of the blow.
  const radial = index < 4 ? index * Math.PI * 0.5 + Math.PI * 0.25 : (Math.random() - 0.5) * 2.25;
  const speed = (index < 4 ? 7.2 : 3.2 + Math.random() * 5.4) * intensity;
  spark.position.set(x, y, 0.42 + Math.random() * 0.08);
  spark.velocity.set(Math.cos(radial) * speed * away, Math.sin(radial) * speed, 0);
  spark.span = 0.1 + Math.random() * 0.2;
  spark.life = spark.span;
  spark.length = (index < 4 ? 0.58 : 0.24 + Math.random() * 0.44) * intensity;
  spark.width = index < 4 ? 0.07 : 0.02 + Math.random() * 0.03;
}
