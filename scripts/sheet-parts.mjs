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
  'idol-profile': {
    ponytail: { box: [98, 28, 54, 226], pivot: [0.18, 0.06] },
    head: { box: [48, 16, 94, 94], pivot: [0.56, 0.94] },
    torso: { box: [60, 98, 78, 104], pivot: [0.5, 0.98] },
    hips: { box: [38, 188, 124, 116], pivot: [0.5, 0.06] },
    upperArm: { box: [88, 112, 50, 86], pivot: [0.5, 0.08] },
    forearm: { box: [92, 186, 50, 106], pivot: [0.5, 0.06] },
    thigh: { box: [86, 276, 58, 78], pivot: [0.5, 0.06] },
    shin: { box: [82, 336, 56, 82], pivot: [0.5, 0.06] },
    boot: { box: [56, 396, 88, 88], pivot: [0.62, 0.12] },
  },
};
