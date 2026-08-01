import { PixelCanvas } from '../mim/canvas.mjs';
import { GLYPH_HEIGHT, text, textWidth } from '../mim/sheet-font.mjs';
import { jointList, shiftPose, solve } from './skeleton.mjs';

/**
 * The production move sheet, for any fighter.
 *
 * Every panel is solved from the same bone table the character's sprites are
 * drawn from, then the support foot is pinned to one pixel column for the whole
 * row. That is what makes a sheet usable as an animation reference: the floor
 * line, the pivot and the limb lengths are identical in all forty panels, so any
 * difference the eye sees between two panels is a difference in the pose rather
 * than in the drawing.
 */

export const LAYOUT = {
  cell: { width: 150, height: 158 },
  floorY: 130,
  supportX: 52,
  header: { width: 240, gap: 6 },
  margin: 8,
  banner: 92,
  footer: 26,
  columns: 11,
};

export const COLOUR = {
  page: [9, 12, 24, 255],
  banner: [14, 19, 38, 255],
  panel: [17, 23, 44, 255],
  panelActive: [23, 34, 60, 255],
  header: [13, 18, 35, 255],
  grid: [33, 42, 72, 255],
  floor: [52, 92, 128, 255],
  floorLit: [86, 148, 190, 255],
  pivot: [231, 170, 74, 255],
  text: [216, 228, 246, 255],
  dim: [124, 141, 176, 255],
  faint: [72, 86, 116, 255],
  ink: [4, 6, 14, 255],
  white: [255, 255, 255, 255],
  boneFront: [255, 255, 255, 255],
  boneBack: [128, 152, 196, 255],
  boneSpine: [157, 243, 255, 255],
  joint: [231, 170, 74, 255],
  guide: [58, 78, 118, 255],
  guideLit: [110, 160, 210, 255],
};

/**
 * Anticipation is its own phase, not the first startup frame.
 *
 * The brief asks for an idle, an anticipation, and then three or more startup
 * poses. Counting the anticipation as one of the three quietly delivers two.
 */
export const PHASE = {
  idle: { colour: [96, 112, 146, 255], name: 'IDLE' },
  anticipation: { colour: [214, 122, 96, 255], name: 'ANTICIPATION' },
  startup: { colour: [231, 170, 74, 255], name: 'STARTUP' },
  active: { colour: [157, 243, 255, 255], name: 'ACTIVE' },
  follow: { colour: [96, 205, 236, 255], name: 'FOLLOW' },
  recovery: { colour: [139, 124, 228, 255], name: 'RECOVERY' },
};

// ---------------------------------------------------------------------------
// Rig placement
// ---------------------------------------------------------------------------

/**
 * Keep every row's idle in the same place on the page.
 *
 * A row pivots on whichever foot carries its weight, and the two feet are not in
 * the same column, so pinning a lead-foot row and a rear-foot row by their own
 * support ankles would offset one row's whole figure against the others. The
 * idle is the frame all four rows share, so it is what gets aligned: the shift
 * is a constant per row, which leaves the support foot pinned within the row and
 * makes the four idle panels identical across rows.
 */
export function rowShift(fighter, support) {
  if (support === 'back') return 0;
  const idle = solve(fighter.idlePose, fighter.bones);
  return idle[support].ankle[0] - idle.back.ankle[0];
}

/**
 * Solve a panel, pin the support foot to the pivot column, and stand the figure
 * on the floor.
 *
 * The two axes are pinned by different rules on purpose. Horizontally the
 * support ankle owns one pixel column for the whole row, so the pivot foot
 * cannot slide between panels. Vertically the lowest ankle meets the floor, so
 * nothing is driven through the ground — a stance keeps both feet down, and the
 * verifier fails any pose that hangs the free foot below the weight-bearing one.
 */
export function place(fighter, panel, support) {
  const solved = solve(panel.pose, fighter.bones);
  const lowest = Math.max(solved.back.ankle[1], solved.front.ankle[1]);
  const anchorY = LAYOUT.floorY - fighter.ankleAboveFloor;
  const grounded = shiftPose(
    solved,
    LAYOUT.supportX + rowShift(fighter, support) - solved[support].ankle[0],
    anchorY - lowest,
  );
  // Cloth folds at the ground rather than hanging through it.
  grounded.floor = LAYOUT.floorY - 2;
  return grounded;
}

/**
 * Where the move actually lands.
 *
 * A fist reaches a little past the wrist joint and a boot past the ankle, so the
 * contact marker sits on the surface that touches the opponent rather than on
 * the joint centre.
 */
export function contactPoint(fighter, solved, contact) {
  const limb = solved[contact.limb];
  if (contact.joint === 'elbow') return limb.elbow;
  if (contact.joint === 'shoulder') return limb.shoulder;
  if (contact.joint === 'wrist') {
    const dx = limb.wrist[0] - limb.elbow[0];
    const dy = limb.wrist[1] - limb.elbow[1];
    const length = Math.hypot(dx, dy) || 1;
    const reach = fighter.bones.handReach ?? 3;
    return [limb.wrist[0] + (dx / length) * reach, limb.wrist[1] + (dy / length) * reach];
  }
  const dx = limb.ankle[0] - limb.knee[0];
  const dy = limb.ankle[1] - limb.knee[1];
  const length = Math.hypot(dx, dy) || 1;
  const foot = fighter.bones.foot ?? 5;
  // A kick that travels forwards lands on the ball of the foot; one that falls
  // lands on the heel, which sits on the opposite side of the ankle.
  if (contact.joint === 'heel') {
    return [limb.ankle[0] + (dy / length) * foot, limb.ankle[1] - (dx / length) * foot];
  }
  return [limb.ankle[0] - (dy / length) * foot, limb.ankle[1] + (dx / length) * foot];
}

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------

function bigText(canvas, x, y, string, colour, scale = 2) {
  const temp = new PixelCanvas(textWidth(string), GLYPH_HEIGHT);
  text(temp, 0, 0, string, colour);
  canvas.blit(temp.scaled(scale), x, y);
  return x + textWidth(string) * scale;
}

function frame(canvas, x, y, width, height, colour) {
  canvas.rect(x, y, width, 1, colour);
  canvas.rect(x, y + height - 1, width, 1, colour);
  canvas.rect(x, y, 1, height, colour);
  canvas.rect(x + width - 1, y, 1, height, colour);
}

function arrow(canvas, x, y, length, colour) {
  canvas.rect(x, y - 1, length, 3, colour);
  for (let step = 0; step <= 6; step += 1) {
    const half = 6 - step;
    canvas.rect(x + length + step, y - half, 1, half * 2 + 1, colour);
  }
}

/**
 * A tapered arc through the last few contact points.
 *
 * Broken, and never more than two pixels thick. A solid full-value stroke as
 * wide as a limb, laid beside the real limb, stops reading as motion and starts
 * reading as a second limb.
 */
function trail(canvas, points, colour, glow) {
  if (points.length < 2) return;
  let distance = 0;
  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1];
    const to = points[index];
    const steps = Math.max(1, Math.ceil(Math.hypot(to[0] - from[0], to[1] - from[1])));
    for (let step = 0; step <= steps; step += 1) {
      distance += 1;
      if (distance % 6 >= 4) continue;
      const local = step / steps;
      const along = (index - 1 + local) / (points.length - 1);
      canvas.disc(
        from[0] + (to[0] - from[0]) * local,
        from[1] + (to[1] - from[1]) * local,
        0.5 + along * 0.9,
        along > 0.72 ? glow : colour,
      );
    }
  }
}

/**
 * The contact burst.
 *
 * Deliberately small and pointed the way the limb is travelling. It marks where
 * the body already is; it never reaches out past the strike, because a flash
 * that outruns the limb is the effect doing the hitting.
 */
function impact(canvas, [x, y], colour, glow, scale = 1) {
  const ring = 8 * scale;
  for (let angle = 0; angle < 360; angle += 9) {
    const radians = (angle * Math.PI) / 180;
    canvas.set(x + Math.cos(radians) * ring, y + Math.sin(radians) * ring, colour);
  }
  for (const [dx, dy, length] of [
    [1, 0, 15], [0.82, -0.57, 12], [0.82, 0.57, 12],
    [0.34, -0.94, 10], [0.34, 0.94, 10],
  ]) {
    for (let step = Math.round(9 * scale); step <= length * scale; step += 1) {
      canvas.set(x + dx * step, y + dy * step, step > length * scale - 4 ? colour : glow);
    }
  }
  canvas.disc(x, y, 3 * scale, glow);
  canvas.disc(x, y, 1.4 * scale, COLOUR.white);
}

function recolour(canvas, [r, g, b]) {
  for (let index = 3; index < canvas.data.length; index += 4) {
    if (canvas.data[index] === 0) continue;
    canvas.data[index - 3] = r;
    canvas.data[index - 2] = g;
    canvas.data[index - 1] = b;
  }
}

/**
 * The bone chain, drawn over the flattened figure.
 *
 * This is the pass that makes limb length and joint placement checkable by eye
 * rather than by trust: every segment here is the same bone the sprite is drawn
 * from, so a limb that looks wrong in the art is wrong in the skeleton too.
 */
function drawSkeleton(canvas, solved, contact) {
  const bone = (from, to, colour) => {
    canvas.line(from[0], from[1], to[0], to[1], colour);
    canvas.line(from[0], from[1] - 1, to[0], to[1] - 1, colour);
  };
  for (const side of ['back', 'front']) {
    const limb = solved[side];
    const colour = side === 'front' ? COLOUR.boneFront : COLOUR.boneBack;
    bone(limb.shoulder, limb.elbow, colour);
    bone(limb.elbow, limb.wrist, colour);
    bone(limb.hip, limb.knee, colour);
    bone(limb.knee, limb.ankle, colour);
  }
  bone(solved.waist, solved.neck, COLOUR.boneSpine);
  bone(solved.neck, solved.head, COLOUR.boneSpine);
  bone(solved.back.hip, solved.front.hip, COLOUR.boneSpine);
  bone(solved.back.shoulder, solved.front.shoulder, COLOUR.boneSpine);
  for (const side of ['back', 'front']) {
    for (const name of ['shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle']) {
      const joint = solved[side][name];
      canvas.disc(joint[0], joint[1], 1.6, COLOUR.joint);
    }
  }
  canvas.disc(solved.waist[0], solved.waist[1], 2, COLOUR.joint);
  canvas.disc(solved.head[0], solved.head[1], 2.4, COLOUR.joint);
  canvas.disc(contact[0], contact[1], 3, COLOUR.pivot);
  canvas.disc(contact[0], contact[1], 1.4, COLOUR.white);
}

// ---------------------------------------------------------------------------
// Panels
// ---------------------------------------------------------------------------

function figureCanvas(fighter, panel, move, { silhouette, overlay }) {
  const canvas = new PixelCanvas(LAYOUT.cell.width, LAYOUT.cell.height);
  const solved = place(fighter, panel, move.support);
  fighter.drawPose(canvas, solved);
  if (silhouette) {
    recolour(canvas, [8, 10, 18]);
    return { canvas, solved };
  }
  if (overlay === 'skeleton') {
    recolour(canvas, [38, 47, 78]);
    return { canvas, solved };
  }
  canvas.outline();
  return { canvas, solved };
}

function drawPanel(fighter, move, index, options) {
  const panel = move.panels[index];
  const phase = PHASE[panel.phase];
  const { cell: size, floorY } = LAYOUT;
  const cell = new PixelCanvas(size.width, size.height);

  cell.rect(0, 0, size.width, size.height, panel.phase === 'active' ? COLOUR.panelActive : COLOUR.panel);
  frame(cell, 0, 0, size.width, size.height, COLOUR.grid);
  cell.rect(1, 1, size.width - 2, 2, phase.colour);

  const pivotX = LAYOUT.supportX + rowShift(fighter, move.support);
  if (options.overlay === 'guides') {
    // Two columns, because they answer two different questions. The dim one is
    // the shared idle alignment every row is built on; the lit one is this
    // move's own pivot, which sits elsewhere when the move stands on its lead
    // foot. Drawing only the second one makes an honest difference look like
    // drift between rows.
    if (pivotX !== LAYOUT.supportX) {
      for (let y = 6; y < floorY - 4; y += 3) cell.set(LAYOUT.supportX, y, COLOUR.guide);
    }
    cell.rect(pivotX, 4, 1, floorY - 4, COLOUR.guide);
    for (let height = 10; height < floorY - 10; height += 10) {
      for (let x = 4; x < size.width - 4; x += 4) cell.set(x, floorY - height, COLOUR.guide);
    }
    for (let x = pivotX; x < size.width - 3; x += 10) {
      cell.rect(x, floorY - 3, 1, 3, COLOUR.guideLit);
    }
  }
  cell.rect(2, floorY, size.width - 4, 1, COLOUR.floor);
  cell.rect(2, floorY + 1, size.width - 4, 1, COLOUR.ink);
  cell.rect(pivotX - 6, floorY, 13, 1, COLOUR.floorLit);
  cell.rect(pivotX, floorY + 1, 1, 4, COLOUR.pivot);

  const { canvas: figure, solved } = figureCanvas(fighter, panel, move, options);

  if (options.vfx) {
    const effects = new PixelCanvas(size.width, size.height);
    const showTrail = panel.phase === 'active' || panel.phase === 'follow'
      || (panel.phase === 'startup' && move.panels[index + 1]?.phase === 'active');
    if (showTrail) {
      const history = [];
      for (let back = 3; back >= 0; back -= 1) {
        const previous = move.panels[index - back];
        if (previous === undefined) continue;
        history.push(contactPoint(fighter, place(fighter, previous, move.support), move.contact));
      }
      trail(effects, history, fighter.trail, fighter.trailGlow);
    }
    if (panel.phase === 'active') {
      impact(effects, contactPoint(fighter, solved, move.contact), fighter.trail, fighter.trailGlow, fighter.impactScale ?? 1);
    }
    // Nothing is drawn below the shared floor line, effects included.
    for (let y = floorY; y < size.height; y += 1) {
      effects.data.fill(0, y * size.width * 4, (y + 1) * size.width * 4);
    }
    cell.blit(effects, 0, 0);
  }

  cell.blit(figure, 0, 0);
  if (options.overlay === 'skeleton') {
    drawSkeleton(cell, solved, contactPoint(fighter, solved, move.contact));
  }

  const label = `F${String(panel.frame).padStart(2, '0')}`;
  const noteX = 6 + textWidth(label) + 6;
  text(cell, 6, floorY + 8, label, phase.colour);
  if (noteX + textWidth(panel.label) > size.width - 5) {
    throw new Error(`Panel note "${panel.label}" does not fit the cell`);
  }
  text(cell, noteX, floorY + 8, panel.label, COLOUR.dim);
  text(cell, 6, floorY + 17, phase.name, COLOUR.faint);
  return cell;
}

// ---------------------------------------------------------------------------
// Row header
// ---------------------------------------------------------------------------

function drawRowHeader(fighter, move) {
  const { header: box, cell: size } = LAYOUT;
  const header = new PixelCanvas(box.width, size.height);
  header.rect(0, 0, box.width, size.height, COLOUR.header);
  frame(header, 0, 0, box.width, size.height, COLOUR.grid);
  header.rect(1, 1, 3, size.height - 2, fighter.accent);

  text(header, 12, 10, `${fighter.name}  /  BASIC NORMAL`, COLOUR.faint);

  header.rect(12, 22, 22, 22, fighter.accent);
  header.rect(13, 23, 20, 20, COLOUR.ink);
  bigText(header, 18, 27, move.button, fighter.accent, 2);
  bigText(header, 42, 26, move.name, COLOUR.text, 2);

  text(header, 12, 54, `LIMB   ${move.limb}`, COLOUR.text);
  text(header, 12, 64, `CLASS  ${move.limbClass}`, COLOUR.dim);
  text(header, 12, 74, `LEVEL  ${move.level}`, COLOUR.dim);
  text(header, 12, 84, `PIVOT  ${move.support === 'front' ? 'LEAD FOOT' : 'REAR FOOT'}`, COLOUR.pivot);
  header.rect(12, 94, box.width - 24, 1, COLOUR.grid);

  const data = move.frameData;
  text(header, 12, 100, 'STARTUP', PHASE.startup.colour);
  text(header, 12, 110, 'ACTIVE', PHASE.active.colour);
  text(header, 12, 120, 'RECOVERY', PHASE.recovery.colour);
  text(header, 78, 100, String(data.startup), COLOUR.text);
  text(header, 78, 110, String(data.active), COLOUR.text);
  text(header, 78, 120, String(data.recovery), COLOUR.text);
  text(header, 100, 100, `TOTAL ${String(data.startup + data.active + data.recovery)}`, COLOUR.faint);

  if (12 + textWidth(move.purpose) > box.width - 8) {
    throw new Error(`Header line "${move.purpose}" does not fit the row header`);
  }
  text(header, 12, 132, move.purpose, COLOUR.faint);
  text(header, 12, 144, 'ATTACKS', COLOUR.dim);
  arrow(header, 62, 148, 22, fighter.accent);
  text(header, 100, 144, 'RIGHT', fighter.accent);
  return header;
}

// ---------------------------------------------------------------------------
// Sheets
// ---------------------------------------------------------------------------

function sheetSize(fighter, withHeaders) {
  const { margin, header, cell, columns, banner, footer } = LAYOUT;
  const left = withHeaders ? header.width + header.gap : 0;
  return {
    width: margin * 2 + left + columns * (cell.width + 2) - 2,
    height: margin * 2 + banner + fighter.moves.length * (cell.height + 8) - 8 + footer,
    left: margin + left,
  };
}

function drawBanner(fighter, sheet, width, subtitle) {
  const { margin, banner } = LAYOUT;
  sheet.rect(margin, margin, width - margin * 2, banner - 10, COLOUR.banner);
  frame(sheet, margin, margin, width - margin * 2, banner - 10, COLOUR.grid);
  sheet.rect(margin, margin, 4, banner - 10, fighter.accent);

  bigText(sheet, margin + 16, margin + 12, fighter.name, COLOUR.white, 3);
  const titleX = margin + 24 + textWidth(fighter.name) * 3;
  text(sheet, titleX, margin + 14, fighter.title, fighter.accent);
  text(sheet, titleX, margin + 24, 'PRODUCTION MOVE SHEET  /  FOUR BASIC NORMALS', COLOUR.dim);
  text(sheet, margin + 16, margin + 42, subtitle, COLOUR.text);

  let cursor = margin + 16;
  for (const key of ['idle', 'anticipation', 'startup', 'active', 'follow', 'recovery']) {
    sheet.rect(cursor, margin + 56, 8, 8, PHASE[key].colour);
    cursor = text(sheet, cursor + 12, margin + 57, PHASE[key].name, COLOUR.dim) + 14;
  }
  text(sheet, cursor + 10, margin + 57, 'ALL FOUR ATTACKS FACE', COLOUR.text);
  arrow(sheet, cursor + 142, margin + 61, 20, fighter.accent);

  text(sheet, margin + 16, margin + 70,
    'J K = UPPER BODY   I L = LEG   EACH ROW PINS ITS OWN SUPPORT FOOT   ALL ROWS SHARE ONE IDLE AND ONE FLOOR LINE',
    COLOUR.faint);
}

export async function buildMoveSheet(fighter, file, options) {
  const settings = { vfx: true, silhouette: false, overlay: null, ...options };
  const { margin, banner, cell, columns, footer } = LAYOUT;
  const size = sheetSize(fighter, true);
  const sheet = new PixelCanvas(size.width, size.height);
  sheet.rect(0, 0, size.width, size.height, COLOUR.page);
  drawBanner(fighter, sheet, size.width, settings.subtitle);

  for (const [row, move] of fighter.moves.entries()) {
    const top = margin + banner + row * (cell.height + 8);
    sheet.blit(drawRowHeader(fighter, move), margin, top);
    for (let column = 0; column < columns; column += 1) {
      sheet.blit(drawPanel(fighter, move, column, settings), size.left + column * (cell.width + 2), top);
    }
  }

  const footerY = size.height - margin - footer + 6;
  text(sheet, margin + 4, footerY,
    'PANELS ARE KEY POSES, NOT EVERY FRAME. F## IS THE GAME FRAME THE POSE IS TAKEN FROM.',
    COLOUR.faint);
  text(sheet, margin + 4, footerY + 10,
    `GENERATED FROM THE ${fighter.name} RIG - SAME BONE TABLE AND PALETTE AS THE IN-GAME SPRITES.`,
    COLOUR.faint);

  await sheet.scaled(2).write(file);
  return { width: size.width * 2, height: size.height * 2 };
}

/**
 * The silhouette test.
 *
 * No colour, no effects, no move names and the rows deliberately out of button
 * order, so reading the shapes is the only way to tell the four attacks apart.
 */
export async function buildSilhouetteSheet(fighter, file, order) {
  const { margin, cell, columns } = LAYOUT;
  const size = sheetSize(fighter, false);
  const height = margin * 2 + 34 + order.length * (cell.height + 8) - 8;
  const sheet = new PixelCanvas(size.width + 40, height);
  sheet.rect(0, 0, sheet.width, sheet.height, [223, 231, 244, 255]);
  text(sheet, margin + 4, margin + 4, 'SILHOUETTE TEST - IDENTIFY EACH ROW', [40, 48, 70, 255]);

  for (const [row, moveIndex] of order.entries()) {
    const move = fighter.moves[moveIndex];
    const top = margin + 34 + row * (cell.height + 8);
    bigText(sheet, margin + 4, top + cell.height / 2 - 8, String.fromCharCode(65 + row), [40, 48, 70, 255], 2);
    for (let column = 0; column < columns; column += 1) {
      const panel = new PixelCanvas(cell.width, cell.height);
      panel.rect(0, 0, cell.width, cell.height, [239, 243, 250, 255]);
      panel.rect(2, LAYOUT.floorY, cell.width - 4, 1, [168, 180, 200, 255]);
      const { canvas } = figureCanvas(fighter, move.panels[column], move, { silhouette: true, vfx: false });
      panel.blit(canvas, 0, 0);
      frame(panel, 0, 0, cell.width, cell.height, [196, 206, 222, 255]);
      sheet.blit(panel, margin + 30 + column * (cell.width + 2), top);
    }
  }
  await sheet.scaled(2).write(file);
}

/** One attack on its own, at three times size, folded into two rows of five. */
export async function buildAttackStrip(fighter, file, move, options) {
  const settings = { vfx: true, silhouette: false, overlay: null, ...options };
  const { margin, header, cell } = LAYOUT;
  const perRow = 5;
  const width = margin * 2 + header.width + header.gap + perRow * (cell.width + 2) - 2;
  const height = margin * 2 + 2 * (cell.height + 8) - 8;
  const strip = new PixelCanvas(width, height);
  strip.rect(0, 0, width, height, COLOUR.page);
  strip.blit(drawRowHeader(fighter, move), margin, margin);

  const legend = new PixelCanvas(header.width, cell.height);
  legend.rect(0, 0, header.width, cell.height, COLOUR.header);
  frame(legend, 0, 0, header.width, cell.height, COLOUR.grid);
  legend.rect(1, 1, 3, cell.height - 2, PHASE.recovery.colour);
  text(legend, 12, 12, 'READ LEFT TO RIGHT,', COLOUR.dim);
  text(legend, 12, 22, 'TOP ROW THEN BOTTOM.', COLOUR.dim);
  text(legend, 12, 40, `PIVOT  ${move.support === 'front' ? 'LEAD FOOT' : 'REAR FOOT'}`, COLOUR.pivot);
  text(legend, 12, 50, 'HOLDS ONE COLUMN FOR ALL', COLOUR.faint);
  text(legend, 12, 60, 'ELEVEN PANELS OF THIS MOVE.', COLOUR.faint);
  text(legend, 12, 68, 'ROWS PIVOT ON DIFFERENT FEET;', COLOUR.faint);
  text(legend, 12, 76, 'ALL FOUR SHARE ONE IDLE.', COLOUR.faint);
  text(legend, 12, 90, `CONTACT  ${move.contact.limb.toUpperCase()} ${move.contact.joint.toUpperCase()}`, COLOUR.text);
  text(legend, 12, 104, 'TOTAL', COLOUR.dim);
  text(legend, 54, 104, String(move.frameData.startup + move.frameData.active + move.frameData.recovery), COLOUR.text);
  text(legend, 78, 104, 'FRAMES', COLOUR.dim);
  strip.blit(legend, margin, margin + cell.height + 8);

  for (let index = 0; index < LAYOUT.columns; index += 1) {
    strip.blit(
      drawPanel(fighter, move, index, settings),
      margin + header.width + header.gap + (index % perRow) * (cell.width + 2),
      margin + Math.floor(index / perRow) * (cell.height + 8),
    );
  }
  await strip.scaled(3).write(file);
}

export { jointList };
