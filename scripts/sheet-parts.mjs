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
    origin: [76, 349],
    textureScale: 2,
    partFill: [232, 242, 245],
    partOutline: [15, 34, 57],
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
    carveFill: [12, 16, 29],
  },
  'glitch-profile': {
    file: '../output/imagegen/glitch-character-reference.png',
    crop: { left: 1118, top: 82, width: 176, height: 424 },
    facesRight: true,
    origin: [123, 414],
    partFill: [25, 29, 36],
    partOutline: [4, 8, 13],
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
  echo: {
    file: 'public/echo-character-sheet.png',
    key: { tolerance: 16 },
    cleanup: 'echo',
    displayScale: 1.95,
    facesRight: true,
    textureScale: 2,
    ground: 680,
    poses: {
      lp: {
        left: 24, top: 472, width: 205, height: 210,
        feet: [[0, 31], [132, 172]],
        recover: [[
          [158, 34], [190, 34], [200, 42], [199, 55],
          [188, 63], [158, 61], [151, 53], [152, 41],
        ]],
      },
      hp: {
        left: 280, top: 472, width: 220, height: 210,
        feet: [[0, 35], [142, 190]],
        recover: [[
          [164, 36], [202, 36], [216, 44], [217, 55],
          [207, 63], [177, 63], [166, 57], [160, 47],
        ]],
      },
      lk: {
        left: 592, top: 477, width: 230, height: 205,
        feet: [[0, 60], [192, 230]],
        recover: [[
          [105, 98], [125, 99], [146, 108], [170, 121],
          [195, 136], [220, 151], [228, 162], [226, 180],
          [217, 192], [204, 194], [185, 183], [163, 168],
          [140, 152], [117, 139], [104, 128],
        ]],
      },
      hk: {
        left: 865, top: 472, width: 240, height: 210,
        feet: [[52, 112]],
        recover: [[
          [82, 77], [105, 73], [130, 79], [157, 87],
          [186, 92], [218, 94], [234, 101], [238, 111],
          [232, 121], [208, 124], [181, 117], [153, 111],
          [124, 107], [99, 104], [86, 96],
        ]],
      },
    },
  },
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
    ponytail: {
      box: [35, 38, 36, 64],
      joint: [68, 86],
      preserveSource: true,
      mask: [
        [46, 39], [55, 39], [63, 46], [68, 58], [70, 73],
        [68, 87], [60, 98], [50, 100], [41, 93], [36, 81],
        [35, 64], [39, 49],
      ],
      holes: [[
        [48, 48], [55, 48], [60, 54], [63, 64], [64, 76],
        [61, 86], [56, 91], [50, 91], [45, 85], [42, 74],
        [42, 62], [45, 52],
      ]],
    },
    head: {
      box: [62, 20, 54, 64],
      joint: [80, 80],
      preserveSource: true,
      mask: [
        [69, 22], [82, 24], [94, 30], [101, 39], [110, 36],
        [114, 47], [111, 59], [105, 67], [99, 78], [89, 82],
        [78, 75], [68, 67], [63, 56], [64, 40],
      ],
    },
    torso: {
      box: [58, 66, 56, 82],
      joint: [77, 140],
      preserveSource: true,
      refillCarves: true,
      carveFill: [231, 239, 241],
      mask: [
        [69, 67], [82, 67], [94, 73], [101, 84], [109, 94],
        [111, 109], [104, 117], [100, 131], [91, 141], [76, 143],
        [65, 136], [59, 123], [62, 109], [59, 96], [61, 81],
      ],
    },
    hips: {
      box: [22, 130, 84, 148],
      joint: [77, 140],
      preserveSource: true,
      refillCarves: true,
      carveFill: [223, 235, 238],
      mask: [
        [66, 130], [91, 131], [102, 141], [105, 160], [103, 185],
        [99, 211], [91, 237], [82, 256], [72, 276], [62, 271],
        [54, 259], [46, 269], [31, 273], [23, 263], [31, 249],
        [40, 228], [45, 205], [48, 179], [51, 158], [57, 141],
      ],
    },
    sash: {
      box: [90, 134, 23, 142],
      joint: [98, 142],
      preserveSource: true,
      mask: [
        [95, 134], [106, 139], [110, 155], [111, 184], [111, 220],
        [111, 253], [110, 274], [104, 271], [96, 259], [91, 244],
        [92, 218], [94, 187],
      ],
    },
    upperArm: {
      box: [53, 84, 32, 64],
      joint: [65, 91],
      carve: true,
      preserveSource: true,
      mask: [
        [59, 86], [69, 84], [78, 91], [83, 103], [80, 119],
        [75, 133], [70, 146], [59, 146], [54, 136], [53, 120],
        [55, 103],
      ],
    },
    forearm: {
      box: [48, 137, 32, 70],
      joint: [64, 145],
      carve: true,
      preserveSource: true,
      mask: [
        [56, 138], [69, 137], [76, 148], [73, 166], [78, 187],
        [74, 202], [65, 206], [55, 202], [49, 193], [50, 175],
        [53, 157],
      ],
    },
    thigh: {
      box: [54, 248, 38, 44],
      joint: [75, 257],
      preserveSource: true,
      mask: [
        [61, 250], [78, 248], [88, 255], [91, 267], [85, 282],
        [78, 290], [66, 290], [58, 281], [55, 266],
      ],
    },
    shin: {
      box: [59, 282, 31, 48],
      joint: [74, 287],
      preserveSource: true,
      mask: [
        [66, 282], [81, 282], [86, 291], [85, 310], [88, 322],
        [82, 329], [66, 329], [61, 321], [61, 303],
      ],
    },
    boot: {
      box: [58, 321, 58, 30],
      joint: [74, 327],
      preserveSource: true,
      mask: [
        [66, 322], [82, 321], [88, 329], [98, 334], [113, 340],
        [115, 347], [107, 350], [64, 350], [59, 346], [60, 334],
      ],
    },
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
    upperArm: {
      box: [52, 96, 56, 60],
      joint: [67, 103],
      carve: true,
      mask: [
        [61, 98], [77, 101], [91, 112], [99, 128], [96, 143],
        [86, 153], [71, 147], [61, 135], [55, 117],
      ],
    },
    forearm: {
      box: [78, 136, 42, 40],
      joint: [85, 145],
      carve: true,
      mask: [
        [82, 138], [105, 138], [117, 149], [115, 164], [106, 174],
        [88, 172], [80, 158],
      ],
    },
    thigh: { box: [72, 252, 46, 52], joint: [95, 255] },
    shin: { box: [74, 282, 42, 32], joint: [95, 285] },
    boot: { box: [64, 298, 54, 26], joint: [94, 301] },
  },

  // GLITCH's intact half supplies the actual anatomy while the wider boxes keep
  // the cyan/magenta breakup attached to each moving part.
  'glitch-profile': {
    head: {
      box: [82, 8, 88, 80],
      joint: [123, 84],
      mask: [
        [97, 11], [122, 8], [145, 18], [158, 37], [160, 58],
        [151, 79], [132, 87], [111, 82], [98, 67], [91, 47],
      ],
    },
    torso: {
      box: [78, 80, 90, 110],
      joint: [122, 185],
      refillCarves: true,
      carveFill: [25, 29, 36],
      mask: [
        [96, 82], [126, 82], [149, 95], [162, 116], [163, 145],
        [150, 166], [137, 183], [112, 187], [94, 176], [86, 151],
        [86, 118],
      ],
    },
    hips: {
      box: [82, 178, 82, 88],
      joint: [122, 184],
      refillCarves: true,
      carveFill: [25, 29, 36],
      mask: [
        [93, 176], [131, 176], [152, 192], [158, 218], [153, 247],
        [142, 265], [110, 266], [92, 248], [84, 218],
      ],
    },
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
    thigh: {
      box: [94, 246, 62, 78],
      joint: [121, 258],
      mask: [
        [103, 246], [136, 246], [153, 263], [151, 292], [142, 320],
        [111, 323], [98, 302], [95, 272],
      ],
    },
    shin: {
      box: [92, 306, 58, 82],
      joint: [121, 319],
      mask: [
        [103, 306], [139, 307], [147, 331], [142, 365], [134, 387],
        [108, 387], [96, 365], [96, 333],
      ],
    },
    boot: {
      box: [88, 372, 86, 46],
      joint: [121, 380],
      mask: [
        [101, 372], [139, 372], [145, 384], [164, 394], [172, 411],
        [160, 417], [100, 416], [91, 405], [94, 387],
      ],
    },
  },
};
