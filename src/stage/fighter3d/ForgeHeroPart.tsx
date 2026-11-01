'use client';

import { useLoader } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { Mesh, MeshStandardMaterial } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { loadForgeTexture } from '../kombat/forgeTexture';

/** Multi-material glTF parts export as Groups. Preserve every primitive in the part. */
export function ForgeHeroPart({ name }: { readonly name: string }) {
  const gltf = useLoader(GLTFLoader, '/environment/forge-heroes.glb');
  const meshes = useMemo(() => {
    gltf.scene.updateMatrixWorld(true);
    const source = gltf.scene.getObjectByName(name);
    const result: Mesh[] = [];
    source?.traverse(node => {
      if (!(node instanceof Mesh)) return;
      const materials = (Array.isArray(node.material) ? node.material : [node.material]).map(original => {
        const material = original.clone();
        if (material instanceof MeshStandardMaterial) {
          material.envMapIntensity = 1.2;
          if (material.name.startsWith('Obsidian')) {
            material.map = loadForgeTexture(2);
            // Keep the authored dark basalt response; the stage map supplies grain only.
            material.roughness = .64;
          }
        }
        return material;
      });
      // A glTF primitive has one material and no geometry groups. Passing a
      // one-item array makes Three render zero groups, so the body disappears.
      const material = Array.isArray(node.material) ? materials : materials[0];
      const mesh = new Mesh(node.geometry.clone().applyMatrix4(node.matrixWorld), material);
      mesh.castShadow = mesh.receiveShadow = true;
      result.push(mesh);
    });
    return result;
  }, [gltf, name]);
  useEffect(() => () => {
    for (const mesh of meshes) {
      mesh.geometry.dispose();
      for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) material.dispose();
    }
  }, [meshes]);
  return <group dispose={null}>{meshes.map((mesh, index) => <primitive key={index} object={mesh} />)}</group>;
}
