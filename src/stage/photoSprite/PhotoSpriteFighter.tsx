'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState, type RefObject } from 'react';
import {
  DoubleSide,
  Group,
  MeshBasicMaterial,
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
import { LuckySpriteEffects } from '../lucky/LuckySpriteEffects';
import { VorghAudioPlayer } from '../vorgh/VorghAudioPlayer';
import { VorghEffects } from '../vorgh/VorghEffects';
import { spriteFacingScale, withOpponentFacing } from '../fighterPresentation';
import { combatAnimationProgress } from '../combatAnimationProgress';
import { photoAttackMotion } from './photoKickAnimation';
import { PHOTO_COLUMNS, PHOTO_ROWS, photoFrameFor } from './photoSpriteAnimation';

const DISPLAY_HEIGHT = 3.05;
const GROUND = 0.91;
const CENTER_Y = (GROUND - 0.5) * DISPLAY_HEIGHT;
const FRAME_BLEND_SECONDS = 0.065;

interface PhotoTextures {
  readonly current: Texture;
  readonly previous: Texture;
}

export function PhotoSpriteFighter({
  fighterId,
  kind,
}: {
  readonly fighterId: 'p1' | 'p2';
  readonly kind: 'glitch' | 'lucky' | 'mim' | 'titan' | 'vorgh';
}) {
  const outer = useRef<Group>(null);
  const body = useRef<Group>(null);
  const currentMaterial = useRef<MeshBasicMaterial>(null);
  const previousMaterial = useRef<MeshBasicMaterial>(null);
  const lastFrame = useRef<number | null>(null);
  const transitionAt = useRef(-1);
  const [textures, setTextures] = useState<PhotoTextures | null>(null);
  const opponentId = fighterId === 'p1' ? 'p2' : 'p1';

  useEffect(() => {
    let disposed = false;
    let loaded: PhotoTextures | null = null;
    new TextureLoader().loadAsync(`/sprites/reference-fighters/${kind}-atlas.webp`)
      .then((result) => {
        if (disposed) {
          result.dispose();
          return;
        }
        prepareTexture(result);
        const previous = result.clone();
        prepareTexture(previous);
        previous.needsUpdate = true;
        loaded = { current: result, previous };
        lastFrame.current = null;
        transitionAt.current = -1;
        setTextures(loaded);
      })
      .catch((error: unknown) => {
        console.warn(`Could not load ${kind} photo animation.`, error);
      });
    return () => {
      disposed = true;
      loaded?.current.dispose();
      loaded?.previous.dispose();
      setTextures(null);
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
    if (textures !== null) {
      const previousFrame = lastFrame.current;
      if (previousFrame === null) {
        setTextureFrame(textures.current, frame);
        if (currentMaterial.current !== null) currentMaterial.current.opacity = 1;
        if (previousMaterial.current !== null) previousMaterial.current.opacity = 0;
      } else if (previousFrame !== frame) {
        setTextureFrame(textures.previous, previousFrame);
        setTextureFrame(textures.current, frame);
        transitionAt.current = clock.elapsedTime;
      }
      lastFrame.current = frame;
      if (transitionAt.current >= 0) {
        const blend = Math.min(
          1,
          (clock.elapsedTime - transitionAt.current) / FRAME_BLEND_SECONDS,
        );
        if (currentMaterial.current !== null) currentMaterial.current.opacity = blend;
        if (previousMaterial.current !== null) previousMaterial.current.opacity = 1 - blend;
        if (blend >= 1) transitionAt.current = -1;
      }
    }
    const impact = fighter.hitstop > 0 ? 0.06 : 0;
    const motion = fighter.action === null
      ? photoAttackMotion('', 0)
      : photoAttackMotion(
        fighter.action.moveId,
        combatAnimationProgress(fighter.action.moveId, fighter.action.frame),
      );
    drawing.position.set(motion.x, CENTER_Y + motion.y, 0);
    drawing.scale.set(
      motion.scaleX * (1 + impact),
      motion.scaleY * (1 - impact),
      1,
    );
    drawing.rotation.z = fighter.hitstun > 0
      ? Math.sin(clock.elapsedTime * 42) * 0.035
      : motion.rotation;
  });

  const width = DISPLAY_HEIGHT;
  return (
    <>
      {kind === 'mim' ? <MimVoiceCallouts fighterId={fighterId} /> : null}
      {kind === 'mim' ? <MimSpecialEffects fighterId={fighterId} /> : null}
      {kind === 'lucky' ? <LuckySpriteEffects fighterId={fighterId} /> : null}
      {kind === 'vorgh' ? <VorghAudioPlayer fighterId={fighterId} /> : null}
      {kind === 'vorgh' ? <VorghEffects fighterId={fighterId} /> : null}
      <group ref={outer}>
        {kind === 'mim' ? <MimAttackEffects fighterId={fighterId} /> : null}
        <group ref={body} position-y={CENTER_Y}>
          {textures === null ? null : (
            <>
              <PhotoPlane
                materialRef={previousMaterial}
                positionZ={-0.002}
                texture={textures.previous}
                tint={kind === 'mim' || kind === 'glitch' ? '#d7dce4' : '#ffffff'}
                width={width}
              />
              <PhotoPlane
                materialRef={currentMaterial}
                positionZ={0}
                texture={textures.current}
                width={width}
                tint={kind === 'mim' || kind === 'glitch' ? '#d7dce4' : '#ffffff'}
              />
            </>
          )}
        </group>
        {kind === 'glitch' ? <GlitchSpriteEffects fighterId={fighterId} /> : null}
      </group>
    </>
  );
}

function PhotoPlane({
  materialRef,
  positionZ,
  texture,
  tint,
  width,
}: {
  readonly materialRef: RefObject<MeshBasicMaterial | null>;
  readonly positionZ: number;
  readonly texture: Texture;
  readonly tint: string;
  readonly width: number;
}) {
  return (
    <mesh position-z={positionZ}>
      <planeGeometry args={[width, DISPLAY_HEIGHT]} />
      <meshBasicMaterial
        ref={materialRef}
        alphaTest={0.05}
        color={tint}
        depthWrite={false}
        map={texture}
        transparent
        side={DoubleSide}
        toneMapped
      />
    </mesh>
  );
}

function prepareTexture(texture: Texture): void {
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.repeat.set(1 / PHOTO_COLUMNS, 1 / PHOTO_ROWS);
}

function setTextureFrame(texture: Texture, frame: number): void {
  const column = frame % PHOTO_COLUMNS;
  const row = Math.floor(frame / PHOTO_COLUMNS);
  texture.offset.set(column / PHOTO_COLUMNS, 1 - (row + 1) / PHOTO_ROWS);
}
