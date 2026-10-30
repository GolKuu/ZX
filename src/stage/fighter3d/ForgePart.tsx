'use client';

import { useLoader } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { loadForgeTexture } from '../kombat/forgeTexture';
import { Mesh, MeshStandardMaterial, type BufferGeometry, type Material } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/** One cached Blender kit; geometry is baked into the engine's Y-up space.
 * Each part owns its geometry/material instance, never a shared mutable Object3D. */
export function ForgePart({ name, scale = [1, 1, 1] }: {
  readonly name: string;
  readonly scale?: readonly [number, number, number];
}) {
  const gltf = useLoader(GLTFLoader, '/environment/forge-kit.glb');
  const part = useMemo(() => {
    gltf.scene.updateMatrixWorld(true);
    const source = gltf.scene.getObjectByName(name);
    if (!(source instanceof Mesh)) return null;
    const material = Array.isArray(source.material) ? source.material.map(m => m.clone()) : source.material.clone();
    for (const m of Array.isArray(material) ? material : [material]) {
      if (m instanceof MeshStandardMaterial && m.emissive.getHex() === 0) {
        m.map = loadForgeTexture(name.startsWith('ion') ? 1 : 2);
        // The source photo is deliberately dark; retain enough albedo for key highlights.
        m.color.multiplyScalar(1.65);
      }
    }
    return { geometry: source.geometry.clone().applyMatrix4(source.matrixWorld), material };
  }, [gltf, name]);
  useEffect(() => () => {
    part?.geometry.dispose();
    for (const m of part ? (Array.isArray(part.material) ? part.material : [part.material]) : []) {
      m.dispose();
    }
  }, [part]);
  // The GLTF source stays cached; this mount owns only its cloned resources.
  return part ? <ForgeMesh geometry={part.geometry} material={part.material} scale={scale} /> : null;
}

function ForgeMesh({ geometry, material, scale }: {
  readonly geometry: BufferGeometry;
  readonly material: Material | Material[];
  readonly scale: readonly [number, number, number];
}) {
  return <mesh geometry={geometry} material={material} scale={scale} castShadow receiveShadow dispose={null} />;
}
