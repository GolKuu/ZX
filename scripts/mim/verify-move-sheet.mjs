import { PixelCanvas } from './canvas.mjs';
import { drawPose } from './draw-pose.mjs';
import { BONES } from './rig-spec.mjs';
import { MOVE_SHEET } from './move-sheet-poses.mjs';
import { contactPoint, place, rowShift } from './build-move-sheet.mjs';

/**
 * The sheet's own quality gate.
 *
 * Everything the brief calls a critical defect can be measured rather than
 * eyeballed: a limb that changes length, a foot that slides off the pivot, an
 * attack that points left, a contact that lands at the wrong height, a pose
 * that jumps instead of moving. This reports all of it in numbers.
 */

const CELL = { width: 150, height: 158 };
const FLOOR_Y = 130;
const SUPPORT_X = 52;
const ANKLE_ABOVE_FLOOR = 5;
/** How far apart in depth the two feet of a planted stance may sit. */
const STANCE_DEPTH = 3;
/** How far a contact frame must reach past the idle outline to read as a hit. */
const MINIMUM_STRIKE_MARGIN = 8;

/**
 * What each attack level means in pixels on a 96px figure.
 *
 * The bands come from the rig's real reach, not from taste: the shoulder sits
 * about 76px above the floor and the arm is 27px long, so a straight lead hand
 * lands near 68 and a folded elbow can only get below that if the hips sink.
 */
const LEVEL_BANDS = {
  HIGH: [60, 82],
  MID: [50, 68],
  'MID-HIGH': [38, 72],
  LOW: [0, 18],
};

function limbLengths(solved) {
  const span = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  return {
    frontUpperArm: span(solved.front.shoulder, solved.front.elbow),
    frontForearm: span(solved.front.elbow, solved.front.wrist),
    backUpperArm: span(solved.back.shoulder, solved.back.elbow),
    backForearm: span(solved.back.elbow, solved.back.wrist),
    frontThigh: span(solved.front.hip, solved.front.knee),
    frontShin: span(solved.front.knee, solved.front.ankle),
    backThigh: span(solved.back.hip, solved.back.knee),
    backShin: span(solved.back.knee, solved.back.ankle),
  };
}

const EXPECTED = {
  frontUpperArm: BONES.upperArm,
  frontForearm: BONES.forearm,
  backUpperArm: BONES.upperArm,
  backForearm: BONES.forearm,
  frontThigh: BONES.thigh,
  frontShin: BONES.shin,
  backThigh: BONES.thigh,
  backShin: BONES.shin,
};

function jointList(solved) {
  return [
    solved.head, solved.neck, solved.waist,
    solved.front.shoulder, solved.front.elbow, solved.front.wrist,
    solved.front.hip, solved.front.knee, solved.front.ankle,
    solved.back.shoulder, solved.back.elbow, solved.back.wrist,
    solved.back.hip, solved.back.knee, solved.back.ankle,
  ];
}

function drawnBounds(panel, move) {
  // Draw into a generous canvas with the pivot in the same relative spot, so
  // the reported box is directly comparable with the real cell window.
  const pad = 200;
  const canvas = new PixelCanvas(CELL.width + pad * 2, CELL.height + pad * 2);
  const solved = place(panel, move.support, SUPPORT_X + pad, FLOOR_Y - ANKLE_ABOVE_FLOOR + pad);
  drawPose(canvas, solved);
  const { offsetX, offsetY, canvas: trimmed } = canvas.trim(0);
  return {
    left: offsetX - pad,
    top: offsetY - pad,
    right: offsetX - pad + trimmed.width - 1,
    bottom: offsetY - pad + trimmed.height - 1,
  };
}

export function verify() {
  const problems = [];
  const report = [];

  for (const move of MOVE_SHEET) {
    const rows = [];
    let previousJoints = null;

    for (const panel of move.panels) {
      const solved = place(panel, move.support, SUPPORT_X, FLOOR_Y - ANKLE_ABOVE_FLOOR);

      for (const [name, length] of Object.entries(limbLengths(solved))) {
        if (Math.abs(length - EXPECTED[name]) > 0.001) {
          problems.push(`${move.button} F${panel.frame}: ${name} is ${length.toFixed(2)}px, expected ${EXPECTED[name]}`);
        }
      }

      const pivotX = SUPPORT_X + rowShift(move.support);
      const support = solved[move.support].ankle;
      if (Math.abs(support[0] - pivotX) > 0.001) {
        problems.push(`${move.button} F${panel.frame}: support foot off the pivot by ${(support[0] - pivotX).toFixed(2)}px`);
      }

      const free = move.support === 'back' ? solved.front.ankle : solved.back.ankle;
      const freeAboveFloor = (FLOOR_Y - ANKLE_ABOVE_FLOOR) - free[1];
      // A stance legitimately sets the two feet a few pixels apart in depth.
      // Beyond that the free limb is being driven through the ground.
      if (freeAboveFloor < -STANCE_DEPTH) {
        problems.push(`${move.button} F${panel.frame}: free foot hangs ${(-freeAboveFloor).toFixed(1)}px below the foot carrying the weight`);
      }

      const contact = contactPoint(solved, move.contact);
      const contactHeight = FLOOR_Y - contact[1];
      const reach = contact[0] - solved.waist[0];

      const bounds = drawnBounds(panel, move);
      const clipped = [];
      if (bounds.left < 1) clipped.push(`left ${String(bounds.left)}`);
      if (bounds.top < 4) clipped.push(`top ${String(bounds.top)}`);
      if (bounds.right > CELL.width - 2) clipped.push(`right ${String(bounds.right)}`);
      if (bounds.bottom > FLOOR_Y + 1) clipped.push(`below floor ${String(bounds.bottom - FLOOR_Y)}`);
      if (clipped.length > 0) {
        problems.push(`${move.button} F${panel.frame}: figure leaves the cell (${clipped.join(', ')})`);
      }

      const joints = jointList(solved);
      let travel = 0;
      if (previousJoints !== null) {
        let spread = 0;
        for (const [index, joint] of joints.entries()) {
          const distance = Math.hypot(
            joint[0] - previousJoints[index][0],
            joint[1] - previousJoints[index][1],
          );
          travel = Math.max(travel, distance);
          spread += distance;
        }
        // A panel that repeats its neighbour spends a tenth of the sheet's
        // budget saying nothing.
        if (spread / joints.length < 1.5) {
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
        // How far the drawn figure reaches past the pivot column. This, not the
        // joint angle, is what decides whether an attack reads as an attack.
        extent: bounds.right - SUPPORT_X,
      });

      if (panel.phase === 'active') {
        if (reach <= 8) {
          problems.push(`${move.button} F${panel.frame}: contact is only ${reach.toFixed(1)}px right of the hips - the attack does not read as facing right`);
        }
        const band = LEVEL_BANDS[move.level];
        if (contactHeight < band[0] || contactHeight > band[1]) {
          problems.push(`${move.button} F${panel.frame}: contact at ${contactHeight.toFixed(1)}px above the floor is outside the ${move.level} band ${String(band[0])}-${String(band[1])}`);
        }
      }
    }

    /**
     * An attack has to leave the stance it started from.
     *
     * The joint angles can be a textbook strike and the panel still read as a
     * hunch, because what the eye compares is the drawn outline against the
     * idle outline beside it. So the contact frame must own the row's furthest
     * reach, and must clear the idle's own reach by a visible margin.
     */
    const idleExtent = rows[0].extent;
    const activeRow = rows.find((row) => row.phase === 'active');
    const furthest = rows.reduce((best, row) => (row.extent > best.extent ? row : best));
    if (furthest.frame !== activeRow.frame) {
      problems.push(`${move.button}: F${furthest.frame} reaches further (${String(furthest.extent)}px) than the contact frame F${activeRow.frame} (${String(activeRow.extent)}px)`);
    }
    if (activeRow.extent - idleExtent < MINIMUM_STRIKE_MARGIN) {
      problems.push(`${move.button} F${activeRow.frame}: contact reaches only ${String(activeRow.extent - idleExtent)}px past the idle outline - the strike does not clear the stance`);
    }

    // Follow-through has to be a different pose, not the active frame again.
    const activePanel = move.panels.find((entry) => entry.phase === 'active');
    const followPanel = move.panels.find((entry) => entry.phase === 'follow');
    const activeJoints = jointList(place(activePanel, move.support, SUPPORT_X, FLOOR_Y - ANKLE_ABOVE_FLOOR));
    const followJoints = jointList(place(followPanel, move.support, SUPPORT_X, FLOOR_Y - ANKLE_ABOVE_FLOOR));
    let drift = 0;
    for (const [index, joint] of activeJoints.entries()) {
      drift += Math.hypot(joint[0] - followJoints[index][0], joint[1] - followJoints[index][1]);
    }
    if (drift / activeJoints.length < 3) {
      problems.push(`${move.button}: follow through differs from the active frame by only ${(drift / activeJoints.length).toFixed(1)}px per joint`);
    }

    // Two attacks must never share an active pose.
    report.push({ move, rows });
  }

  // Active-frame separation: compare the four contact points and body shapes.
  const actives = report.map(({ move }) => {
    const panel = move.panels.find((entry) => entry.phase === 'active');
    const solved = place(panel, move.support, SUPPORT_X, FLOOR_Y - ANKLE_ABOVE_FLOOR);
    return {
      button: move.button,
      contact: contactPoint(solved, move.contact),
      joints: jointList(solved),
    };
  });
  for (let a = 0; a < actives.length; a += 1) {
    for (let b = a + 1; b < actives.length; b += 1) {
      let difference = 0;
      for (const [index, joint] of actives[a].joints.entries()) {
        difference += Math.hypot(
          joint[0] - actives[b].joints[index][0],
          joint[1] - actives[b].joints[index][1],
        );
      }
      const average = difference / actives[a].joints.length;
      if (average < 6) {
        problems.push(`${actives[a].button} and ${actives[b].button} active poses differ by only ${average.toFixed(1)}px per joint`);
      }
    }
  }

  return { problems, report, actives };
}

function main() {
  const { problems, report, actives } = verify();

  for (const { move, rows } of report) {
    console.log(`\n=== ${move.button}  ${move.name}  (${move.limbClass}, ${move.level}) ===`);
    console.log('frame  phase      contactY  reachX  freeFootY  maxJointTravel  box(L,T,R,B)');
    for (const row of rows) {
      console.log([
        `F${String(row.frame).padStart(2, '0')}`.padEnd(6),
        row.phase.padEnd(10),
        row.contactHeight.toFixed(1).padStart(8),
        row.reach.toFixed(1).padStart(7),
        row.freeAboveFloor.toFixed(1).padStart(10),
        row.travel.toFixed(1).padStart(15),
        `  ${String(row.bounds.left)},${String(row.bounds.top)},${String(row.bounds.right)},${String(row.bounds.bottom)}`,
      ].join(''));
    }
  }

  console.log('\n=== active pose separation (px per joint) ===');
  for (let a = 0; a < actives.length; a += 1) {
    for (let b = a + 1; b < actives.length; b += 1) {
      let difference = 0;
      for (const [index, joint] of actives[a].joints.entries()) {
        difference += Math.hypot(
          joint[0] - actives[b].joints[index][0],
          joint[1] - actives[b].joints[index][1],
        );
      }
      console.log(`${actives[a].button} vs ${actives[b].button}: ${(difference / actives[a].joints.length).toFixed(1)}`);
    }
  }

  console.log(`\n=== ${String(problems.length)} problem(s) ===`);
  for (const problem of problems) console.log(`  - ${problem}`);
}

main();
