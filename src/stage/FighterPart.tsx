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
      <mesh geometry={geometry} material={outlineMaterial} renderOrder={0} />
      <mesh geometry={geometry} material={toonMaterial} renderOrder={1} />
    </group>
  );
}
