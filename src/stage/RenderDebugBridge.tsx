'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { combatRenderFrame, readLatestBlock, readLatestHit } from '@/src/game/combatRuntime';
import { useHudStore } from '@/src/store/hudStore';

/**
 * Publishes the live renderer and scene on `window.__ccu` so the screenshot and
 * probe harnesses in `scripts/` can inspect what the frame is actually doing —
 * whether the shadow map is on, which meshes cast, what a material compiled to.
 *
 * R3F v9 keeps its store on the three.js objects rather than the DOM node, so
 * there is no way in from outside without a hook like this.
 *
 * Development only. `RenderScene` gates the mount on `NODE_ENV`, so the whole
 * component is dead code eliminated from a production bundle.
 */
export function RenderDebugBridge() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    (window as unknown as { __ccu?: unknown }).__ccu = {
      camera, gl, scene,
      // Read-only snapshots let runtime checks compare visible meters and poses
      // with the authoritative combat state, without bypassing player input.
      readCombat: () => combatRenderFrame.world,
      readHud: () => useHudStore.getState().snapshot,
      readContacts: () => ({
        hits: ['p1', 'p2'].map(readLatestHit),
        blocks: ['p1', 'p2'].map(readLatestBlock),
      }),
    };
    return () => {
      delete (window as unknown as { __ccu?: unknown }).__ccu;
    };
  }, [camera, gl, scene]);

  return null;
}
