'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState, type RefObject } from 'react';
import {
  DoubleSide,
  Group,
  LinearFilter,
  MeshBasicMaterial,
  Color,
  SRGBColorSpace,
  Texture,
  TextureLoader,
} from 'three';
import type { Material } from 'three';
import { combatRenderFrame, readCombatFighter, readLatestHit } from '@/src/game/combatRuntime';
import { FIXED_SCALE } from '@/src/sim';
import { useRenderStore } from '@/src/store/renderStore';
import { GlitchSpriteEffects } from '../glitch/GlitchSpriteEffects';
import { MimAttackEffects } from '../mim/MimAttackEffects';
import { MimSpecialEffects } from '../mim/MimSpecialEffects';
import { LuckySpriteEffects } from '../lucky/LuckySpriteEffects';
import { VorghEffects } from '../vorgh/VorghEffects';
import { spriteFacingScale, withOpponentFacing } from '../fighterPresentation';
import { combatAnimationProgress } from '../combatAnimationProgress';
import { isFalling, photoFallPose } from './photoFallAnimation';
import { photoAttackMotion } from './photoKickAnimation';
import { photoDashEchoOpacity, photoImpactPose } from './photoCombatMotion';
import { PHOTO_COLUMNS, PHOTO_ROWS, photoFrameFor } from './photoSpriteAnimation';
import { LeadAttackEffects } from './LeadAttackEffects';
import { CharacterHeroFX } from './CharacterHeroFX';

const DISPLAY_HEIGHT = 3.05;
const GROUND = 0.91;
const CENTER_Y = (GROUND - 0.5) * DISPLAY_HEIGHT;
const FRAME_BLEND_SECONDS = 0.065;
const SIMULATION_HZ = 60;
const INK_OFFSETS = [
  [-0.018, -0.018], [0, -0.022], [0.018, -0.018],
  [-0.022, 0], [0.022, 0],
  [-0.018, 0.018], [0, 0.022], [0.018, 0.018],
] as const;

// Presentation-only body-class scale. Simulation units and hitboxes stay
// untouched; the screen read now separates heavyweight, agile and technical
// fighters the way a premium 3D fighter does.
const CHARACTER_DISPLAY_SCALE = {
  glitch: 1.02,
  lucky: 0.96,
  mim: 0.98,
  titan: 1.12,
  vorgh: 1.05,
} as const;

const HERO_SURFACE_ACCENTS = {
  glitch: '#48dfff',
  lucky: '#e8ba62',
  mim: '#bb6dff',
  titan: '#ff8c42',
  vorgh: '#ff3d5e',
} as const;

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
  const dashMaterials = useRef<Array<MeshBasicMaterial | null>>([]);
  const lastFrame = useRef<number | null>(null);
  const transitionAt = useRef(-1);
  // A killing blow leaves no knockdown timer behind, so the defeat collapse
  // needs its own clock. Wall time keeps it identical at any refresh rate.
  const defeatAt = useRef<number | null>(null);
  const seenHit = useRef(0);
  const impactAt = useRef(-1);
  const impactDamage = useRef(0);
  const [textures, setTextures] = useState<PhotoTextures | null>(null);
  const graphicsPreset = useRenderStore((state) => state.graphicsPreset);
  const opponentId = fighterId === 'p1' ? 'p2' : 'p1';
  const bodyScale = CHARACTER_DISPLAY_SCALE[kind];

  useEffect(() => {
    let disposed = false;
    let loaded: PhotoTextures | null = null;
    const atlasName = graphicsPreset === 'high' ? `${kind}-atlas-hd.avif` : `${kind}-atlas.webp`;
    new TextureLoader().loadAsync(`/sprites/reference-fighters/${atlasName}`)
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
  }, [graphicsPreset, kind]);

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
    root.scale.set(
      spriteFacingScale(true, presentation.facing) * bodyScale,
      bodyScale,
      1,
    );

    const latestHit = readLatestHit(fighterId);
    if (latestHit !== null && latestHit.serial !== seenHit.current) {
      seenHit.current = latestHit.serial;
      impactAt.current = clock.elapsedTime;
      impactDamage.current = latestHit.damage;
    }

    if (fighter.health > 0) defeatAt.current = null;
    else if (defeatAt.current === null) defeatAt.current = clock.elapsedTime;
    const defeatFrames = defeatAt.current === null
      ? 0
      : (clock.elapsedTime - defeatAt.current) * SIMULATION_HZ;

    const frame = photoFrameFor(fighter, clock.elapsedTime, defeatFrames);
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
    const falling = isFalling(fighter);
    const motion = falling || fighter.action === null
      ? photoAttackMotion('', 0, kind)
      : photoAttackMotion(
        fighter.action.moveId,
        combatAnimationProgress(fighter.action.moveId, fighter.action.frame),
        kind,
      );
    const fall = photoFallPose(fighter, clock.elapsedTime, defeatFrames);
    const reaction = falling
      ? photoImpactPose(-1, 0)
      : photoImpactPose(clock.elapsedTime - impactAt.current, impactDamage.current);
    drawing.position.set(
      motion.x + reaction.x + fall.slide * DISPLAY_HEIGHT,
      CENTER_Y + motion.y + reaction.y - fall.drop * DISPLAY_HEIGHT,
      0,
    );
    drawing.scale.set(
      motion.scaleX * reaction.scaleX * fall.scaleX * (1 + impact),
      motion.scaleY * reaction.scaleY * fall.scaleY * (1 - impact),
      1,
    );
    drawing.rotation.z = falling
      ? fall.rotation
      : fighter.hitstun > 0
      ? Math.sin(clock.elapsedTime * 42) * 0.035
      : motion.rotation + reaction.rotation;
    drawing.rotation.y = falling ? 0 : motion.turnY;
    for (let index = 0; index < dashMaterials.current.length; index += 1) {
      const material = dashMaterials.current[index];
      if (material !== null && material !== undefined) {
        material.opacity = photoDashEchoOpacity(fighter.dashFrames, index);
      }
    }
  });

  const width = DISPLAY_HEIGHT;
  return (
    <>
      {kind === 'mim' ? <MimSpecialEffects fighterId={fighterId} /> : null}
      {kind === 'lucky' ? <LuckySpriteEffects fighterId={fighterId} /> : null}
      {kind === 'vorgh' ? <VorghEffects fighterId={fighterId} /> : null}
      <group ref={outer}>
        <CharacterHeroFX fighterId={fighterId} kind={kind} />
        {kind === 'mim' ? <MimAttackEffects fighterId={fighterId} /> : null}
        <LeadAttackEffects fighterId={fighterId} kind={kind} />
        <group ref={body} position-y={CENTER_Y}>
          {textures === null ? null : (
            <>
              {[0, 1, 2].map((index) => (
                <PhotoPlane
                  key={`dash:${String(index)}`}
                  materialRef={(material) => { dashMaterials.current[index] = material; }}
                  opacity={0}
                  positionX={-0.2 - index * 0.2}
                  positionZ={-0.014 - index * 0.004}
                  texture={textures.current}
                  tint={index % 2 === 0 ? '#65e8ff' : '#c26cff'}
                  width={width}
                />
              ))}
              {/* Eight-way ink shell: a stable silhouette pass gives the photo
                  atlas the dense, high-contrast character separation expected
                  from a premium 3D fighter without altering the source frames. */}
              {INK_OFFSETS.map(([x, z], index) => (
                <PhotoPlane
                  key={`ink-shell-${index}`}
                  materialRef={() => undefined}
                  opacity={0.34}
                  positionX={x}
                  positionZ={-0.016 + z}
                  texture={textures.current}
                  tint="#03050a"
                  toneMapped={false}
                  width={width}
                />
              ))}
              <PhotoPlane
                materialRef={() => undefined}
                opacity={0.76}
                positionZ={-0.012}
                scale={1.055}
                texture={textures.current}
                tint="#102d31"
                toneMapped={false}
                width={width}
              />
              <PhotoPlane
                materialRef={() => undefined}
                opacity={0.58}
                positionZ={-0.008}
                scale={1.028}
                texture={textures.current}
                tint={fighterId === 'p1' ? '#5ce6ff' : '#ffd35c'}
                toneMapped={false}
                width={width}
              />
              <PhotoPlane
                materialRef={previousMaterial}
                positionZ={-0.002}
                texture={textures.previous}
                tint={kind === 'mim' || kind === 'glitch' ? '#d7dce4' : '#ffffff'}
                heroAccent={kind}
                width={width}
              />
              <PhotoPlane
                materialRef={currentMaterial}
                positionZ={0}
                texture={textures.current}
                width={width}
                tint={kind === 'mim' || kind === 'glitch' ? '#d7dce4' : '#ffffff'}
                heroAccent={kind}
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
  opacity = 1,
  positionX = 0,
  positionZ,
  scale = 1,
  texture,
  tint,
  heroAccent,
  toneMapped = true,
  width,
}: {
  readonly materialRef: RefObject<MeshBasicMaterial | null> | ((material: MeshBasicMaterial | null) => void);
  readonly opacity?: number;
  readonly positionX?: number;
  readonly positionZ: number;
  readonly scale?: number;
  readonly texture: Texture;
  readonly tint: string;
  readonly heroAccent?: 'glitch' | 'lucky' | 'mim' | 'titan' | 'vorgh';
  readonly toneMapped?: boolean;
  readonly width: number;
}) {
  return (
    <mesh position-x={positionX} position-z={positionZ} scale={scale}>
      <planeGeometry args={[width, DISPLAY_HEIGHT]} />
      <meshBasicMaterial
        onBeforeCompile={heroAccent === undefined ? undefined : gradeHeroSurface(heroAccent)}
        ref={materialRef}
        alphaTest={0.05}
        color={tint}
        depthWrite={false}
        map={texture}
        opacity={opacity}
        transparent
        side={DoubleSide}
        toneMapped={toneMapped}
      />
    </mesh>
  );
}

function gradeHeroSurface(
  heroAccent: keyof typeof HERO_SURFACE_ACCENTS,
): (shader: Parameters<Material['onBeforeCompile']>[0]) => void {
  return (shader) => {
    shader.uniforms.uHeroAccent = { value: new Color(HERO_SURFACE_ACCENTS[heroAccent]) };
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      'uniform vec3 uHeroAccent;\n#include <common>',
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      `#include <map_fragment>
        // A restrained surface grade gives the atlas a directional-light
        // read without pretending that a 2D frame is a real mesh.
        //
        // Exposure is up and the contrast squeeze is gone. Both were authored
        // against a bright painted backdrop, where a fighter had to be knocked
        // back to sit in the picture. The stage is a dark room now, and the same
        // grade turned every character into a black silhouette with a coloured
        // edge — the one thing a fighting game cannot afford, because the player
        // has to be able to read their own limbs.
        vec2 heroUv = fract(vMapUv * vec2(float(${PHOTO_COLUMNS}), float(${PHOTO_ROWS})));
        float heroLight = 1.12 + heroUv.y * 0.24;
        float heroRim = smoothstep(0.66, 1.0, heroUv.x) * 0.16;
        float heroGloss = pow(max(0.0, 1.0 - abs(heroUv.x - 0.67) * 3.8), 18.0) * 0.12;
        diffuseColor.rgb *= heroLight;
        // Lift the deepest values before the accent goes on. A photo atlas has
        // real black in its creases, and on this stage that black is the same
        // value as the room behind it.
        diffuseColor.rgb = diffuseColor.rgb * 0.9 + 0.055;
        diffuseColor.rgb += uHeroAccent * (heroRim + heroGloss);
      `,
    );
  };
}

function prepareTexture(texture: Texture): void {
  texture.colorSpace = SRGBColorSpace;
  // The atlas is authored at 1024px, but the final frame can be 4K. Linear
  // sampling avoids stair-stepping on the enlarged hero planes; mipmaps stay
  // disabled because each UV window is a deliberately selected animation cel.
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.repeat.set(1 / PHOTO_COLUMNS, 1 / PHOTO_ROWS);
}

function setTextureFrame(texture: Texture, frame: number): void {
  const column = frame % PHOTO_COLUMNS;
  const row = Math.floor(frame / PHOTO_COLUMNS);
  texture.offset.set(column / PHOTO_COLUMNS, 1 - (row + 1) / PHOTO_ROWS);
}
