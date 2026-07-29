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
// Static import on purpose. The whole module is already behind one dynamic
// boundary (`LazyModelFighter`); adding a second one inside it made webpack
// emit the loader twice, once per route that reaches it.
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
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
  // Mixamo's mannequin shells (`Beta_Joints`, `Beta_Surface`, `Beta_HighLimbs`)
  // are a placeholder *dummy*, not anatomy. Tinting them as skin is what made
  // the Void Walker read as an undressed art doll; `body` lets the character
  // palette dress it as the construct it is meant to be. Checked ahead of
  // `skin` because `Beta_Surface` contains the substring "face".
  ['body', ['beta', 'mannequin', 'dummy', 'joint', 'limb']],
  ['skin', ['skin', 'body', 'face', 'head', 'hand', 'arm', 'flesh']],
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

    // Both directions: a fighter has to drop a shadow on the disc to be
    // standing on it, and take the other fighter's shadow to be beside them.
    mesh.castShadow = true;
    mesh.receiveShadow = true;

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

  // The zone bands are authored as fractions of the character's height, but the
  // shader reads the *bind-pose* vertex Y so a crouch cannot slide the boot band
  // up the shins. Only the geometry knows what range that is, and only now.
  applyBindHeightRange(meshes, usedToon);

  // --- skeleton ---
  const joints = resolveHumanoidJoints(root);

  // Turn the asset to face the camera *before* the rest pose is captured, so
  // the reference frame every authored rotation is conjugated through is the
  // one the pose tables were written against. Vendors disagree about which way
  // is forward — the two stock rigs here disagree with each other — so it is
  // measured off the skeleton rather than assumed.
  root.rotation.y = measureForwardYaw(joints) ?? 0;

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
 * Point every zone material's band split at the model's own bind-pose extent.
 *
 * Measured across all meshes together: a character whose head is a separate
 * mesh must not decide on its own that its chin is the character's feet.
 */
function applyBindHeightRange(
  meshes: readonly Mesh[],
  materials: ReadonlySet<ToonMaterial>,
): void {
  let low = Infinity;
  let high = -Infinity;
  for (const mesh of meshes) {
    mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox;
    if (box === null) continue;
    low = Math.min(low, box.min.y);
    high = Math.max(high, box.max.y);
  }
  if (!Number.isFinite(low) || !Number.isFinite(high) || high - low < 1e-4) {
    return;
  }
  for (const material of materials) {
    material.toon.uZoneRange.value = [low, high];
  }
}

const jointPosition = new Vector3();
const modelUp = new Vector3();
const modelRight = new Vector3();
const modelForward = new Vector3();

/**
 * Yaw that would turn this rig to face +Z, read off the rest pose.
 *
 * Bone *axes* are arbitrary per vendor, so the facing is derived from the
 * skeleton's shape instead: `up` runs hips → head, `right` runs left arm →
 * right arm, and `forward = up × right`. In a T-pose or an A-pose both inputs
 * are clean and symmetric, which is exactly the pose a file ships in.
 *
 * Returns null when the rig cannot answer, leaving the model as authored.
 */
function measureForwardYaw(joints: HumanoidJoints): number | null {
  const { hips, head, upperArmL, upperArmR } = joints;
  if (hips === null || head === null) return null;
  if (upperArmL === null || upperArmR === null) return null;

  hips.updateWorldMatrix(true, false);
  head.updateWorldMatrix(true, false);
  upperArmL.updateWorldMatrix(true, false);
  upperArmR.updateWorldMatrix(true, false);

  modelUp
    .setFromMatrixPosition(head.matrixWorld)
    .sub(jointPosition.setFromMatrixPosition(hips.matrixWorld));
  modelRight
    .setFromMatrixPosition(upperArmR.matrixWorld)
    .sub(jointPosition.setFromMatrixPosition(upperArmL.matrixWorld));
  modelForward.crossVectors(modelUp, modelRight);

  if (modelForward.lengthSq() < 1e-8) return null;
  if (Math.abs(modelForward.x) < 1e-4 && Math.abs(modelForward.z) < 1e-4) {
    return null;
  }
  return Math.atan2(-modelForward.x, modelForward.z);
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
    // The hull is the same geometry pushed outward along its normals; letting
    // it cast would draw a second shadow, fattened by the outline width.
    hull.castShadow = false;
    hull.receiveShadow = false;
    hull.renderOrder = -1;
    return hull;
  }

  const hull = new Mesh(mesh.geometry, material);
  hull.name = `${mesh.name}__outline`;
  hull.position.copy(mesh.position);
  hull.quaternion.copy(mesh.quaternion);
  hull.scale.copy(mesh.scale);
  hull.castShadow = false;
  hull.receiveShadow = false;
  hull.renderOrder = -1;
  return hull;
}
