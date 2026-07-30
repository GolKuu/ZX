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
  //
  // `origin` is [x, y] in crop pixels: the body's centre line and the row its feet
  // stand on. The runtime hangs the whole rig off that point, so a drawing whose
  // figure sits off-centre or short of the crop's bottom edge still lands with its
  // soles on the floor and its weight over the pushbox.
  'idol-profile': {
    file: 'public/assets/characters/idol-fighter-reference.webp',
    crop: { left: 1085, top: 40, width: 165, height: 490 },
    origin: [63, 477],
  },
  'echo-profile': {
    file: 'public/echo-character-sheet.png',
    crop: { left: 862, top: 58, width: 168, height: 360 },
    origin: [123, 358],
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
    origin: [80, 324],
  },
  'glitch-profile': {
    file: '../output/imagegen/glitch-character-reference.png',
    crop: { left: 1118, top: 82, width: 176, height: 424 },
    facesRight: true,
    origin: [123, 414],
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
 * `box` is [x, y, width, height] inside the cropped view. `joint` is the point the
 * part rotates about, in the same crop pixels — *not* a fraction of the box, so it
 * may sit outside one, and so a joint and its parent's socket are literally the
 * same two numbers and cannot drift apart.
 *
 * `mask` cuts the part along a polygon instead of the box. `carve: true` then
 * erases that polygon from the rest of the drawing (see `sheet-mask.mjs`) so no
 * pixel ends up on two parts. Anything a limb is drawn *across* needs this.
 *
 * The profile shows one arm and one leg. The rig reuses each for the far side,
 * drawn behind and tinted down — standard practice for a 2D cut-out fighter and
 * the reason a side view is worth cutting in the first place.
 *
 * Rectangles are read off the *keyed* cutout, never the raw sheet: against the
 * paper a limb's edge is invisible and every box ends up guessed. Overlap between
 * two boxes is the failure to watch for — a pixel drawn by two parts is a piece of
 * costume that visibly splits in two the moment the parts rotate differently.
 */
export const PART_RECTS = {
  // The arm is polygon-cut, whole, from shoulder cap to fingertips.
  //
  // Cutting it as rectangles is what produced the reported doubling: the sleeve
  // fell inside the torso box and the glove inside the hips box, so the arm
  // rotated with the torso at the top and stood still with the skirt at the
  // bottom. The polygon takes the sleeve's own outline — round shoulder cap
  // included — and erases it from everything else, which is also why the shoulder
  // cannot vanish: the cap belongs to the arm and travels with it, and the jacket
  // flank behind it is filled with its own pink.
  //
  // The same rule fixed three quieter overlaps: the ponytail's curl sat inside the
  // torso box, the sash inside the hips and thigh boxes, and the boot's cuff
  // inside the shin box. Each was one piece of art drawn twice.
  'idol-profile': {
    ponytail: { box: [98, 10, 54, 156], joint: [101, 40] },
    head: { box: [26, 6, 74, 102], joint: [62, 104] },
    torso: { box: [28, 94, 72, 112], joint: [70, 202] },
    hips: { box: [26, 193, 66, 100], joint: [68, 200] },
    sash: { box: [92, 204, 62, 152], joint: [104, 214] },
    // Puffed sleeve and its white cuff. The outline runs down the armhole seam in
    // front and along the jacket's back edge behind; the bottom two rows are bare
    // skin, shared with the forearm, so the elbow never opens a gap.
    upperArm: {
      box: [54, 92, 50, 88],
      joint: [76, 110],
      carve: true,
      mask: [
        [70, 100], [80, 96], [88, 99], [95, 108], [99, 120], [100, 145],
        [98, 163], [95, 175], [86, 179], [70, 179], [63, 172], [58, 154],
        [57, 134], [58, 116], [63, 105],
      ],
    },
    // Bare forearm, wrist cuff, gloved hand. Runs across the bare midriff, the
    // skirt's waistband and the skirt itself — three garments, one polygon.
    forearm: {
      box: [48, 168, 44, 128],
      joint: [77, 180],
      carve: true,
      mask: [
        [68, 172], [90, 172], [90, 196], [86, 220], [83, 236], [80, 252],
        [78, 270], [76, 288], [66, 293], [54, 287], [50, 266], [50, 246],
        [54, 230], [62, 222], [65, 200],
      ],
    },
    // Shorts hem down; the skirt above covers the hip socket at any stride.
    thigh: { box: [42, 288, 46, 68], joint: [66, 292] },
    // Sock plus the boot's laced shaft: one rigid piece, as the boot is.
    shin: { box: [50, 350, 48, 108], joint: [66, 354] },
    boot: { box: [26, 448, 72, 32], joint: [64, 452] },
  },

  // ECHO. `sash` is the coat tail, `ponytail` the shoulder ring — the two
  // decorative slots are generic trailing pieces, named for the first character
  // that needed them.
  'echo-profile': {
    ponytail: { box: [40, 60, 62, 78], joint: [93, 91] },
    head: { box: [96, 18, 56, 74], joint: [121, 88] },
    torso: { box: [92, 84, 58, 92], joint: [121, 174] },
    hips: { box: [78, 168, 76, 96], joint: [117, 173] },
    sash: { box: [128, 150, 42, 150], joint: [141, 156] },
    upperArm: { box: [104, 92, 40, 64], joint: [124, 97] },
    forearm: { box: [96, 148, 44, 76], joint: [119, 153] },
    thigh: { box: [104, 250, 44, 62], joint: [126, 254] },
    shin: { box: [102, 300, 44, 48], joint: [124, 304] },
    boot: { box: [92, 330, 62, 30], joint: [123, 334] },
  },

  // CHRONO wears a floor-length coat, so `hips` is the coat and the leg parts
  // only cover the armoured shins and boots that show beneath it. The walk reads
  // through the coat's sway rather than through the legs.
  'chrono-profile': {
    ponytail: { box: [52, 8, 60, 40], joint: [70, 28] },
    head: { box: [52, 10, 66, 68], joint: [82, 72] },
    torso: { box: [42, 60, 78, 112], joint: [80, 170] },
    hips: { box: [16, 158, 104, 140], joint: [78, 162] },
    sash: { box: [14, 190, 60, 130], joint: [56, 196] },
    upperArm: { box: [76, 76, 44, 72], joint: [98, 81] },
    forearm: { box: [80, 138, 46, 80], joint: [104, 143] },
    thigh: { box: [72, 252, 46, 52], joint: [95, 255] },
    shin: { box: [74, 282, 42, 32], joint: [95, 285] },
    boot: { box: [64, 298, 54, 26], joint: [94, 301] },
  },

  // GLITCH's intact half supplies the actual anatomy while the wider boxes keep
  // the cyan/magenta breakup attached to each moving part.
  'glitch-profile': {
    head: { box: [82, 8, 88, 80], joint: [123, 84] },
    torso: { box: [78, 80, 90, 110], joint: [122, 185] },
    hips: { box: [82, 178, 82, 88], joint: [122, 184] },
    upperArm: {
      box: [108, 86, 57, 84],
      joint: [126, 94],
      carve: true,
      mask: [
        [116, 88], [139, 87], [153, 99], [162, 120], [163, 140],
        [155, 154], [143, 168], [128, 168], [118, 154], [115, 130],
      ],
    },
    forearm: {
      box: [116, 156, 48, 102],
      joint: [141, 164],
      carve: true,
      mask: [
        [130, 158], [148, 157], [158, 171], [159, 194], [154, 220],
        [150, 244], [141, 256], [126, 250], [121, 229], [124, 202],
      ],
    },
    thigh: { box: [94, 246, 62, 78], joint: [121, 258] },
    shin: { box: [92, 310, 58, 78], joint: [121, 319] },
    boot: { box: [88, 374, 84, 42], joint: [121, 380] },
  },
};
