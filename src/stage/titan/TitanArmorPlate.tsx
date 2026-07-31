import { useMemo } from 'react';
import { ExtrudeGeometry, Shape } from 'three';

export type TitanPlateProps = {
  readonly position?: [number, number, number];
  readonly rotation?: [number, number, number];
  readonly scale?: [number, number, number];
  readonly color?: string;
  readonly inset?: boolean;
};

/** A reusable chamfered trapezoid—the basic language of Titan's armor shell. */
export function TitanArmorPlate({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  color = '#39434a',
  inset = false,
}: TitanPlateProps) {
  const geometry = useMemo(() => {
    const outline = new Shape();
    outline.moveTo(-0.46, -0.5);
    outline.lineTo(0.46, -0.5);
    outline.lineTo(0.55, 0.3);
    outline.lineTo(0.34, 0.5);
    outline.lineTo(-0.34, 0.5);
    outline.lineTo(-0.55, 0.3);
    outline.closePath();
    const result = new ExtrudeGeometry(outline, {
      depth: 0.2,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.055,
      bevelThickness: 0.055,
      curveSegments: 1,
    });
    result.center();
    return result;
  }, []);

  return (
    <mesh
      castShadow
      receiveShadow
      geometry={geometry}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <meshPhysicalMaterial
        color={color}
        metalness={inset ? 0.72 : 0.91}
        roughness={inset ? 0.5 : 0.24}
        clearcoat={inset ? 0.15 : 0.42}
        clearcoatRoughness={0.3}
        envMapIntensity={1.35}
      />
    </mesh>
  );
}
