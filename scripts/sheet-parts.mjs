// Where each character's front view lives on its sheet, and how that drawing is
// cut into a 2D paper-doll rig.
//
// Single source of truth for both the calibration grid (`sheet-grid.mjs`) and
// the slicer (`slice-characters.mjs`). Coordinates are pixels **inside the
// cropped front view**, not the original sheet, so a part rectangle can be read
// straight off the gridded preview.
//
// MIM is absent on purpose: its sheet has never been saved into the repository.
// Drop it at `public/mim-character-sheet.png` and add an entry here.

export const FRONT_VIEWS = {
  echo: {
    file: 'public/echo-character-sheet.png',
    crop: { left: 20, top: 40, width: 290, height: 390 },
  },
  chrono: {
    file: 'public/chrono-character-sheet.png',
    crop: { left: 20, top: 30, width: 290, height: 290 },
  },
  idol: {
    file: 'public/assets/characters/idol-fighter-reference.webp',
    crop: { left: 300, top: 40, width: 260, height: 500 },
  },
  // The rig is cut from a *profile*, not the front view.
  //
  // A front-facing cut-out whose limbs are rotated reads as a character facing
  // the viewer and flailing — the arms swing across the chest instead of along
  // the combat axis. The sheets draw a full side view for exactly this purpose.
  // Both profile columns happen to face screen-left, so the sprite is mirrored
  // for a fighter facing right, which costs nothing.
  'idol-profile': {
    file: 'public/assets/characters/idol-fighter-reference.webp',
    crop: { left: 1085, top: 40, width: 165, height: 490 },
  },
  glitch: {
    file: '../output/imagegen/glitch-character-reference.png',
    crop: { left: 90, top: 60, width: 280, height: 470 },
  },
};

/**
 * Part rectangles, read off the gridded preview.
 *
 * `box` is [x, y, width, height] inside the cropped view. `pivot` is the joint
 * the part rotates about, as a fraction of its own box — [0.5, 0] is the top
 * edge's midpoint. A limb pivots at the end nearest the body, which is what lets
 * the runtime hang one part off another and rotate it like a bone.
 *
 * The profile shows one arm and one leg. The rig reuses each for the far side,
 * drawn behind and tinted down — standard practice for a 2D cut-out fighter and
 * the reason a side view is worth cutting in the first place.
 */
export const PART_RECTS = {
  // Read off the *keyed* cutout, not the raw sheet — the transparency is what
  // makes the joint positions legible.
  //
  // Known limitation: the near arm overlaps the torso in a profile drawing, so
  // the torso rectangle has a copy of the sleeve baked into it. There is no way
  // to separate them from a single flat image without inpainting. The arm parts
  // draw on top, which hides it in most poses; a fully clean rig needs the art
  // delivered in layers.
  'idol-profile': {
    ponytail: { box: [80, 12, 72, 152], pivot: [0.21, 0.12] },
    head: { box: [28, 8, 76, 100], pivot: [0.49, 0.92] },
    torso: { box: [30, 98, 72, 108], pivot: [0.5, 0.99] },
    hips: { box: [26, 193, 92, 106], pivot: [0.48, 0.05] },
    sash: { box: [93, 212, 60, 142], pivot: [0.2, 0.04] },
    upperArm: { box: [60, 103, 42, 74], pivot: [0.5, 0.09] },
    forearm: { box: [43, 170, 50, 114], pivot: [0.54, 0.05] },
    thigh: { box: [58, 283, 50, 76], pivot: [0.48, 0.07] },
    shin: { box: [60, 348, 46, 80], pivot: [0.43, 0.06] },
    boot: { box: [36, 413, 76, 72], pivot: [0.55, 0.1] },
  },
};
