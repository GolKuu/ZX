'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Group } from 'three';
import {
  combatRenderFrame,
  readCombatFighter,
} from '@/src/game/combatRuntime';
import { FIXED_SCALE } from '@/src/sim';
import { combatAnimationProgress } from '../combatAnimationProgress';
import { AttackPoseSprite } from './AttackPoseSprite';
import { SpritePart } from './SpritePart';
import { spritePoseFor, type SpritePose } from './spritePose';
import {
  disposeAttackPoses,
  disposeSpriteRig,
  loadAttackPoses,
  loadSpriteRig,
  PIXEL,
  type AttackPoseName,
  type LoadedAttackPoses,
  type LoadedSpriteRig,
} from './spriteRig';

/**
 * A fighter drawn as a 2D cut-out of its own character sheet.
 *
 * The sheet's profile view is sliced into parts by
 * `scripts/slice-characters.mjs`; this hangs those parts on a joint hierarchy
 * and rotates them about Z. Nothing is lit — the parts are the artwork, at the
 * artwork's own values, which is the only way the game matches a flat vector
 * drawing exactly.
 *
 * The profile shows one arm and one leg, so the far limbs reuse the same
 * textures behind the body, tinted down. That is standard for a 2D cut-out
 * fighter and is why a side view is the right thing to cut.
 *
 * Joint positions below are in sheet pixels measured down from the crown, which
 * is how they were read off the sliced drawing.
 */

/** Joint anchors, in sheet pixels from the top of the profile. */
const NECK_Y = 100;
const WAIST_Y = 200;
const HIP_Y = 288;
const SHOULDER_Y = 110;
const ELBOW_Y = 176;
const KNEE_Y = 353;
const ANKLE_Y = 420;
const FOOT_Y = 484;

/** Depth order. A flat rig needs explicit layering or the parts z-fight. */
const LAYER = {
  farLeg: -0.06,
  farArm: -0.045,
  ponytail: -0.03,
  hips: 0,
  sash: 0.012,
  torso: 0.024,
  head: 0.036,
  nearLeg: 0.05,
  nearArm: 0.064,
} as const;

/** How far behind the near side the far limbs read. */
const FAR_TINT = '#b9a7bd';

/**
 * When the drawn attack pose replaces the jointed rig, as attack progress.
 *
 * A rig can approximate a punch; it cannot match a drawing. The windup and the
 * tail of the recovery stay on the rig so the transition has motion either side
 * of it, and the frame the player actually reads — the strike — is the sheet's
 * own artwork.
 */
const POSE_IN = 0.24;
const POSE_OUT = 0.82;

/** Attack panels are drawn at a slightly smaller scale than the turnaround. */
const ATTACK_SCALE = 1.18;

function y(pixels: number): number {
  return (FOOT_Y - pixels) * PIXEL;
}

export function Sprite2DFighter({
  attackPoseName,
  fighterId,
  rigName,
}: {
  /** Sliced attack panels, when the sheet draws them in costume colour. */
  readonly attackPoseName?: string;
  readonly fighterId: 'p1' | 'p2';
  readonly rigName: string;
}) {
  const outer = useRef<Group>(null);
  const body = useRef<Group>(null);
  const rigGroup = useRef<Group>(null);
  const poseGroup = useRef<Group>(null);
  const [rig, setRig] = useState<LoadedSpriteRig | null>(null);
  const [poses, setPoses] = useState<LoadedAttackPoses | null>(null);
  const shownPose = useRef<AttackPoseName | null>(null);

  // A ref, not a memo: the joint slots are filled by `ref` callbacks during
  // render, and mutating a memoised object is exactly what
  // `react-hooks/immutability` exists to prevent.
  const joints = useRef<Joints>({
    torso: null,
    head: null,
    ponytail: null,
    sash: null,
    upperArm: null,
    forearm: null,
    farUpperArm: null,
    farForearm: null,
    thigh: null,
    shin: null,
    boot: null,
    farThigh: null,
    farShin: null,
    farBoot: null,
  });

  useEffect(() => {
    let cancelled = false;
    let loaded: LoadedSpriteRig | null = null;

    loadSpriteRig(rigName)
      .then((result) => {
        if (cancelled) {
          disposeSpriteRig(result);
          return;
        }
        loaded = result;
        setRig(result);
      })
      .catch((error: unknown) => {
        console.warn(`[${fighterId}] Could not load sprite rig "${rigName}".`, error);
      });

    return () => {
      cancelled = true;
      if (loaded !== null) disposeSpriteRig(loaded);
      setRig(null);
    };
  }, [fighterId, rigName]);

  useEffect(() => {
    if (attackPoseName === undefined) return undefined;
    let cancelled = false;
    let loaded: LoadedAttackPoses | null = null;

    loadAttackPoses(attackPoseName)
      .then((result) => {
        if (cancelled) {
          disposeAttackPoses(result);
          return;
        }
        loaded = result;
        setPoses(result);
      })
      .catch((error: unknown) => {
        console.warn(
          `[${fighterId}] Could not load attack poses "${attackPoseName}".`,
          error,
        );
      });

    return () => {
      cancelled = true;
      if (loaded !== null) disposeAttackPoses(loaded);
      setPoses(null);
    };
  }, [attackPoseName, fighterId]);

  useFrame(({ clock }) => {
    const group = outer.current;
    const inner = body.current;
    const fighter = readCombatFighter(fighterId);
    if (group === null || inner === null || fighter === null) return;

    const alpha = combatRenderFrame.interpolationAlpha;
    group.position.x = (
      fighter.previousPosition.x
      + (fighter.position.x - fighter.previousPosition.x) * alpha
    ) / FIXED_SCALE;
    group.position.y = fighter.position.y / FIXED_SCALE;

    // Mirror the whole rig rather than re-authoring poses for the other
    // direction. Which way the artwork already faces is per sheet — IDOL's
    // profile columns face left, CHRONO's and GLITCH's face right — so a fixed
    // sign would point half the roster away from its opponent.
    const drawnFacing = rig?.facesRight === true ? 1 : -1;
    group.scale.x = drawnFacing * fighter.facing;

    const progress = fighter.action === null
      ? 0
      : combatAnimationProgress(fighter.action.moveId, fighter.action.frame);
    // Which read is on screen: the drawn attack pose, or the jointed rig.
    const drawn = fighter.action !== null
      && poses !== null
      && progress >= POSE_IN
      && progress <= POSE_OUT
      ? buttonOf(fighter.action.moveId)
      : null;
    const available = drawn !== null && poses?.[drawn] !== undefined ? drawn : null;
    shownPose.current = available;

    if (rigGroup.current !== null) rigGroup.current.visible = available === null;
    if (poseGroup.current !== null) poseGroup.current.visible = available !== null;

    if (available !== null) {
      // The drawn pose already contains the whole body, so the rig's lean and
      // lift must not also apply — it would double the motion.
      inner.position.set(0, 0, 0);
      return;
    }

    const pose = spritePoseFor(fighter, clock.elapsedTime, progress);
    apply(joints.current, pose);
    inner.position.y = pose.lift;
    inner.position.x = pose.drift;
  });

  return (
    <group ref={outer}>
      <group ref={body}>
        <group ref={rigGroup}>
        {rig === null ? null : (
          <>
            {/* Far leg, behind everything. */}
            <group position={[0, y(HIP_Y), LAYER.farLeg]} ref={(node) => { joints.current.farThigh = node; }}>
              <SpritePart part={rig.thigh} tint={FAR_TINT} />
              <group position={[0, y(KNEE_Y) - y(HIP_Y), 0]} ref={(node) => { joints.current.farShin = node; }}>
                <SpritePart part={rig.shin} tint={FAR_TINT} />
                <group position={[0, y(ANKLE_Y) - y(KNEE_Y), 0]} ref={(node) => { joints.current.farBoot = node; }}>
                  <SpritePart part={rig.boot} tint={FAR_TINT} />
                </group>
              </group>
            </group>

            <group position={[0, y(WAIST_Y), LAYER.hips]}>
              <SpritePart part={rig.hips} />
            </group>

            <group position={[0, y(WAIST_Y), LAYER.sash]} ref={(node) => { joints.current.sash = node; }}>
              <SpritePart part={rig.sash} />
            </group>

            {/* Torso, and everything that rides on it. */}
            <group position={[0, y(WAIST_Y), LAYER.torso]} ref={(node) => { joints.current.torso = node; }}>
              <SpritePart part={rig.torso} />

              <group position={[0, y(SHOULDER_Y) - y(WAIST_Y), LAYER.farArm - LAYER.torso]} ref={(node) => { joints.current.farUpperArm = node; }}>
                <SpritePart part={rig.upperArm} tint={FAR_TINT} />
                <group position={[0, y(ELBOW_Y) - y(SHOULDER_Y), 0]} ref={(node) => { joints.current.farForearm = node; }}>
                  <SpritePart part={rig.forearm} tint={FAR_TINT} />
                </group>
              </group>

              <group position={[0, y(NECK_Y) - y(WAIST_Y), LAYER.head - LAYER.torso]} ref={(node) => { joints.current.head = node; }}>
                <SpritePart part={rig.head} />
                <group position={[0, 0, LAYER.ponytail - LAYER.head]} ref={(node) => { joints.current.ponytail = node; }}>
                  <SpritePart part={rig.ponytail} />
                </group>
              </group>

              <group position={[0, y(SHOULDER_Y) - y(WAIST_Y), LAYER.nearArm - LAYER.torso]} ref={(node) => { joints.current.upperArm = node; }}>
                <SpritePart part={rig.upperArm} />
                <group position={[0, y(ELBOW_Y) - y(SHOULDER_Y), 0]} ref={(node) => { joints.current.forearm = node; }}>
                  <SpritePart part={rig.forearm} />
                </group>
              </group>
            </group>

            {/* Near leg, in front. */}
            <group position={[0, y(HIP_Y), LAYER.nearLeg]} ref={(node) => { joints.current.thigh = node; }}>
              <SpritePart part={rig.thigh} />
              <group position={[0, y(KNEE_Y) - y(HIP_Y), 0]} ref={(node) => { joints.current.shin = node; }}>
                <SpritePart part={rig.shin} />
                <group position={[0, y(ANKLE_Y) - y(KNEE_Y), 0]} ref={(node) => { joints.current.boot = node; }}>
                  <SpritePart part={rig.boot} />
                </group>
              </group>
            </group>
          </>
        )}
        </group>

        <group ref={poseGroup} visible={false}>
          {poses === null ? null : (
            <AttackPoseSprite poses={poses} shown={shownPose} scale={ATTACK_SCALE} />
          )}
        </group>
      </group>
    </group>
  );
}

/**
 * Move id → attack button. Per-character tables namespace their ids
 * (`idol.hp`), so the suffix is what identifies the button.
 */
function buttonOf(moveId: string): AttackPoseName | null {
  const suffix = moveId.slice(moveId.lastIndexOf('.') + 1).toLowerCase();
  if (suffix === 'lp' || suffix === 'hp' || suffix === 'lk' || suffix === 'hk') {
    return suffix;
  }
  // The shared table uses fighting-game notation instead.
  if (suffix === '5l') return 'lp';
  if (suffix === '5h') return 'hp';
  if (suffix === '2l' || suffix === '2m') return 'lk';
  if (suffix === '5m') return 'hk';
  return null;
}

type Joints = Record<keyof Omit<SpritePose, 'lift' | 'drift'>, Group | null>;

function apply(joints: Joints, pose: SpritePose): void {
  for (const name of Object.keys(joints) as (keyof Joints)[]) {
    const joint = joints[name];
    if (joint !== null) joint.rotation.z = pose[name];
  }
}
