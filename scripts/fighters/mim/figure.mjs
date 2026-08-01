import { drawPose as drawMim } from '../../mim/draw-pose.mjs';
import { BONES as MIM_BONES, THICKNESS } from '../../mim/rig-spec.mjs';

/**
 * MIM on the shared fighter rig.
 *
 * The drawing itself still lives in `scripts/mim/`, because it is the same code
 * that ships the in-game sprites and it must stay that way — the sheet's whole
 * claim is that it cannot drift from the character. Only the bone table is
 * restated here, in the shape the shared solver expects.
 */
export const BONES = {
  origin: [88, 112],
  crownToFloor: 96,
  hipHeight: 50,
  waistRise: 4,
  torso: 26,
  neckToHead: MIM_BONES.neckToHead,
  shoulderOffset: 3.5,
  hipOffset: 4,
  upperArm: MIM_BONES.upperArm,
  forearm: MIM_BONES.forearm,
  thigh: MIM_BONES.thigh,
  shin: MIM_BONES.shin,
  foot: MIM_BONES.foot,
  handReach: 3,
  thickness: THICKNESS,
};

export const drawPose = drawMim;
