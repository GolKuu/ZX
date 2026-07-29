import type { BufferGeometry, Material } from 'three';

type Vector3Tuple = [number, number, number];

type FighterPartProps = {
  geometry: BufferGeometry;
  outlineMaterial: Material;
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
  toonMaterial: Material;
};

export function FighterPart({
  geometry,
  outlineMaterial,
  position,
  rotation,
  scale,
  toonMaterial,
}: FighterPartProps) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* The hull is a back-faced duplicate — casting from it would double the
          shadow and fatten it by the outline width. */}
      <mesh geometry={geometry} material={outlineMaterial} renderOrder={0} />
      <mesh castShadow geometry={geometry} material={toonMaterial} receiveShadow renderOrder={1} />
    </group>
  );
}
