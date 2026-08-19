'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState, type RefObject } from 'react';
import {
  DoubleSide,
  Group,
  LinearFilter,
  LinearMipmapLinearFilter,
  MeshBasicMaterial,
  SRGBColorSpace,
  Texture,
  TextureLoader,
} from 'three';
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
import { photoIdleMotion } from './photoIdleMotion';
import { updateSmear } from './photoSmear';
import { PHOTO_COLUMNS, PHOTO_ROWS, photoFrameFor } from './photoSpriteAnimation';
import { SNAP_FRAMES } from './photoAttackSequences';
import { LeadAttackEffects } from './LeadAttackEffects';
import { CharacterHeroFX } from './CharacterHeroFX';
import { SpriteGroundShadow } from './SpriteGroundShadow';
import {
  applyHeroSurfaceLighting,
  createHeroSurfaceUniforms,
  type HeroSurfaceUniforms,
} from '@/src/render/heroSurfaceLighting';
import { HERO_SURFACE_PALETTES } from '@/src/render/heroSurfacePalettes';

const DISPLAY_HEIGHT = 3.05;
const GROUND = 0.91;
const CENTER_Y = (GROUND - 0.5) * DISPLAY_HEIGHT;
/**
 * Cross-fade for a pose the body passes through.
 *
 * Longer than the 0.035s this replaces -- at 60fps that was barely two frames
 * and read as a hard cut, so a nine-beat attack cycle strobed through nine
 * separate drawings. Contact frames are exempt entirely; see `SNAP_FRAMES`.
 *
 * Bounded from above by the walk, not by the attacks. The walk cycle holds each
 * cel for about 0.11s, so a blend much past half of that never resolves before
 * the next change and the legs turn into a permanent double exposure.
 */
const FRAME_BLEND_SECONDS = 0.055;
/** World units of head lag per unit of acceleration. */
const BEND_PER_ACCEL = 0.0016;
/** The bend is a lean, never a fold. */
const MAX_BEND = 0.13;
const SIMULATION_HZ = 60;

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
  const contactShadow = useRef<Group>(null);
  const contactShadowMaterials = useRef<Array<MeshBasicMaterial | null>>([]);
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
  const idleWeight = useRef(0);
  const lastIdleAt = useRef(0);
  const lastWorld = useRef<{ x: number; y: number } | null>(null);
  const lastVelocity = useRef({ x: 0, y: 0 });
  const impactDamage = useRef(0);
  const [textures, setTextures] = useState<PhotoTextures | null>(null);
  const graphicsPreset = useRenderStore((state) => state.graphicsPreset);
  const anisotropy = useThree(
    (state) => state.gl.capabilities.getMaxAnisotropy(),
  );
  const opponentId = fighterId === 'p1' ? 'p2' : 'p1';
  const bodyScale = CHARACTER_DISPLAY_SCALE[kind];
  // One uniform block shared by both body planes, so the cross-fade between
  // the outgoing and incoming frame is lit identically and the blend does not
  // flicker. `atlasSize` has to track the atlas actually loaded: the gradient
  // taps are in texels, and a 1024px sheet sampled at 4096px spacing produces
  // a normal derived from four texels away, which reads as a smear.
  const [surface, setSurface] = useState<HeroSurfaceUniforms | null>(null);
  const surfaceRef = useRef<HeroSurfaceUniforms | null>(null);
  useEffect(() => {
    const next = createHeroSurfaceUniforms({
      ...HERO_SURFACE_PALETTES[kind],
      atlasSize: graphicsPreset === 'high' ? 4096 : 1024,
    });
    surfaceRef.current = next;
    setSurface(next);
  }, [graphicsPreset, kind]);

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
        prepareTexture(result, anisotropy);
        const previous = result.clone();
        prepareTexture(previous, anisotropy);
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
  }, [anisotropy, graphicsPreset, kind]);

  useFrame(({ clock }, delta) => {
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
    // The plane is mirrored by a negative X scale, which flips the artwork but
    // not the light. Without this the key jumps to the far side the instant a
    // fighter turns around, and both fighters end up lit from opposite suns.
    const heroSurface = surfaceRef.current;
    if (heroSurface !== null) {
      heroSurface.uFlip.value = presentation.facing >= 0 ? 1 : -1;

      // Measured travel, not the move table: see `photoSmear.ts`. Taken after
      // the root has been written for this frame, so it is the same number the
      // player is about to see move.
      const previous = lastWorld.current;
      const dt = Math.max(1 / 240, delta);
      updateSmear(heroSurface.uSmear.value, {
        facing: presentation.facing >= 0 ? 1 : -1,
        frozen: fighter.hitstop > 0,
        spriteHeight: DISPLAY_HEIGHT,
        spriteWidth: DISPLAY_HEIGHT,
        worldVelocityX: previous === null
          ? 0
          : (root.position.x - previous.x) / dt,
        worldVelocityY: previous === null
          ? 0
          : (root.position.y - previous.y) / dt,
      });
      const worldVx = previous === null ? 0 : (root.position.x - previous.x) / dt;
      const worldVy = previous === null ? 0 : (root.position.y - previous.y) / dt;
      // Acceleration, not velocity: a body moving at a constant speed stands
      // upright, and only bends while it is being sped up or stopped. That is
      // why this reads as weight rather than as a permanent lean.
      const accelX = (worldVx - lastVelocity.current.x) / dt;
      const accelY = (worldVy - lastVelocity.current.y) / dt;
      lastVelocity.current = { x: worldVx, y: worldVy };
      const bend = heroSurface.uBend.value;
      const targetX = fighter.hitstop > 0
        ? bend.x
        : clampBend(-accelX * BEND_PER_ACCEL * presentation.facing);
      const targetY = fighter.hitstop > 0
        ? bend.y
        : clampBend(-accelY * BEND_PER_ACCEL * 0.4);
      // Critically damped chase: an undamped bend snaps and reads as a glitch.
      const follow = Math.min(1, dt * 14);
      bend.set(
        bend.x + (targetX - bend.x) * follow,
        bend.y + (targetY - bend.y) * follow,
      );
      lastWorld.current = { x: root.position.x, y: root.position.y };
    }

    const shadow = contactShadow.current;
    if (shadow !== null) {
      const airborne = Math.max(0, root.position.y);
      shadow.position.y = (-root.position.y + 0.035) / bodyScale;
      shadow.scale.set(1 + airborne * 0.09, 1, 1 + airborne * 0.04);
      const fade = Math.max(0.18, 1 - airborne * 0.3);
      for (let index = 0; index < contactShadowMaterials.current.length; index += 1) {
        const material = contactShadowMaterials.current[index];
        if (material !== null && material !== undefined) {
          // Index 2 is the projected silhouette, which carries most of the
          // grounding and so is much denser than the occlusion pool under it.
          material.opacity = (index === 2 ? 0.44 : 0.07 + index * 0.055) * fade;
        }
      }
    }

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
        // A strike arrives whole, on its frame. Everything else eases in.
        if (SNAP_FRAMES.has(frame)) {
          transitionAt.current = -1;
          if (currentMaterial.current !== null) currentMaterial.current.opacity = 1;
          if (previousMaterial.current !== null) previousMaterial.current.opacity = 0;
        } else {
          transitionAt.current = clock.elapsedTime;
        }
      }
      lastFrame.current = frame;
      if (transitionAt.current >= 0) {
        const linear = Math.min(
          1,
          (clock.elapsedTime - transitionAt.current) / FRAME_BLEND_SECONDS,
        );
        // Ease out, not linear. A linear cross-fade spends half its time with
        // both poses at half strength, which is the double-exposure look; an
        // eased one commits to the incoming pose early and spends its tail
        // cleaning up the outgoing one.
        const blend = 1 - (1 - linear) * (1 - linear);
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
    // True neutral: standing on the ground, not acting, not reacting, not
    // moving. Anything else and the idle has to be out of the way, because a
    // breath layered on top of a hit reaction reads as a second, conflicting
    // animation. The weight is eased rather than switched, so a fighter
    // recovering from a combo settles back into breathing instead of snapping
    // into it on the frame the hitstun clears.
    const neutral = !falling
      && fighter.action === null
      && fighter.grounded
      && fighter.hitstun <= 0
      && fighter.hitstop <= 0
      && fighter.dashFrames <= 0
      && Math.abs(fighter.velocity.x) <= 16;
    idleWeight.current += (
      (neutral ? 1 : 0) - idleWeight.current
    ) * Math.min(1, 5.5 * Math.max(0, clock.elapsedTime - lastIdleAt.current));
    lastIdleAt.current = clock.elapsedTime;
    const idle = photoIdleMotion(
      clock.elapsedTime,
      kind,
      fighterId,
      idleWeight.current,
    );

    drawing.position.set(
      motion.x + reaction.x + idle.x + fall.slide * DISPLAY_HEIGHT,
      CENTER_Y + motion.y + reaction.y + idle.y - fall.drop * DISPLAY_HEIGHT,
      0,
    );
    drawing.scale.set(
      motion.scaleX * reaction.scaleX * fall.scaleX * idle.scaleX * (1 + impact),
      motion.scaleY * reaction.scaleY * fall.scaleY * idle.scaleY * (1 - impact),
      1,
    );
    drawing.rotation.z = falling
      ? fall.rotation
      : fighter.hitstun > 0
      ? Math.sin(clock.elapsedTime * 42) * 0.035
      : motion.rotation + reaction.rotation + idle.rotation;
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
        <group ref={contactShadow} position={[0, 0.035, 0.12]}>
          {/* Two shadows, because a floor gets two.
              The ellipses are the occlusion pool: the ambient light a body
              blocks simply by being in the way, which is soft, centred under
              the feet and pose-independent. They are the only part an ellipse
              was ever right for, so they stay — just weaker, now that they are
              not also pretending to be the cast shadow. */}
          {[1, 0.62].map((scale, index) => (
            <mesh
              key={scale}
              renderOrder={-1}
              rotation-x={-Math.PI / 2}
              scale={[0.78 * scale, 0.28 * scale, 1]}
            >
              <circleGeometry args={[1, 48]} />
              <meshBasicMaterial
                ref={(material) => { contactShadowMaterials.current[index] = material; }}
                color="#020307"
                depthWrite={false}
                opacity={0.07 + index * 0.055}
                polygonOffset
                polygonOffsetFactor={-1}
                transparent
              />
            </mesh>
          ))}
          {/* And the cast shadow, thrown by the key, shaped like the pose. */}
          {textures === null ? null : (
            <SpriteGroundShadow
              height={DISPLAY_HEIGHT}
              materialRef={(material) => {
                contactShadowMaterials.current[2] = material;
              }}
              texture={textures.current}
              width={DISPLAY_HEIGHT}
            />
          )}
        </group>
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
              {/* Player rim.
                  This used to be nine planes: an eight-way black ink shell plus
                  a coloured copy, each one the whole atlas nudged a few pixels.
                  Nine hard-edged copies of an aliased silhouette is nine sets of
                  staircase, and stacking them is what produced the chunky halo
                  around every fighter — the single strongest "cut-out sticker"
                  cue in the frame.
                  The relight now grows a real rim out of the alpha gradient, so
                  the contour is antialiased and free. What is left here is only
                  the *player* cue — which fighter is yours — kept faint and
                  tight, because it no longer has to do the separating on its
                  own. Eight draw calls per fighter went with it. */}
              <PhotoPlane
                materialRef={() => undefined}
                opacity={0.42}
                positionZ={-0.008}
                scale={1.014}
                texture={textures.current}
                tint={fighterId === 'p1' ? '#5ce6ff' : '#ffb03c'}
                toneMapped={false}
                width={width}
              />
              <PhotoPlane
                materialRef={previousMaterial}
                positionZ={-0.002}
                texture={textures.previous}
                tint="#ffffff"
                surface={surface ?? undefined}
                width={width}
              />
              <PhotoPlane
                materialRef={currentMaterial}
                positionZ={0}
                texture={textures.current}
                width={width}
                tint="#ffffff"
                surface={surface ?? undefined}
              />
            </>
          )}
        </group>
        {kind === 'glitch' ? <GlitchSpriteEffects fighterId={fighterId} /> : null}
      </group>
    </>
  );
}

function clampBend(value: number): number {
  return Math.max(-MAX_BEND, Math.min(MAX_BEND, value));
}

function PhotoPlane({
  materialRef,
  opacity = 1,
  positionX = 0,
  positionZ,
  scale = 1,
  texture,
  tint,
  surface,
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
  /** Present on the two body planes; absent on shells, rims and dash echoes. */
  readonly surface?: HeroSurfaceUniforms;
  readonly toneMapped?: boolean;
  readonly width: number;
}) {
  return (
    <mesh position-x={positionX} position-z={positionZ} scale={scale}>
      {/* Subdivided only where the bend needs somewhere to happen. The ink
          rim and the dash echoes stay a single quad: they are copies of the
          silhouette and have no body to overlap. */}
      <planeGeometry
        args={surface === undefined
          ? [width, DISPLAY_HEIGHT]
          : [width, DISPLAY_HEIGHT, 8, 20]}
      />
      <meshBasicMaterial
        onBeforeCompile={
          surface === undefined ? undefined : applyHeroSurfaceLighting(surface)
        }
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

function prepareTexture(texture: Texture, anisotropy: number): void {
  texture.colorSpace = SRGBColorSpace;
  // High mode loads a 4096px AVIF sheet, so an authored frame is 1024px and
  // the fighter inside it is around 700px tall. On screen that fighter is
  // roughly 400px. The atlas is therefore *minified*, not magnified — and a
  // minified texture sampled off the base level with no mipmap is undersampled
  // by about 1.7x, which is exactly the staircase that made these characters
  // read as pixel art no matter how good the artwork was.
  //
  // Mipmaps were previously off out of a fear of cel bleed: neighbouring frames
  // in the sheet average together at high mip levels. That is a real effect,
  // but it needs level 4 or 5 before a neighbouring cel is within reach, and
  // this atlas never resolves past level 1-2 at any supported window size.
  // Anisotropic filtering keeps those low levels sharp along the vertical,
  // which is the axis a standing fighter has all of its detail on.
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = anisotropy;
  texture.repeat.set(1 / PHOTO_COLUMNS, 1 / PHOTO_ROWS);
}

function setTextureFrame(texture: Texture, frame: number): void {
  const column = frame % PHOTO_COLUMNS;
  const row = Math.floor(frame / PHOTO_COLUMNS);
  texture.offset.set(column / PHOTO_COLUMNS, 1 - (row + 1) / PHOTO_ROWS);
}
