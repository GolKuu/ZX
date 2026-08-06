'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  NormalBlending,
} from 'three';
import { readCombatFighter, readLatestHit } from '@/src/game/combatRuntime';
import { createSoftFalloffTexture } from '@/src/render/softFalloffTexture';

type CharacterKind = 'glitch' | 'lucky' | 'mim' | 'titan' | 'vorgh';

const RIM_COLORS: Record<CharacterKind, string> = {
  glitch: '#48dfff',
  lucky: '#e8ba62',
  mim: '#bb6dff',
  titan: '#ff8c42',
  vorgh: '#ff3d5e',
};

/**
 * What welds a flat fighter to a 3D stage: a shadow and a glow, nothing else.
 *
 * The pass this replaces hung a halo, a spinning octagon, two light bars and
 * twelve floating crystals off every character. Against the old flat backdrop
 * that read as energy; in a built room it reads as tinsel — and worse, it was
 * the brightest thing near the fighter, so the eye went to the decoration
 * instead of to the fight.
 *
 * What is left is what a real fighter gets. A soft contact shadow on the disc,
 * because an unshadowed sprite floats however well the room is lit. And a
 * ground pool of the character's own colour, which does the job the scene's rim
 * lights cannot: the atlas is drawn with an unlit material, so no light in the
 * scene can touch it, and this is the only way a character's colour reaches the
 * stage they are standing on. Both react to being hit.
 */
export function CharacterHeroFX({
  fighterId,
  kind,
}: {
  readonly fighterId: 'p1' | 'p2';
  readonly kind: CharacterKind;
}) {
  const root = useRef<Group>(null);
  const shadow = useRef<Mesh>(null);
  const pool = useRef<Mesh>(null);
  const hitAt = useRef(-10);
  const seenHit = useRef(0);
  const colour = RIM_COLORS[kind];

  const surfaces = useMemo(() => {
    const falloff = createSoftFalloffTexture();
    // Both quads lie flat, a couple of centimetres above a floor that stretches
    // to the fog — which is the textbook depth-buffer fight, and it showed as a
    // torn black rag under every fighter rather than as a shadow. Polygon
    // offset is the fix decals are meant to use: it biases these two surfaces
    // toward the camera in depth only, without moving them in the world.
    const decal = { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -6 };
    return {
      falloff,
      shadow: new MeshBasicMaterial({
        ...decal,
        alphaMap: falloff,
        blending: NormalBlending,
        color: new Color('#000000'),
        depthWrite: false,
        opacity: 0.62,
        transparent: true,
      }),
      pool: new MeshBasicMaterial({
        ...decal,
        alphaMap: falloff,
        blending: AdditiveBlending,
        color: new Color(colour),
        depthWrite: false,
        opacity: 0.28,
        toneMapped: false,
        transparent: true,
      }),
    };
  }, [colour]);

  useEffect(
    () => () => {
      surfaces.shadow.dispose();
      surfaces.pool.dispose();
      surfaces.falloff.dispose();
    },
    [surfaces],
  );

  useFrame(({ clock }) => {
    const group = root.current;
    if (group === null) return;
    const fighter = readCombatFighter(fighterId);
    if (fighter === null) return;

    const latestHit = readLatestHit(fighterId);
    if (latestHit !== null && latestHit.serial !== seenHit.current) {
      seenHit.current = latestHit.serial;
      hitAt.current = clock.elapsedTime;
    }
    const hitPulse = Math.max(0, 1 - (clock.elapsedTime - hitAt.current) * 5.2);

    // The group rides inside the fighter, which is already lifted off the
    // ground by their jump height — so undo that lift to keep the shadow on the
    // floor, and shrink it with altitude the way a real one behaves.
    const lift = Math.max(0, group.parent?.position.y ?? 0);
    group.position.y = -lift + 0.055;
    const spread = 1 / (1 + lift * 0.55);

    const blob = shadow.current;
    if (blob !== null) {
      blob.scale.set(1.15 * spread, 0.62 * spread, 1);
      (blob.material as MeshBasicMaterial).opacity = 0.62 * spread;
    }
    const light = pool.current;
    if (light !== null) {
      const breathe = 1 + Math.sin(clock.elapsedTime * 2.2) * 0.04;
      light.scale.set(1.6 * breathe + hitPulse * 0.5, 0.86 * breathe + hitPulse * 0.3, 1);
      (light.material as MeshBasicMaterial).opacity = (0.24 + hitPulse * 0.5) * spread;
    }
  });

  return (
    <group ref={root}>
      <mesh material={surfaces.shadow} ref={shadow} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <mesh
        material={surfaces.pool}
        position={[0, 0.012, 0]}
        ref={pool}
        rotation-x={-Math.PI / 2}
      >
        <planeGeometry args={[1, 1]} />
      </mesh>
    </group>
  );
}

