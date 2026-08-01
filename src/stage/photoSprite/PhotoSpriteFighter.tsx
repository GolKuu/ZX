'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import {
  AdditiveBlending,
  DoubleSide,
  Group,
  NearestFilter,
  SRGBColorSpace,
  Texture,
  TextureLoader,
} from 'three';
import { combatRenderFrame, readCombatFighter } from '@/src/game/combatRuntime';
import { FIXED_SCALE } from '@/src/sim';
import { GlitchSpriteEffects } from '../glitch/GlitchSpriteEffects';
import { MimAttackEffects } from '../mim/MimAttackEffects';
import { MimSpecialEffects } from '../mim/MimSpecialEffects';
import { MimVoiceCallouts } from '../mim/MimVoiceCallouts';
import { spriteFacingScale, withOpponentFacing } from '../fighterPresentation';
import { PHOTO_COLUMNS, PHOTO_ROWS, photoFrameFor } from './photoSpriteAnimation';

const DISPLAY_HEIGHT = 3.05;
const GROUND = 0.91;

export function PhotoSpriteFighter({
  fighterId,
  kind,
}: {
  readonly fighterId: 'p1' | 'p2';
  readonly kind: 'mim' | 'glitch';
}) {
  const outer = useRef<Group>(null);
  const body = useRef<Group>(null);
  const [texture, setTexture] = useState<Texture | null>(null);
  const opponentId = fighterId === 'p1' ? 'p2' : 'p1';

  useEffect(() => {
    let disposed = false;
    let loaded: Texture | null = null;
    new TextureLoader().loadAsync(`/sprites/photo-fighters/${kind}-atlas.png`)
      .then((result) => {
        if (disposed) {
          result.dispose();
          return;
        }
        loaded = result;
        result.colorSpace = SRGBColorSpace;
        result.magFilter = NearestFilter;
        result.minFilter = NearestFilter;
        result.generateMipmaps = false;
        result.repeat.set(1 / PHOTO_COLUMNS, 1 / PHOTO_ROWS);
        setTexture(result);
      })
      .catch((error: unknown) => {
        console.warn(`Could not load ${kind} photo animation.`, error);
      });
    return () => {
      disposed = true;
      loaded?.dispose();
      setTexture(null);
    };
  }, [kind]);

  useFrame(({ clock }) => {
    const fighter = readCombatFighter(fighterId);
    const root = outer.current;
    const drawing = body.current;
    if (fighter === null || root === null || drawing === null) return;
    const alpha = combatRenderFrame.interpolationAlpha;
    root.position.x = (
      fighter.previousPosition.x
      + (fighter.position.x - fighter.previousPosition.x) * alpha
    ) / FIXED_SCALE;
    root.position.y = fighter.position.y / FIXED_SCALE;
    root.position.z = 0.16;
    const presentation = withOpponentFacing(fighter, readCombatFighter(opponentId));
    root.scale.x = spriteFacingScale(true, presentation.facing);

    const frame = photoFrameFor(fighter, clock.elapsedTime);
    if (texture !== null) {
      const column = frame % PHOTO_COLUMNS;
      const row = Math.floor(frame / PHOTO_COLUMNS);
      texture.offset.set(column / PHOTO_COLUMNS, 1 - (row + 1) / PHOTO_ROWS);
    }
    const impact = fighter.hitstop > 0 ? 0.06 : 0;
    drawing.scale.set(1 + impact, 1 - impact, 1);
    drawing.rotation.z = fighter.hitstun > 0
      ? Math.sin(clock.elapsedTime * 42) * 0.035
      : 0;
  });

  const width = DISPLAY_HEIGHT;
  const centerY = (GROUND - 0.5) * DISPLAY_HEIGHT;
  return (
    <>
      {kind === 'mim' ? <MimVoiceCallouts fighterId={fighterId} /> : null}
      {kind === 'mim' ? <MimSpecialEffects fighterId={fighterId} /> : null}
      <group ref={outer}>
        {kind === 'mim' ? <MimAttackEffects fighterId={fighterId} /> : null}
        <group ref={body} position-y={centerY}>
          {texture === null ? null : (
            <>
              {kind === 'glitch' ? (
                <>
                  <PhotoPlane texture={texture} width={width} color="#16e6ff" x={-0.045} opacity={0.16} additive />
                  <PhotoPlane texture={texture} width={width} color="#ff2bd6" x={0.045} opacity={0.14} additive />
                </>
              ) : null}
              <PhotoPlane texture={texture} width={width} />
            </>
          )}
        </group>
        {kind === 'glitch' ? <GlitchSpriteEffects fighterId={fighterId} /> : null}
      </group>
    </>
  );
}

function PhotoPlane({
  additive = false,
  color = '#ffffff',
  opacity = 1,
  texture,
  width,
  x = 0,
}: {
  readonly additive?: boolean;
  readonly color?: string;
  readonly opacity?: number;
  readonly texture: Texture;
  readonly width: number;
  readonly x?: number;
}) {
  return (
    <mesh position={[x, 0, additive ? -0.025 : 0]}>
      <planeGeometry args={[width, DISPLAY_HEIGHT]} />
      <meshBasicMaterial
        alphaTest={0.08}
        blending={additive ? AdditiveBlending : undefined}
        color={color}
        depthWrite={!additive}
        map={texture}
        opacity={opacity}
        side={DoubleSide}
        toneMapped={false}
        transparent
      />
    </mesh>
  );
}
