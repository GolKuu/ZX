export const SOURCE = 'output/imagegen/mim-fighter-reference-v2.png';
export const PROFILE_DIR = 'public/sprites/mim-profile';
export const ATTACK_DIR = 'public/sprites/mim-attacks';
export const VIEW = { left: 20, top: 190, width: 380, height: 430 };
export const ORIGIN = [205, 411];

export const PARTS = {
  scarf: {
    box: [10, 105, 174, 102],
    joint: [166, 123],
    points: [[170, 108], [140, 108], [106, 120], [66, 136], [30, 150],
      [10, 179], [40, 170], [12, 204], [61, 198], [100, 184],
      [138, 163], [166, 141], [183, 125]],
  },
  head: {
    box: [163, 20, 112, 110],
    joint: [219, 119],
    ellipse: { cx: 219, cy: 74, rx: 52, ry: 51 },
  },
  torso: {
    box: [112, 107, 188, 164],
    joint: [210, 255],
    points: [[157, 127], [184, 111], [236, 111], [265, 127], [277, 155],
      [281, 204], [270, 238], [243, 263], [181, 263], [151, 242],
      [141, 208], [143, 160]],
    base: true,
    excludes: [
      { cx: 149, cy: 180, rx: 33, ry: 62 },
      { cx: 176, cy: 177, rx: 19, ry: 34 },
      { cx: 290, cy: 178, rx: 38, ry: 62 },
      { cx: 132, cy: 126, rx: 52, ry: 31 },
      // Remove the doubled waistband/crotch ink. A clean purple underlay remains
      // and hides the two leg cut-outs as they rotate below the jacket.
      { cx: 212, cy: 262, rx: 38, ry: 12 },
    ],
  },
  leftArm: {
    box: [106, 120, 102, 113],
    joint: [151, 139],
    points: [[138, 122], [171, 125], [187, 141], [207, 152], [208, 180],
      [195, 202], [183, 222], [157, 231], [131, 221], [113, 202],
      [106, 174], [114, 145]],
    base: true,
    excludes: [
      // The reference scarf crosses this shoulder. It belongs to `scarf`, not
      // to the arm, otherwise its black edge swings across the jacket.
      { cx: 132, cy: 127, rx: 47, ry: 19 },
    ],
  },
  rightArm: {
    box: [251, 113, 90, 114],
    joint: [274, 139],
    points: [[267, 122], [292, 116], [319, 125], [334, 140], [340, 165],
      [332, 190], [313, 211], [286, 224], [264, 216], [253, 196],
      [253, 163]],
    base: true,
    excludes: [
      { cx: 267, cy: 122, rx: 30, ry: 15 },
    ],
  },
  leftLeg: {
    box: [46, 241, 164, 160],
    joint: [178, 253],
    points: [[156, 246], [191, 243], [208, 263], [201, 294], [187, 325],
      [175, 350], [164, 374], [138, 391], [80, 394], [48, 383],
      [49, 344], [85, 326], [100, 296], [117, 266], [138, 250]],
    base: true,
    excludes: [
      // The waistband is owned by the torso. Keeping another copy on each leg
      // creates a dark triangular spot whenever the hip rotates.
      { cx: 178, cy: 249, rx: 35, ry: 13 },
    ],
  },
  rightLeg: {
    box: [199, 240, 160, 165],
    joint: [240, 253],
    points: [[213, 246], [255, 243], [286, 253], [311, 272], [322, 300],
      [312, 329], [295, 347], [329, 352], [354, 376], [349, 399],
      [280, 400], [252, 383], [237, 359], [240, 330], [247, 304], [225, 283]],
    base: true,
    excludes: [
      { cx: 240, cy: 249, rx: 35, ry: 13 },
    ],
  },
};

export const ATTACKS = {
  lp: { left: 423, top: 198, width: 405, height: 412, originX: 0.5 },
  hp: { left: 813, top: 198, width: 382, height: 414, originX: 0.57 },
  lk: { left: 1180, top: 295, width: 470, height: 315, originX: 0.44 },
  hk: { left: 1598, top: 180, width: 405, height: 435, originX: 0.39 },
};
