import { PixelCanvas } from './canvas.mjs';
import { drawPose } from './draw-pose.mjs';
import { solve, shiftPose } from './pose-skeleton.mjs';
import { IDLE_POSE, MOVE_SHEET } from './move-sheet-poses.mjs';
import { GLYPH_HEIGHT, shadowText, text, textWidth } from './sheet-font.mjs';

/**
 * MIM's production move sheet.
 *
 * Every panel is solved from the same bone table the game sprites use, then the
 * support foot is pinned to one pixel column for the whole row. That is what
 * makes the sheet usable as an animation reference: the floor line, the pivot
 * and the limb lengths are identical in all forty panels, so any difference the
 * eye sees between two panels is a difference in the pose, not in the drawing.
 */

const CELL = { width: 150, height: 158 };
const FLOOR_Y = 130;
const SUPPORT_X = 52;
const ANKLE_ABOVE_FLOOR = 5;
const HEADER = { width: 240, gap: 6 };
const MARGIN = 8;
const BANNER = 92;
const FOOTER = 26;

const COLOUR = {
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
};

const PHASE = {
  idle: { colour: [96, 112, 146, 255], name: 'IDLE' },
  startup: { colour: [231, 170, 74, 255], name: 'STARTUP' },
  active: { colour: [157, 243, 255, 255], name: 'ACTIVE' },
  follow: { colour: [96, 205, 236, 255], name: 'FOLLOW' },
  recovery: { colour: [139, 124, 228, 255], name: 'RECOVERY' },
};

const TRAIL = [69, 217, 245, 255];
const TRAIL_GLOW = [157, 243, 255, 255];

// ---------------------------------------------------------------------------
// Rig helpers
// ---------------------------------------------------------------------------

/**
 * Keep every row's idle in the same place on the page.
 *
 * A row pivots on whichever foot carries its weight, and MIM's two feet are not
 * in the same column, so pinning a lead-foot row and a rear-foot row by their
 * own support ankles would offset one row's whole figure against the others.
 * The idle is the frame all four rows share, so it is what gets aligned: the
 * shift is a constant per row, which leaves the support foot pinned within the
 * row and makes the four idle panels identical across rows.
 */
export function rowShift(support) {
  if (support === 'back') return 0;
  const idle = solve(IDLE_POSE);
  return idle[support].ankle[0] - idle.back.ankle[0];
}

/**
 * Solve a panel, pin the support foot to the pivot column, and stand the figure
 * on the floor.
 *
 * The two axes are pinned by different rules on purpose. Horizontally the
 * support ankle owns one pixel column for the whole row, so the pivot foot
 * cannot slide between panels. Vertically the lowest ankle meets the floor, so
 * nothing is driven through the ground — a stance keeps both feet down, and
 * verify-move-sheet.mjs fails any pose that hangs the free foot more than the
 * stance's own depth offset below the foot carrying the weight.
 */
export function place(panel, support, anchorX, anchorY) {
  const solved = solve(panel.pose);
  const lowest = Math.max(solved.back.ankle[1], solved.front.ankle[1]);
  const grounded = shiftPose(
    solved,
    anchorX + rowShift(support) - solved[support].ankle[0],
    anchorY - lowest,
  );
  // Cloth folds at the ground rather than hanging through it.
  grounded.floor = anchorY + ANKLE_ABOVE_FLOOR - 2;
  return grounded;
}

/**
 * Where the move actually lands.
 *
 * A fist reaches a little past the wrist joint and a shoe past the ankle, so
 * the contact marker sits on the surface that touches the opponent rather than
 * on the joint centre.
 */
export function contactPoint(solved, contact) {
  const limb = solved[contact.limb];
  if (contact.joint === 'elbow') return limb.elbow;
  if (contact.joint === 'wrist') {
    const dx = limb.wrist[0] - limb.elbow[0];
    const dy = limb.wrist[1] - limb.elbow[1];
    const length = Math.hypot(dx, dy) || 1;
    return [limb.wrist[0] + (dx / length) * 3, limb.wrist[1] + (dy / length) * 3];
  }
  // Ankle: the toe of the shoe, built the same way draw-pose builds it.
  const dx = limb.ankle[0] - limb.knee[0];
  const dy = limb.ankle[1] - limb.knee[1];
  const length = Math.hypot(dx, dy) || 1;
  return [limb.ankle[0] - (dy / length) * 5, limb.ankle[1] + (dx / length) * 5];
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

/** A tapered arc through the last few contact points. */
function trail(canvas, points) {
  if (points.length < 2) return;
  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1];
    const to = points[index];
    const steps = Math.max(1, Math.ceil(Math.hypot(to[0] - from[0], to[1] - from[1])));
    for (let step = 0; step <= steps; step += 1) {
      const local = step / steps;
      const along = (index - 1 + local) / (points.length - 1);
      canvas.disc(
        from[0] + (to[0] - from[0]) * local,
        from[1] + (to[1] - from[1]) * local,
        0.6 + along * 1.8,
        along > 0.72 ? TRAIL_GLOW : TRAIL,
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
function impact(canvas, [x, y]) {
  for (let angle = 0; angle < 360; angle += 9) {
    const radians = (angle * Math.PI) / 180;
    canvas.set(x + Math.cos(radians) * 8, y + Math.sin(radians) * 8, TRAIL);
  }
  for (const [dx, dy, length] of [
    [1, 0, 15], [0.82, -0.57, 12], [0.82, 0.57, 12],
    [0.34, -0.94, 10], [0.34, 0.94, 10],
  ]) {
    for (let step = 9; step <= length; step += 1) {
      canvas.set(x + dx * step, y + dy * step, step > length - 4 ? TRAIL : TRAIL_GLOW);
    }
  }
  canvas.disc(x, y, 3, TRAIL_GLOW);
  canvas.disc(x, y, 1.4, COLOUR.white);
}

// ---------------------------------------------------------------------------
// Panels
// ---------------------------------------------------------------------------

function figureCanvas(panel, move, { silhouette }) {
  const canvas = new PixelCanvas(CELL.width, CELL.height);
  const solved = place(panel, move.support, SUPPORT_X, FLOOR_Y - ANKLE_ABOVE_FLOOR);
  drawPose(canvas, solved);
  if (silhouette) {
    for (let index = 3; index < canvas.data.length; index += 4) {
      if (canvas.data[index] === 0) continue;
      canvas.data[index - 3] = 8;
      canvas.data[index - 2] = 10;
      canvas.data[index - 1] = 18;
    }
    return { canvas, solved };
  }
  canvas.outline();
  return { canvas, solved };
}

function drawPanel(move, index, options) {
  const panel = move.panels[index];
  const phase = PHASE[panel.phase];
  const cell = new PixelCanvas(CELL.width, CELL.height);

  const background = panel.phase === 'active' ? COLOUR.panelActive : COLOUR.panel;
  cell.rect(0, 0, CELL.width, CELL.height, background);
  frame(cell, 0, 0, CELL.width, CELL.height, COLOUR.grid);
  cell.rect(1, 1, CELL.width - 2, 2, phase.colour);

  // Shared floor line and the pinned pivot column.
  cell.rect(2, FLOOR_Y, CELL.width - 4, 1, COLOUR.floor);
  cell.rect(2, FLOOR_Y + 1, CELL.width - 4, 1, COLOUR.ink);
  const pivotX = SUPPORT_X + rowShift(move.support);
  cell.rect(pivotX - 6, FLOOR_Y, 13, 1, COLOUR.floorLit);
  cell.rect(pivotX, FLOOR_Y + 1, 1, 4, COLOUR.pivot);

  const { canvas: figure, solved } = figureCanvas(panel, move, options);

  if (options.vfx) {
    const effects = new PixelCanvas(CELL.width, CELL.height);
    const showTrail = panel.phase === 'active' || panel.phase === 'follow'
      || (panel.phase === 'startup' && move.panels[index + 1]?.phase === 'active');
    if (showTrail) {
      const history = [];
      for (let back = 3; back >= 0; back -= 1) {
        const previous = move.panels[index - back];
        if (previous === undefined) continue;
        history.push(contactPoint(
          place(previous, move.support, SUPPORT_X, FLOOR_Y - ANKLE_ABOVE_FLOOR),
          move.contact,
        ));
      }
      trail(effects, history);
    }
    if (panel.phase === 'active') impact(effects, contactPoint(solved, move.contact));
    // Nothing is drawn below the shared floor line — the sheet's own guarantee
    // has to hold for the effects too, not only for the figure.
    for (let y = FLOOR_Y; y < CELL.height; y += 1) {
      effects.data.fill(0, y * CELL.width * 4, (y + 1) * CELL.width * 4);
    }
    // Effects go under the figure, so VFX can never stand in for the body.
    cell.blit(effects, 0, 0);
  }

  cell.blit(figure, 0, 0);

  const label = `F${String(panel.frame).padStart(2, '0')}`;
  const noteX = 6 + textWidth(label) + 6;
  text(cell, 6, FLOOR_Y + 8, label, phase.colour);
  if (noteX + textWidth(panel.label) <= CELL.width - 5) {
    text(cell, noteX, FLOOR_Y + 8, panel.label, COLOUR.dim);
  } else {
    throw new Error(`Panel note "${panel.label}" does not fit the cell`);
  }
  text(cell, 6, FLOOR_Y + 17, phase.name, COLOUR.faint);
  return cell;
}

// ---------------------------------------------------------------------------
// Row header
// ---------------------------------------------------------------------------

function drawRowHeader(move) {
  const header = new PixelCanvas(HEADER.width, CELL.height);
  header.rect(0, 0, HEADER.width, CELL.height, COLOUR.header);
  frame(header, 0, 0, HEADER.width, CELL.height, COLOUR.grid);
  header.rect(1, 1, 3, CELL.height - 2, PHASE.active.colour);

  text(header, 12, 10, 'MIM  /  BASIC NORMAL', COLOUR.faint);

  // Button badge.
  header.rect(12, 22, 22, 22, PHASE.active.colour);
  header.rect(13, 23, 20, 20, COLOUR.ink);
  bigText(header, 18, 27, move.button, PHASE.active.colour, 2);

  bigText(header, 42, 26, move.name, COLOUR.text, 2);

  text(header, 12, 54, `LIMB   ${move.limb}`, COLOUR.text);
  text(header, 12, 64, `CLASS  ${move.limbClass}`, COLOUR.dim);
  text(header, 12, 74, `LEVEL  ${move.level}`, COLOUR.dim);

  header.rect(12, 88, HEADER.width - 24, 1, COLOUR.grid);

  const data = move.frameData;
  text(header, 12, 95, 'STARTUP', PHASE.startup.colour);
  text(header, 12, 105, 'ACTIVE', PHASE.active.colour);
  text(header, 12, 115, 'RECOVERY', PHASE.recovery.colour);
  text(header, 78, 95, String(data.startup), COLOUR.text);
  text(header, 78, 105, String(data.active), COLOUR.text);
  text(header, 78, 115, String(data.recovery), COLOUR.text);
  text(header, 100, 95, `TOTAL ${String(data.startup + data.active + data.recovery)}`, COLOUR.faint);

  if (12 + textWidth(move.purpose) > HEADER.width - 8) {
    throw new Error(`Header line "${move.purpose}" does not fit the row header`);
  }
  text(header, 12, 130, move.purpose, COLOUR.faint);

  text(header, 12, 142, 'ATTACKS', COLOUR.dim);
  arrow(header, 62, 146, 22, PHASE.active.colour);
  text(header, 100, 142, 'RIGHT', PHASE.active.colour);
  return header;
}

// ---------------------------------------------------------------------------
// Sheets
// ---------------------------------------------------------------------------

const COLUMNS = 10;

function sheetSize(withHeaders) {
  const left = withHeaders ? HEADER.width + HEADER.gap : 0;
  return {
    width: MARGIN * 2 + left + COLUMNS * (CELL.width + 2) - 2,
    height: MARGIN * 2 + BANNER + MOVE_SHEET.length * (CELL.height + 8) - 8 + FOOTER,
    left: MARGIN + left,
  };
}

function drawBanner(sheet, width, subtitle) {
  sheet.rect(MARGIN, MARGIN, width - MARGIN * 2, BANNER - 10, COLOUR.banner);
  frame(sheet, MARGIN, MARGIN, width - MARGIN * 2, BANNER - 10, COLOUR.grid);
  sheet.rect(MARGIN, MARGIN, 4, BANNER - 10, PHASE.active.colour);

  bigText(sheet, MARGIN + 16, MARGIN + 12, 'MIM', COLOUR.white, 3);
  text(sheet, MARGIN + 100, MARGIN + 14, 'THE SHADOW PUPPETEER', PHASE.active.colour);
  text(sheet, MARGIN + 100, MARGIN + 24, 'PRODUCTION MOVE SHEET  /  FOUR BASIC NORMALS', COLOUR.dim);
  text(sheet, MARGIN + 16, MARGIN + 42, subtitle, COLOUR.text);

  // Phase legend.
  let cursor = MARGIN + 16;
  for (const key of ['idle', 'startup', 'active', 'follow', 'recovery']) {
    sheet.rect(cursor, MARGIN + 56, 8, 8, PHASE[key].colour);
    cursor = text(sheet, cursor + 12, MARGIN + 57, PHASE[key].name, COLOUR.dim) + 14;
  }

  text(sheet, cursor + 10, MARGIN + 57, 'ALL FOUR ATTACKS FACE', COLOUR.text);
  arrow(sheet, cursor + 142, MARGIN + 61, 20, PHASE.active.colour);

  text(sheet, MARGIN + 16, MARGIN + 70,
    'J K = UPPER BODY   I L = LEG   SUPPORT FOOT PINNED TO THE PIVOT COLUMN   FLOOR LINE SHARED BY ALL PANELS',
    COLOUR.faint);
}

export async function buildMoveSheet(file, options) {
  const settings = { vfx: true, silhouette: false, ...options };
  const size = sheetSize(true);
  const sheet = new PixelCanvas(size.width, size.height);
  sheet.rect(0, 0, size.width, size.height, COLOUR.page);
  drawBanner(sheet, size.width, settings.subtitle);

  for (const [row, move] of MOVE_SHEET.entries()) {
    const top = MARGIN + BANNER + row * (CELL.height + 8);
    sheet.blit(drawRowHeader(move), MARGIN, top);
    for (let column = 0; column < COLUMNS; column += 1) {
      sheet.blit(
        drawPanel(move, column, settings),
        size.left + column * (CELL.width + 2),
        top,
      );
    }
  }

  const footer = size.height - MARGIN - FOOTER + 6;
  text(sheet, MARGIN + 4, footer,
    'PANELS ARE KEY POSES, NOT EVERY FRAME. F## IS THE GAME FRAME THE POSE IS TAKEN FROM.',
    COLOUR.faint);
  text(sheet, MARGIN + 4, footer + 10,
    'GENERATED FROM THE SHIPPING MIM RIG - SAME BONE TABLE AND PALETTE AS THE IN-GAME SPRITES.',
    COLOUR.faint);

  await sheet.scaled(2).write(file);
  return { width: size.width * 2, height: size.height * 2 };
}

/**
 * The silhouette test.
 *
 * No colour, no effects, no move names and the rows deliberately out of button
 * order, so reading the sheet is the only way to tell the four attacks apart.
 */
export async function buildSilhouetteSheet(file, order) {
  const size = sheetSize(false);
  const height = MARGIN * 2 + 34 + order.length * (CELL.height + 8) - 8;
  const sheet = new PixelCanvas(size.width + 40, height);
  sheet.rect(0, 0, sheet.width, sheet.height, [223, 231, 244, 255]);
  text(sheet, MARGIN + 4, MARGIN + 4, 'SILHOUETTE TEST - IDENTIFY EACH ROW', [40, 48, 70, 255]);

  for (const [row, moveIndex] of order.entries()) {
    const move = MOVE_SHEET[moveIndex];
    const top = MARGIN + 34 + row * (CELL.height + 8);
    bigText(sheet, MARGIN + 4, top + CELL.height / 2 - 8, String.fromCharCode(65 + row), [40, 48, 70, 255], 2);
    for (let column = 0; column < COLUMNS; column += 1) {
      const cell = new PixelCanvas(CELL.width, CELL.height);
      cell.rect(0, 0, CELL.width, CELL.height, [239, 243, 250, 255]);
      cell.rect(2, FLOOR_Y, CELL.width - 4, 1, [168, 180, 200, 255]);
      const { canvas } = figureCanvas(move.panels[column], move, { silhouette: true, vfx: false });
      cell.blit(canvas, 0, 0);
      frame(cell, 0, 0, CELL.width, CELL.height, [196, 206, 222, 255]);
      sheet.blit(cell, MARGIN + 30 + column * (CELL.width + 2), top);
    }
  }

  await sheet.scaled(2).write(file);
}

/**
 * One attack on its own, at three times size, folded into two rows of five.
 *
 * A single ten-panel line is over five thousand pixels wide and gets shrunk to
 * illegibility by anything that displays it, which defeats the point of an
 * enlarged pass.
 */
export async function buildAttackStrip(file, move, options) {
  const settings = { vfx: true, silhouette: false, ...options };
  const perRow = 5;
  const width = MARGIN * 2 + HEADER.width + HEADER.gap + perRow * (CELL.width + 2) - 2;
  const height = MARGIN * 2 + 2 * (CELL.height + 8) - 8;
  const strip = new PixelCanvas(width, height);
  strip.rect(0, 0, width, height, COLOUR.page);
  strip.blit(drawRowHeader(move), MARGIN, MARGIN);

  // The header only fills the first row; the second gets the reading order.
  const legend = new PixelCanvas(HEADER.width, CELL.height);
  legend.rect(0, 0, HEADER.width, CELL.height, COLOUR.header);
  frame(legend, 0, 0, HEADER.width, CELL.height, COLOUR.grid);
  legend.rect(1, 1, 3, CELL.height - 2, PHASE.recovery.colour);
  text(legend, 12, 12, 'READ LEFT TO RIGHT,', COLOUR.dim);
  text(legend, 12, 22, 'TOP ROW THEN BOTTOM.', COLOUR.dim);
  text(legend, 12, 40, 'PIVOT COLUMN', COLOUR.pivot);
  text(legend, 12, 50, 'IS THE SAME IN ALL TEN', COLOUR.faint);
  text(legend, 12, 60, 'PANELS. SO IS THE FLOOR.', COLOUR.faint);
  text(legend, 12, 78, `CONTACT  ${move.contact.limb.toUpperCase()} ${move.contact.joint.toUpperCase()}`, COLOUR.text);
  text(legend, 12, 92, 'TOTAL', COLOUR.dim);
  text(legend, 54, 92, String(move.frameData.startup + move.frameData.active + move.frameData.recovery), COLOUR.text);
  text(legend, 78, 92, 'FRAMES', COLOUR.dim);
  strip.blit(legend, MARGIN, MARGIN + CELL.height + 8);

  for (let index = 0; index < COLUMNS; index += 1) {
    strip.blit(
      drawPanel(move, index, settings),
      MARGIN + HEADER.width + HEADER.gap + (index % perRow) * (CELL.width + 2),
      MARGIN + Math.floor(index / perRow) * (CELL.height + 8),
    );
  }
  await strip.scaled(3).write(file);
}
