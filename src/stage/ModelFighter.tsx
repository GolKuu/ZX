'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Group, PerspectiveCamera } from 'three';
import {
  combatRenderFrame,
  readCombatFighter,
} from '@/src/game/combatRuntime';
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
import { applyFighterPose } from './model/modelPose';

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

interface ModelFighterProps {
  readonly url: string;
  readonly auraColor: string;
  readonly fighterId: 'p1' | 'p2';
  /** Rendered while the model is loading, or permanently if it fails. */
  readonly fallback?: ReactNode;
}

export function ModelFighter({
  url,
  auraColor,
  fighterId,
  fallback = null,
}: ModelFighterProps) {
  const outer = useRef<Group>(null);
  const model = useRef<LoadedFighterModel | null>(null);
  const [ready, setReady] = useState(false);

  const gradient = useMemo(() => createCelGradient(), []);
  const outline = useMemo(() => createSkinnedOutlineMaterial(), []);
  const zones = useMemo(
    () => createFighterZones(gradient, auraColor),
    [auraColor, gradient],
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

  useEffect(() => () => {
    gradient.dispose();
    outline.dispose();
    for (const material of Object.values(zones)) material.dispose();
  }, [gradient, outline, zones]);

  useFrame(({ camera: activeCamera, clock }, delta) => {
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
    group.rotation.y = fighter.facing === 1 ? 0 : Math.PI;

    applyFighterPose(loaded.joints, loaded.rest, fighter, clock.elapsedTime);

    const opponent = readCombatFighter(opponentId);
    const self = { x: group.position.x, z: group.position.z };
    const other = opponent === null
      ? { x: self.x + fighter.facing, z: self.z }
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
 */
function createFighterZones(
  gradient: ReturnType<typeof createCelGradient>,
  auraColor: string,
): FighterZones {
  const zone = (
    color: string,
    shadowTint: string,
    rimStrength: number,
    shadowStrength: number,
  ) => createToonMaterial({
    color,
    gradientMap: gradient,
    shadowTint,
    shadowStrength,
    rimColor: auraColor,
    rimStrength,
  });

  return {
    hair: zone('#f2f0fb', '#9b93d6', 1.0, 0.8),
    skin: zone('#e8c3a4', '#9c6a8a', 0.62, 0.7),
    coat: zone('#1c1938', '#4a2b8e', 0.85, 0.85),
    trousers: zone('#161327', '#33265e', 0.7, 0.8),
    boot: zone('#0e0c18', '#2a2140', 1.1, 0.75),
    eye: zone('#f8fbff', '#8f9ac4', 0.0, 0.0),
    body: zone('#1c1938', '#4a2b8e', 0.85, 0.85),
  };
}
