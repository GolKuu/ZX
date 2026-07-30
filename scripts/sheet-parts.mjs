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

/** Full sheets, for reading panel boxes off a coarse grid. */
export const WHOLE_SHEETS = {
  'echo-sheet': {
    file: 'public/echo-character-sheet.png',
    crop: { left: 0, top: 0, width: 1152, height: 768 },
  },
  'chrono-sheet': {
    file: 'public/chrono-character-sheet.png',
    crop: { left: 0, top: 0, width: 1152, height: 648 },
  },
  'idol-sheet': {
    file: 'public/assets/characters/idol-fighter-reference.webp',
    crop: { left: 0, top: 0, width: 1536, height: 1024 },
  },
  'glitch-sheet': {
    file: '../output/imagegen/glitch-character-reference.png',
    crop: { left: 0, top: 0, width: 1536, height: 1024 },
  },
};

export const FRONT_VIEWS = {
  ...WHOLE_SHEETS,
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
  'echo-profile': {
    file: 'public/echo-character-sheet.png',
    crop: { left: 862, top: 58, width: 168, height: 360 },
    // Near-white armour: match the paper colour rather than a value floor.
    // No cleanup pass: ECHO's armour highlights are brighter than any safe
    // cleanup threshold, so growing into leftovers tunnels straight into the
    // costume. A few flecks in the margin are cheaper than a holed character.
    key: { tolerance: 16 },
  },
  // `facesRight` is per sheet, not a convention: IDOL's profile columns are both
  // drawn facing screen-left, while CHRONO's and GLITCH's face right. The runtime
  // mirrors from this, so getting it wrong points a fighter away from its
  // opponent.
  'chrono-profile': {
    file: 'public/chrono-character-sheet.png',
    crop: { left: 922, top: 78, width: 146, height: 326 },
    facesRight: true,
  },
  'glitch-profile': {
    file: '../output/imagegen/glitch-character-reference.png',
    crop: { left: 1118, top: 82, width: 176, height: 424 },
    facesRight: true,
  },
  glitch: {
    file: '../output/imagegen/glitch-character-reference.png',
    crop: { left: 90, top: 60, width: 280, height: 470 },
  },
};

/**
 * Whole-body attack poses, as the artist drew them.
 *
 * A jointed rig can approximate a punch; it cannot match a drawing. These are the
 * LP / HP / LK / HK panels, cropped to the figure and shown at the strike, so the
 * frame a player actually reads is the sheet's own artwork.
 *
 * `ground` is the pixel row the character's feet stand on inside the crop — the
 * sprite is anchored there rather than centred, because these poses have wildly
 * different bounding boxes (a sweep is half the height of a high kick) and any
 * other anchor makes the fighter bob between moves.
 *
 * Caveat, unavoidable: the panels are hitbox *diagrams*. Blue hurtbox and green
 * collision rectangles are drawn over the figure, and the aggressive key below
 * only removes the ones lying over bare paper. Where a box overlaps the character
 * it tints it. IDOL and GLITCH are drawn in full colour and survive this well;
 * ECHO and CHRONO render their attack figures as solid blue hurtbox volumes with
 * no costume colour at all, so they are deliberately absent here and keep the rig.
 */
export const ATTACK_POSES = {
  idol: {
    file: 'public/assets/characters/idol-fighter-reference.webp',
    // Pale box fills over bare paper get flooded away along with the paper.
    key: { light: 148 },
    ground: 958,
    poses: {
      lp: { left: 52, top: 580, width: 260, height: 390 },
      hp: { left: 384, top: 578, width: 232, height: 392 },
      lk: { left: 762, top: 680, width: 330, height: 290 },
      hk: { left: 1140, top: 578, width: 350, height: 392 },
    },
  },
  glitch: {
    file: '../output/imagegen/glitch-character-reference.png',
    key: { light: 178 },
    ground: 908,
    poses: {
      lp: { left: 40, top: 600, width: 300, height: 320 },
      hp: { left: 366, top: 590, width: 260, height: 330 },
      lk: { left: 748, top: 660, width: 300, height: 260 },
      hk: { left: 1086, top: 590, width: 280, height: 330 },
    },
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
  // No arm parts, on purpose.
  //
  // In a profile the near arm lies over the torso and its hand over the skirt, so
  // any torso rectangle contains the sleeve and any hips rectangle contains the
  // glove. Cutting separate arm parts on top of those put *three* copies of the
  // arm on screen, each rotating independently — that is the smeared, stretched
  // limb in the reported screenshot, not a scaling bug.
  //
  // A walk does not need an articulated arm, and attacks are whole-body sheet
  // poses (`ATTACK_POSES`), so the arm is simply left where the artist drew it.
  'idol-profile': {
    ponytail: { box: [80, 12, 72, 152], pivot: [0.21, 0.12] },
    head: { box: [28, 8, 76, 100], pivot: [0.49, 0.92] },
    torso: { box: [56, 96, 88, 110], pivot: [0.16, 0.96] },
    hips: { box: [26, 193, 92, 106], pivot: [0.48, 0.05] },
    sash: { box: [93, 212, 60, 142], pivot: [0.2, 0.04] },
    thigh: { box: [58, 283, 50, 76], pivot: [0.48, 0.07] },
    shin: { box: [60, 348, 46, 80], pivot: [0.43, 0.06] },
    boot: { box: [36, 413, 76, 72], pivot: [0.55, 0.1] },
  },

  // ECHO. `sash` is the coat tail, `ponytail` the shoulder ring — the two
  // decorative slots are generic trailing pieces, named for the first character
  // that needed them.
  'echo-profile': {
    ponytail: { box: [40, 60, 62, 78], pivot: [0.85, 0.4] },
    head: { box: [96, 18, 56, 74], pivot: [0.45, 0.94] },
    torso: { box: [92, 84, 58, 92], pivot: [0.5, 0.98] },
    hips: { box: [78, 168, 76, 96], pivot: [0.52, 0.05] },
    sash: { box: [128, 150, 42, 150], pivot: [0.3, 0.04] },
    upperArm: { box: [104, 92, 40, 64], pivot: [0.5, 0.08] },
    forearm: { box: [96, 148, 44, 76], pivot: [0.52, 0.06] },
    thigh: { box: [104, 250, 44, 62], pivot: [0.5, 0.07] },
    shin: { box: [102, 300, 44, 48], pivot: [0.5, 0.08] },
    boot: { box: [92, 330, 62, 30], pivot: [0.5, 0.12] },
  },

  // CHRONO wears a floor-length coat, so `hips` is the coat and the leg parts
  // only cover the armoured shins and boots that show beneath it. The walk reads
  // through the coat's sway rather than through the legs.
  'chrono-profile': {
    ponytail: { box: [52, 8, 60, 40], pivot: [0.3, 0.5] },
    head: { box: [52, 10, 66, 68], pivot: [0.45, 0.91] },
    torso: { box: [42, 60, 78, 112], pivot: [0.49, 0.98] },
    hips: { box: [16, 158, 104, 140], pivot: [0.6, 0.03] },
    sash: { box: [14, 190, 60, 130], pivot: [0.7, 0.05] },
    upperArm: { box: [76, 76, 44, 72], pivot: [0.5, 0.07] },
    forearm: { box: [80, 138, 46, 80], pivot: [0.52, 0.06] },
    thigh: { box: [72, 252, 46, 52], pivot: [0.5, 0.06] },
    shin: { box: [74, 282, 42, 32], pivot: [0.5, 0.08] },
    boot: { box: [64, 298, 54, 26], pivot: [0.55, 0.12] },
  },

  // GLITCH and ECHO are not calibrated yet.
  //
  // Their rectangles have to be read off `sheet-grid.mjs <name>-profile --keyed`,
  // in that crop's own pixel space — measuring on the full sheet instead produces
  // coordinates outside the crop, which is what the clamp warning catches. ECHO
  // additionally needs a decision about its near-white armour: the automatic key
  // cannot separate it from the paper it is drawn on.
};
