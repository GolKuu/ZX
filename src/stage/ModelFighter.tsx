'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Group, PerspectiveCamera } from 'three';
import {
  combatRenderFrame,
  readCombatFighter,
} from '@/src/game/combatRuntime';
import {
  bandsFor,
  paletteFor,
  type CharacterPalette,
  type ZonePalette,
} from '@/src/data/characterPalettes';
import type { CharacterId } from '@/src/data/characterRoster';
import { createCelGradient } from '@/src/render/celGradient';
import {
  createSkinnedOutlineMaterial,
  updateSkinnedOutlineProjection,
} from '@/src/render/skinnedOutlineMaterial';
import { createToonMaterial, updateRimAxis } from '@/src/render/toonMaterial';
import { FIXED_SCALE } from '@/src/sim';
import {
  loadFighterModel,
  type FighterZones,
  type LoadedFighterModel,
} from './model/loadFighterModel';
import { applyArmSilhouette } from './model/armSilhouette';
import { applyFighterPose } from './model/modelPose';
import { withOpponentFacing } from './fighterPresentation';

/**
 * A fighter backed by a rigged GLB instead of primitives.
 *
 * The mesh is an asset; the motion is not. Every pose comes from
 * `model/modelPose.ts`, driven by the simulation snapshot, so rule R4 still
 * holds — the sim owns the timeline and animation reads it.
 *
 * If the model is absent or its rig cannot be resolved, `fallback` renders
 * instead and the match is unaffected. That matters: the asset lives in
 * `public/`, is not in version control, and a missing file must never be the
 * difference between a playable build and a blank screen.
 */

/**
 * Extra body yaw toward the opponent, on top of the stance yaw in the pose
 * tables. Together they land near 40° — a three-quarter read, so the costume
 * front stays legible while the attack silhouette still points along the
 * combat axis.
 */
const STANCE_YAW = 0.38;

interface ModelFighterProps {
  readonly url: string;
  readonly auraColor: string;
  readonly fighterId: 'p1' | 'p2';
  readonly characterId: CharacterId;
  /** Rendered while the model is loading, or permanently if it fails. */
  readonly fallback?: ReactNode;
}

export function ModelFighter({
  url,
  auraColor,
  characterId,
  fighterId,
  fallback = null,
}: ModelFighterProps) {
  const outer = useRef<Group>(null);
  const model = useRef<LoadedFighterModel | null>(null);
  const [ready, setReady] = useState(false);

  const gradient = useMemo(() => createCelGradient(), []);
  // Inked, not shaded. The character sheets are defined by a heavy, even black
  // contour that does not thin with distance, so the falloff is off and the
  // colour is a true near-black rather than the old blue-grey.
  const outline = useMemo(
    () => createSkinnedOutlineMaterial({
      color: '#07070c',
      falloff: false,
      pixelWidth: 3.6,
    }),
    [],
  );
  const zones = useMemo(
    () => createFighterZones(gradient, auraColor, paletteFor(characterId)),
    [auraColor, characterId, gradient],
  );

  const viewportHeight = useThree((state) => state.size.height);
  const camera = useThree((state) => state.camera);
  const opponentId = fighterId === 'p1' ? 'p2' : 'p1';

  useEffect(() => {
    const fov = camera instanceof PerspectiveCamera ? camera.fov : 45;
    updateSkinnedOutlineProjection(outline, viewportHeight, fov);
  }, [camera, outline, viewportHeight]);

  useEffect(() => {
    let cancelled = false;

    loadFighterModel({ url, zones, outline })
      .then((loaded) => {
        if (cancelled) {
          loaded.dispose();
          return;
        }
        for (const warning of loaded.warnings) {
          console.warn(`[${fighterId}] ${url}: ${warning}`);
        }
        model.current = loaded;
        outer.current?.add(loaded.root);
        setReady(true);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.warn(
          `[${fighterId}] Could not load ${url}; using the fallback fighter.`,
          error,
        );
      });

    return () => {
      cancelled = true;
      model.current?.dispose();
      model.current = null;
      setReady(false);
    };
  }, [fighterId, outline, url, zones]);

  // Three separate lifetimes, deliberately.
  //
  // These used to share one cleanup keyed on `[gradient, outline, zones]`.
  // `zones` is rebuilt whenever the palette changes — which happens on a
  // rematch with a different character — and that fired the shared cleanup,
  // disposing `gradient` and `outline` too. Both are memoised on `[]`, so they
  // were never rebuilt: the fighter came back with a disposed ramp texture and
  // a disposed outline material. Each resource now ends with its own.
  useEffect(() => () => gradient.dispose(), [gradient]);
  useEffect(() => () => outline.dispose(), [outline]);
  useEffect(() => () => {
    for (const material of Object.values(zones)) material.dispose();
  }, [zones]);

  useFrame(({ camera: activeCamera, clock }) => {
    const loaded = model.current;
    const group = outer.current;
    const fighter = readCombatFighter(fighterId);
    if (loaded === null || group === null || fighter === null) return;

    const alpha = combatRenderFrame.interpolationAlpha;
    group.position.x = (
      fighter.previousPosition.x
      + (fighter.position.x - fighter.previousPosition.x) * alpha
    ) / FIXED_SCALE;
    group.position.y = fighter.position.y / FIXED_SCALE;
    // Turn into the opponent. The pose tables carry ~19° of stance yaw at the
    // hips, which reads almost frontal; the sheets draw a three-quarter profile,
    // so the rest of the turn happens here where it costs one assignment and
    // stays consistent across every pose.
    const opponent = readCombatFighter(opponentId);
    const presentation = withOpponentFacing(fighter, opponent);
    group.rotation.y = presentation.facing * STANCE_YAW;

    applyFighterPose(
      loaded.joints,
      loaded.rest,
      presentation,
      clock.elapsedTime,
    );
    applyArmSilhouette(loaded.joints);

    const self = { x: group.position.x, z: group.position.z };
    const other = opponent === null
      ? { x: self.x + presentation.facing, z: self.z }
      : { x: opponent.position.x / FIXED_SCALE, z: self.z };
    for (const material of loaded.toonMaterials) {
      updateRimAxis(material, self, other, activeCamera.matrixWorldInverse);
    }
  });

  return (
    <>
      <group ref={outer} />
      {ready ? null : fallback}
    </>
  );
}

/**
 * Palette per `CHR-CCU-810` §5. Shadow tints are hue shifts, never a multiply —
 * skin toward plum, white hair toward lilac, dark cloth toward violet.
 *
 * Every zone also carries the *whole* palette as vertical bands. The stock
 * models merge their surfaces into one or two materials, so whichever zone a
 * mesh resolves to has to be able to paint a complete character on its own; the
 * band split is what turns a single-material mannequin back into boots,
 * trousers, coat, skin and hair. `heightRange` is a placeholder here and is
 * corrected to the model's real bind-pose extent once it loads.
 */
function createFighterZones(
  gradient: ReturnType<typeof createCelGradient>,
  auraColor: string,
  palette: CharacterPalette,
): FighterZones {
  const bands = bandsFor(palette);
  const zone = ({ lit, shade, rim, shadow }: ZonePalette) =>
    createToonMaterial({
      color: lit,
      gradientMap: gradient,
      shadowTint: shade,
      shadowStrength: shadow,
      rimColor: auraColor,
      rimStrength: rim,
      heightZones: bands,
      heightRange: [0, 1],
    });

  return {
    hair: zone(palette.hair),
    skin: zone(palette.skin),
    coat: zone(palette.coat),
    trousers: zone(palette.trousers),
    boot: zone(palette.boot),
    eye: zone(palette.eye),
    body: zone(palette.body),
  };
}
