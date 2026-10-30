'use client';

import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { PMREMGenerator } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/** Local studio reflections give metal a readable surface between direct highlights. */
export function ForgeReflections() {
  const gl = useThree(state => state.gl);
  const scene = useThree(state => state.scene);
  useEffect(() => {
    const previous = scene.environment;
    const previousIntensity = scene.environmentIntensity;
    const generator = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = generator.fromScene(room, .04);
    // Three's scene is mutable renderer state, not a React-owned value.
    // eslint-disable-next-line react-hooks/immutability
    scene.environment = target.texture;
    scene.environmentIntensity = .65;
    room.dispose();
    generator.dispose();
    return () => {
      if (scene.environment === target.texture) {
        scene.environment = previous;
        scene.environmentIntensity = previousIntensity;
      }
      target.dispose();
    };
  }, [gl, scene]);
  return null;
}
