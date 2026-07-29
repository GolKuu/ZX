/**
 * Loads a purchased / downloaded rigged character and makes it ours.
 *
 * Three things happen here, and all three are required — a GLB dropped into
 * the scene untouched will not match anything else on screen:
 *
 *   1. **Materials are replaced.** Whatever the vendor shipped (almost always
 *      PBR standard materials) is discarded and every surface is reassigned to
 *      one of our toon zones. This is the single step that makes a bought asset
 *      look like it belongs in this game.
 *   2. **An outline hull is built.** A back-faced duplicate sharing the same
 *      skeleton, so it deforms with the character instead of standing still.
 *   3. **Scale is solved, not assumed.** The model is measured and fitted to
 *      the engine's rig anchors. Vendors disagree about units; the engine does
 *      not care as long as the head lands where the camera expects it.
 *
 * Animation clips inside the file are deliberately ignored — see `modelPose.ts`.
 */

import {
  Box3,
  Mesh,
  SkinnedMesh,
  Vector3,
  type Group,
  type Material,
  type Object3D,
} from 'three';
import type { ToonMaterial } from '@/src/render/toonMaterial';
import type { SkinnedOutlineMaterial } from '@/src/render/skinnedOutlineMaterial';
import {
  reportJoints,
  resolveHumanoidJoints,
  type HumanoidJoints,
} from './humanoidBones';
import { captureRestPose, type RestPose } from './modelPose';

/**
 * Surface zones. Every mesh in the file resolves to exactly one of these, so
 * each can carry its own shadow hue — the rule the whole look depends on
 * (ART-CCU-400 §A2).
 */
export interface FighterZones {
  readonly hair: ToonMaterial;
  readonly skin: ToonMaterial;
  readonly coat: ToonMaterial;
  readonly trousers: ToonMaterial;
  readonly boot: ToonMaterial;
  readonly eye: Material;
  /** Anything the keyword pass cannot place. */
  readonly body: ToonMaterial;
}

type ZoneName = keyof FighterZones;

/**
 * Keyword → zone, checked in order against the vendor's material name and then
 * the mesh name. Ordering matters: `eyebrow` must not fall into `eye`, so the
 * more specific keys come first.
 */
const ZONE_KEYWORDS: readonly (readonly [ZoneName, readonly string[]])[] = [
  ['hair', ['hair', 'brow', 'lash', 'fringe', 'ponytail', 'beard']],
  ['eye', ['eye', 'cornea', 'iris', 'sclera', 'pupil']],
  ['boot', ['boot', 'shoe', 'foot', 'sole', 'sandal']],
  ['trousers', ['trouser', 'pant', 'leg', 'short', 'skirt', 'hakama']],
  [
    'coat',
    [
      'coat', 'jacket', 'cloth', 'shirt', 'top', 'robe', 'armor', 'armour',
      'vest', 'collar', 'belt', 'suit',
      // Vendor names from the stock models currently in public/models/.
      'visor', 'vanguard',
    ],
  ],
  [
    'skin',
    [
      'skin', 'body', 'face', 'head', 'hand', 'arm', 'flesh',
      // Mixamo's mannequin rigs split into joint caps and limb shells.
      'joint', 'limb', 'beta',
    ],
  ],
];

function zoneFor(materialName: string, meshName: string): ZoneName {
  const haystack = `${materialName} ${meshName}`.toLowerCase();
  for (const [zone, keywords] of ZONE_KEYWORDS) {
    for (const keyword of keywords) {
      if (haystack.includes(keyword)) return zone;
    }
  }
  return 'body';
}

export interface FighterModelOptions {
  /** Public URL, e.g. `/models/void-walker.glb`. */
  readonly url: string;
  readonly zones: FighterZones;
  readonly outline: SkinnedOutlineMaterial;
  /**
   * Target height in engine units. Defaults to the skull-crown rig anchor so a
   * loaded model lines up with the primitive blockout it replaces.
   */
  readonly targetHeight?: number;
  /** Set false while tuning a new asset. */
  readonly withOutline?: boolean;
}

export interface LoadedFighterModel {
  readonly root: Group;
  readonly joints: HumanoidJoints;
  readonly rest: RestPose;
  /** Live toon materials, for the per-frame rim axis and impact flash. */
  readonly toonMaterials: readonly ToonMaterial[];
  readonly warnings: readonly string[];
  dispose(): void;
}

/** Skull-crown anchor from `resetZoroRig`. */
const DEFAULT_TARGET_HEIGHT = 2.62;

function isSkinned(object: Object3D): object is SkinnedMesh {
  return (object as { isSkinnedMesh?: boolean }).isSkinnedMesh === true;
}

function isMesh(object: Object3D): object is Mesh {
  return (object as { isMesh?: boolean }).isMesh === true;
}

export async function loadFighterModel(
  options: FighterModelOptions,
): Promise<LoadedFighterModel> {
  // Imported on demand, not at module scope. The loader is only needed when a
  // model file actually exists, and at module scope it lands in the initial
  // bundle for every player — including those on the primitive fallback.
  const { GLTFLoader } = await import(
    'three/examples/jsm/loaders/GLTFLoader.js'
  );
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(options.url);
  const root = gltf.scene;
  const warnings: string[] = [];

  // --- scale before anything reads a world position ---
  const bounds = new Box3().setFromObject(root);
  const size = new Vector3();
  bounds.getSize(size);
  const target = options.targetHeight ?? DEFAULT_TARGET_HEIGHT;
  if (size.y > 0.0001) {
    const scale = target / size.y;
    root.scale.setScalar(scale);
    root.position.y = -bounds.min.y * scale;
  } else {
    warnings.push('Model has zero height; scale left at 1.');
  }

  // --- materials and outline ---
  const usedToon = new Set<ToonMaterial>();
  const ownedGeometry = new Set<Mesh['geometry']>();
  const outlineMeshes: Mesh[] = [];
  const originals: Material[] = [];

  const meshes: Mesh[] = [];
  root.traverse((object) => {
    if (isMesh(object)) meshes.push(object);
  });

  for (const mesh of meshes) {
    const previous = mesh.material;
    for (const material of Array.isArray(previous) ? previous : [previous]) {
      originals.push(material);
    }

    const firstName = Array.isArray(previous)
      ? (previous[0]?.name ?? '')
      : previous.name;
    const zone = zoneFor(firstName, mesh.name);
    const replacement = options.zones[zone];
    mesh.material = replacement;
    ownedGeometry.add(mesh.geometry);

    if (zone !== 'eye') {
      const toon = replacement as ToonMaterial;
      if ('toon' in toon) usedToon.add(toon);
    }

    // Skinned bounds are computed from the bind pose, so an animated limb
    // leaving that box makes the whole character vanish at screen edges.
    if (isSkinned(mesh)) mesh.frustumCulled = false;

    // Eyes are drawn elements, not surfaces — no outline pass, ever.
    if (options.withOutline === false || zone === 'eye') continue;

    const hull = buildOutlineHull(mesh, options.outline);
    if (hull !== null) {
      outlineMeshes.push(hull);
      mesh.parent?.add(hull);
    }
  }

  // Vendor materials are ours to release; we replaced every reference.
  for (const material of originals) material.dispose();

  // --- skeleton ---
  const joints = resolveHumanoidJoints(root);
  const report = reportJoints(joints);
  if (!report.usable) {
    warnings.push(
      `Rig is missing required joints: ${report.missing.join(', ')}. `
      + 'Add aliases in humanoidBones.ts.',
    );
  } else if (report.missing.length > 0) {
    warnings.push(`Optional joints unresolved: ${report.missing.join(', ')}.`);
  }

  const rest = captureRestPose(joints);

  return {
    root,
    joints,
    rest,
    toonMaterials: [...usedToon],
    warnings,
    dispose() {
      for (const hull of outlineMeshes) {
        hull.removeFromParent();
      }
      for (const geometry of ownedGeometry) {
        geometry.dispose();
      }
      root.removeFromParent();
    },
  };
}

/**
 * Back-faced duplicate sharing the source geometry *and skeleton*, so it
 * deforms with the character. Sharing the skeleton rather than cloning it is
 * what keeps the hull locked to the mesh with no second update cost.
 */
function buildOutlineHull(
  mesh: Mesh,
  material: SkinnedOutlineMaterial,
): Mesh | null {
  if (isSkinned(mesh)) {
    const hull = new SkinnedMesh(mesh.geometry, material);
    hull.name = `${mesh.name}__outline`;
    hull.bindMode = mesh.bindMode;
    hull.bind(mesh.skeleton, mesh.bindMatrix);
    hull.position.copy(mesh.position);
    hull.quaternion.copy(mesh.quaternion);
    hull.scale.copy(mesh.scale);
    hull.frustumCulled = false;
    hull.renderOrder = -1;
    return hull;
  }

  const hull = new Mesh(mesh.geometry, material);
  hull.name = `${mesh.name}__outline`;
  hull.position.copy(mesh.position);
  hull.quaternion.copy(mesh.quaternion);
  hull.scale.copy(mesh.scale);
  hull.renderOrder = -1;
  return hull;
}
