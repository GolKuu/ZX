import { PixelCanvas } from '../mim/canvas.mjs';
import { jointList, limbLengths } from './skeleton.mjs';
import { LAYOUT, contactPoint, place, rowShift } from './sheet.mjs';

/**
 * The move sheet's own quality gate, for any fighter.
 *
 * Everything the brief calls a blocker or a critical defect can be measured
 * rather than eyeballed: a limb that changes length, a foot that slides off the
 * pivot, an attack that points left, a contact that lands at the wrong height,
 * a strike that never leaves the stance it started from, a pose that repeats its
 * neighbour, a move that carries no weight. This reports all of it in numbers,
 * so no iteration can be declared finished on the strength of looking nice.
 */

/** How far apart in depth the two feet of a planted stance may sit. */
const STANCE_DEPTH = 3;
/** How far a contact frame must reach past the idle outline to read as a hit. */
const MINIMUM_STRIKE_MARGIN = 8;
/** How far the pelvis must travel vertically for a leg attack to carry weight. */
const MINIMUM_PELVIS_SWING = 8;
/** Per-joint separation below which two poses are the same pose. */
const SAME_POSE = 1.5;

function drawnBounds(fighter, panel, move) {
  const pad = 200;
  const { cell } = LAYOUT;
  const canvas = new PixelCanvas(cell.width + pad * 2, cell.height + pad * 2);
  const solved = place(fighter, panel, move.support);
  fighter.drawPose(canvas, {
    ...solved,
    waist: [solved.waist[0] + pad, solved.waist[1] + pad],
    neck: [solved.neck[0] + pad, solved.neck[1] + pad],
    head: [solved.head[0] + pad, solved.head[1] + pad],
    hip: [solved.hip[0] + pad, solved.hip[1] + pad],
    floor: solved.floor + pad,
    back: shift(solved.back, pad),
    front: shift(solved.front, pad),
  });
  const { offsetX, offsetY, canvas: trimmed } = canvas.trim(0);
  return {
    left: offsetX - pad,
    top: offsetY - pad,
    right: offsetX - pad + trimmed.width - 1,
    bottom: offsetY - pad + trimmed.height - 1,
  };
}

function shift(limb, pad) {
  const move = ([x, y]) => [x + pad, y + pad];
  return {
    shoulder: move(limb.shoulder), elbow: move(limb.elbow), wrist: move(limb.wrist),
    hip: move(limb.hip), knee: move(limb.knee), ankle: move(limb.ankle),
  };
}

export function verify(fighter) {
  const problems = [];
  const report = [];
  const { floorY, supportX, cell } = LAYOUT;
  const anchorY = floorY - fighter.ankleAboveFloor;

  const expected = {
    frontUpperArm: fighter.bones.upperArm,
    frontForearm: fighter.bones.forearm,
    backUpperArm: fighter.bones.upperArm,
    backForearm: fighter.bones.forearm,
    frontThigh: fighter.bones.thigh,
    frontShin: fighter.bones.shin,
    backThigh: fighter.bones.thigh,
    backShin: fighter.bones.shin,
  };

  for (const move of fighter.moves) {
    const rows = [];
    let previousJoints = null;

    for (const panel of move.panels) {
      const solved = place(fighter, panel, move.support);

      for (const [name, length] of Object.entries(limbLengths(solved))) {
        if (Math.abs(length - expected[name]) > 0.001) {
          problems.push(`${move.button} F${panel.frame}: ${name} is ${length.toFixed(2)}px, expected ${String(expected[name])}`);
        }
      }

      const pivotX = supportX + rowShift(fighter, move.support);
      if (Math.abs(solved[move.support].ankle[0] - pivotX) > 0.001) {
        problems.push(`${move.button} F${panel.frame}: support foot off the pivot by ${(solved[move.support].ankle[0] - pivotX).toFixed(2)}px`);
      }

      const free = move.support === 'back' ? solved.front.ankle : solved.back.ankle;
      const freeAboveFloor = anchorY - free[1];
      if (freeAboveFloor < -STANCE_DEPTH) {
        problems.push(`${move.button} F${panel.frame}: free foot hangs ${(-freeAboveFloor).toFixed(1)}px below the foot carrying the weight`);
      }

      const contact = contactPoint(fighter, solved, move.contact);
      const contactHeight = floorY - contact[1];
      const reach = contact[0] - solved.waist[0];
      const bounds = drawnBounds(fighter, panel, move);

      const clipped = [];
      if (bounds.left < 1) clipped.push(`left ${String(bounds.left)}`);
      if (bounds.top < 4) clipped.push(`top ${String(bounds.top)}`);
      if (bounds.right > cell.width - 2) clipped.push(`right ${String(bounds.right)}`);
      if (bounds.bottom > floorY) clipped.push(`below floor ${String(bounds.bottom - floorY)}`);
      if (clipped.length > 0) {
        problems.push(`${move.button} F${panel.frame}: figure leaves the cell (${clipped.join(', ')})`);
      }

      const joints = jointList(solved);
      let travel = 0;
      if (previousJoints !== null) {
        let spread = 0;
        for (const [index, joint] of joints.entries()) {
          const distance = Math.hypot(joint[0] - previousJoints[index][0], joint[1] - previousJoints[index][1]);
          travel = Math.max(travel, distance);
          spread += distance;
        }
        if (spread / joints.length < SAME_POSE) {
          problems.push(`${move.button} F${panel.frame}: repeats the previous panel (${(spread / joints.length).toFixed(1)}px per joint)`);
        }
      }
      previousJoints = joints;

      rows.push({
        frame: panel.frame,
        phase: panel.phase,
        contactHeight,
        reach,
        freeAboveFloor,
        travel,
        bounds,
        extent: bounds.right - supportX,
        pelvis: floorY - solved.hip[1],
      });

      if (panel.phase === 'active') {
        if (reach <= 8) {
          problems.push(`${move.button} F${panel.frame}: contact is only ${reach.toFixed(1)}px right of the hips - the attack does not read as facing right`);
        }
        const band = fighter.levelBands[move.level];
        if (band === undefined) {
          problems.push(`${move.button}: no pixel band defined for level "${move.level}"`);
        } else if (contactHeight < band[0] || contactHeight > band[1]) {
          problems.push(`${move.button} F${panel.frame}: contact at ${contactHeight.toFixed(1)}px above the floor is outside the ${move.level} band ${String(band[0])}-${String(band[1])}`);
        }
      }
    }

    // An attack has to leave the stance it started from. The joint angles can be
    // a textbook strike and the panel still read as a hunch, because what the eye
    // compares is the drawn outline against the idle outline beside it.
    const idleExtent = rows[0].extent;
    const activeRow = rows.find((row) => row.phase === 'active');
    const furthest = rows.reduce((best, row) => (row.extent > best.extent ? row : best));
    if (activeRow === undefined) {
      problems.push(`${move.button}: no active frame`);
    } else {
      if (furthest.frame !== activeRow.frame) {
        problems.push(`${move.button}: F${furthest.frame} reaches further (${String(furthest.extent)}px) than the contact frame F${activeRow.frame} (${String(activeRow.extent)}px)`);
      }
      if (activeRow.extent - idleExtent < MINIMUM_STRIKE_MARGIN) {
        problems.push(`${move.button} F${activeRow.frame}: contact reaches only ${String(activeRow.extent - idleExtent)}px past the idle outline - the strike does not clear the stance`);
      }
    }

    const pelvisHeights = rows.map((row) => row.pelvis);
    const pelvisSwing = Math.max(...pelvisHeights) - Math.min(...pelvisHeights);
    const required = move.limbClass === 'LEG' ? MINIMUM_PELVIS_SWING : MINIMUM_PELVIS_SWING / 2;
    if (pelvisSwing < required) {
      problems.push(`${move.button}: pelvis only moves ${pelvisSwing.toFixed(1)}px vertically across the whole move, needs ${required.toFixed(1)}px - no compression`);
    }

    const followPanel = move.panels.find((entry) => entry.phase === 'follow');
    if (followPanel === undefined) {
      problems.push(`${move.button}: no follow-through panel`);
    } else if (activeRow !== undefined) {
      const activePanel = move.panels.find((entry) => entry.phase === 'active');
      const a = jointList(place(fighter, activePanel, move.support));
      const b = jointList(place(fighter, followPanel, move.support));
      let drift = 0;
      for (const [index, joint] of a.entries()) {
        drift += Math.hypot(joint[0] - b[index][0], joint[1] - b[index][1]);
      }
      if (drift / a.length < 3) {
        problems.push(`${move.button}: follow through differs from the active frame by only ${(drift / a.length).toFixed(1)}px per joint`);
      }
    }

    const recoveries = move.panels.filter((entry) => entry.phase === 'recovery');
    if (recoveries.length < 3) {
      problems.push(`${move.button}: only ${String(recoveries.length)} recovery panels, needs at least 3`);
    }
    // Anticipation is counted apart from startup on purpose: folding it in
    // quietly delivers two startup poses where the brief asks for three.
    const startups = move.panels.filter((entry) => entry.phase === 'startup');
    if (startups.length < 3) {
      problems.push(`${move.button}: only ${String(startups.length)} startup panels, needs at least 3 on top of the anticipation`);
    }
    const anticipations = move.panels.filter((entry) => entry.phase === 'anticipation');
    if (anticipations.length !== 1) {
      problems.push(`${move.button}: ${String(anticipations.length)} anticipation panels, needs exactly 1`);
    }
    if (move.panels.length !== 11) {
      problems.push(`${move.button}: ${String(move.panels.length)} panels, the sheet layout expects 11`);
    }

    report.push({ move, rows });
  }

  // All four rows must start from the same drawn idle, or chaining two normals
  // in engine would teleport the character sideways.
  const idles = fighter.moves.map((move) => drawnBounds(fighter, move.panels[0], move));
  for (let index = 1; index < idles.length; index += 1) {
    if (idles[index].left !== idles[0].left || idles[index].right !== idles[0].right
      || idles[index].top !== idles[0].top || idles[index].bottom !== idles[0].bottom) {
      problems.push(`${fighter.moves[index].button}: idle panel does not match ${fighter.moves[0].button}'s idle - the rows do not share a pivot`);
    }
  }

  // Two attacks must never share an active pose.
  const actives = fighter.moves.map((move) => ({
    button: move.button,
    joints: jointList(place(fighter, move.panels.find((entry) => entry.phase === 'active'), move.support)),
  }));
  const separations = [];
  for (let a = 0; a < actives.length; a += 1) {
    for (let b = a + 1; b < actives.length; b += 1) {
      let difference = 0;
      for (const [index, joint] of actives[a].joints.entries()) {
        difference += Math.hypot(joint[0] - actives[b].joints[index][0], joint[1] - actives[b].joints[index][1]);
      }
      const average = difference / actives[a].joints.length;
      separations.push({ pair: `${actives[a].button} vs ${actives[b].button}`, average });
      if (average < 6) {
        problems.push(`${actives[a].button} and ${actives[b].button} active poses differ by only ${average.toFixed(1)}px per joint`);
      }
    }
  }

  return { problems, report, separations };
}

export function printReport(fighter) {
  const { problems, report, separations } = verify(fighter);

  for (const { move, rows } of report) {
    console.log(`\n=== ${move.button}  ${move.name}  (${move.limbClass}, ${move.level}) ===`);
    console.log('frame  phase      contactY  reachX  freeFootY  pelvisY  extent  travel');
    for (const row of rows) {
      console.log([
        `F${String(row.frame).padStart(2, '0')}`.padEnd(6),
        row.phase.padEnd(10),
        row.contactHeight.toFixed(1).padStart(8),
        row.reach.toFixed(1).padStart(7),
        row.freeAboveFloor.toFixed(1).padStart(10),
        row.pelvis.toFixed(1).padStart(8),
        String(row.extent).padStart(7),
        row.travel.toFixed(1).padStart(7),
      ].join(''));
    }
  }

  console.log('\n=== active pose separation (px per joint) ===');
  for (const { pair, average } of separations) console.log(`${pair}: ${average.toFixed(1)}`);

  console.log(`\n=== ${String(problems.length)} problem(s) ===`);
  for (const problem of problems) console.log(`  - ${problem}`);
  return problems.length;
}
