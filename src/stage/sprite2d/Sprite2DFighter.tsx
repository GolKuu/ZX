'use client';

import { useFrame } from '@react-three/fiber';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Group } from 'three';
import {
  combatRenderFrame,
  readCombatFighter,
  readLatestHit,
} from '@/src/game/combatRuntime';
import { isEchoSpecialMove } from '@/src/data/echo-special-moves';
import { echoSuperKindForMove } from '@/src/data/echo-super-moves';
import { FIXED_SCALE } from '@/src/sim';
import { EchoSpriteEffects } from '../echo/EchoSpriteEffects';
import { applyEchoSpriteMotion } from '../echo/echoSpriteMotion';
import { GlitchSpriteEffects } from '../glitch/GlitchSpriteEffects';
import {
  applyGlitchSpriteCorruption,
  glitchSpriteProgress,
} from '../glitch/glitchSpriteMotion';
import {
  isStrikeFrame,
  spriteAnimationProgress,
} from '../combatAnimationProgress';
import {
  spriteFacingScale,
  withOpponentFacing,
} from '../fighterPresentation';
import { AttackPoseSprite } from './AttackPoseSprite';
import {
  SpriteRigBody,
  type SpriteJointName,
  type SpriteJoints,
} from './SpriteRigBody';
import {
  spritePoseFor,
  type HurtZone,
  type SpritePose,
} from './spritePose';
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
 * Every joint and the figure's floor origin come from the generated manifest,
 * so characters with different source-sheet sizes share the same stage height.
 *
 * At the strike the jointed rig steps aside for the sheet's own attack drawing —
 * see `AttackPoseSprite`. A rig can approximate a punch; it cannot match a drawing,
 * and the strike is the one frame a player actually reads.
 */

/** Impact height, in engine units, below which a blow counts as low or as high. */
const LEGS_BELOW = 0.95;
const HEAD_ABOVE = 1.82;

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
  const shownPose = useRef<AttackPoseName | null>(null);
  const [rig, setRig] = useState<LoadedSpriteRig | null>(null);
  const [poses, setPoses] = useState<LoadedAttackPoses | null>(null);
  const opponentId = fighterId === 'p1' ? 'p2' : 'p1';

  // A ref, not a memo: the joint slots are filled by `ref` callbacks during
  // render, and mutating a memoised object is exactly what
  // `react-hooks/immutability` exists to prevent.
  const joints = useRef<SpriteJoints>({
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
  const setJoint = useCallback((
    name: SpriteJointName,
    node: Group | null,
  ) => {
    joints.current[name] = node;
  }, []);

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
    const presentation = withOpponentFacing(
      fighter,
      readCombatFighter(opponentId),
    );

    // Mirror the whole rig rather than re-authoring poses for the other
    // direction. Which way the artwork already faces is per sheet — CHRONO's
    // and GLITCH's face right in their current assets — so a fixed sign would
    // point half the roster away from its opponent.
    const drawnFacing = rig?.facesRight === true ? 1 : -1;
    group.scale.x = spriteFacingScale(
      rig?.facesRight === true,
      presentation.facing,
    );
    if (poseGroup.current !== null && poses !== null) {
      const attackDrawnFacing = poses.facesRight ? 1 : -1;
      poseGroup.current.scale.x = attackDrawnFacing === drawnFacing ? 1 : -1;
    }

    const rawProgress = fighter.action === null
      ? 0
      : spriteAnimationProgress(
        fighter.action.moveId,
        fighter.action.frame,
      );
    const progress = rigName === 'glitch-profile'
      ? glitchSpriteProgress(
        rawProgress,
        fighter.action?.frame ?? 0,
        fighter.action === null
          ? false
          : isStrikeFrame(fighter.action.moveId, fighter.action.frame),
      )
      : rawProgress;

    // Which read is on screen: the drawn attack pose, or the jointed rig.
    const strikePose = fighter.action !== null
      && isStrikeFrame(fighter.action.moveId, fighter.action.frame)
      ? buttonOf(fighter.action.moveId)
      : null;
    const available = strikePose !== null && poses?.[strikePose] !== undefined
      ? strikePose
      : null;
    shownPose.current = available;
    if (rigGroup.current !== null) rigGroup.current.visible = available === null;
    if (poseGroup.current !== null) poseGroup.current.visible = available !== null;

    if (available !== null) {
      // The drawing already contains the whole body, so the rig's lean and lift
      // must not also apply — it would double the motion.
      inner.position.set(0, 0, 0);
      if (rigName === 'glitch-profile') {
        applyGlitchSpriteCorruption(
          joints.current,
          inner,
          clock.elapsedTime,
          fighter,
          progress,
          true,
        );
      } else if (rigName === 'echo-profile') {
        applyEchoSpriteMotion(
          joints.current,
          inner,
          clock.elapsedTime,
          fighter,
          progress,
          true,
          drawnFacing,
        );
      }
      return;
    }

    const echoDirectedMove = rigName === 'echo-profile'
      && (
        isEchoSpecialMove(presentation.action?.moveId)
        || echoSuperKindForMove(presentation.action?.moveId ?? '') !== null
      );
    const poseFighter = echoDirectedMove
      ? { ...presentation, action: null }
      : presentation;
    const pose = spritePoseFor(
      poseFighter,
      clock.elapsedTime,
      progress,
      hurtZoneOf(fighterId, fighter.position.y / FIXED_SCALE),
      'windup',
    );
    apply(joints.current, pose);
    inner.position.y = pose.lift;
    inner.position.x = pose.drift;
    if (rigName === 'echo-profile') {
      applyEchoSpriteMotion(
        joints.current,
        inner,
        clock.elapsedTime,
        fighter,
        progress,
        false,
        drawnFacing,
      );
    } else if (rigName === 'glitch-profile') {
      applyGlitchSpriteCorruption(
        joints.current,
        inner,
        clock.elapsedTime,
        fighter,
        progress,
        false,
      );
    }
  });

  return (
    <group ref={outer}>
      <group ref={body}>
        <group ref={rigGroup}>
          {rig === null ? null : (
            <SpriteRigBody rig={rig} setJoint={setJoint} />
          )}
        </group>
        <group ref={poseGroup} visible={false}>
          {poses === null ? null : (
            <AttackPoseSprite
              pixelScale={PIXEL * poses.displayScale}
              poses={poses}
              shown={shownPose}
            />
          )}
        </group>
        {rigName === 'glitch-profile' && rig !== null ? (
          <GlitchSpriteEffects fighterId={fighterId} rig={rig} />
        ) : null}
        {rigName === 'echo-profile' && rig !== null ? (
          <EchoSpriteEffects
            fighterId={fighterId}
            rig={rig}
          />
        ) : null}
      </group>
    </group>
  );
}

/**
 * Where the last blow landed on this fighter.
 *
 * Measured from the fighter's own feet, not from the stage floor, so a hit taken
 * mid-jump is still classified by where it caught the body.
 */
function hurtZoneOf(fighterId: string, feetY: number): HurtZone {
  const hit = readLatestHit(fighterId);
  if (hit === null) return 'body';
  const height = hit.y - feetY;
  if (height < LEGS_BELOW) return 'legs';
  if (height > HEAD_ABOVE) return 'head';
  return 'body';
}

/**
 * Move id → attack button. Per-character tables namespace their ids
 * The suffix identifies the button, so `5L`, `5M`, `5H`, `2L`, and `2M` map
 * to the four attack columns.
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

function apply(joints: SpriteJoints, pose: SpritePose): void {
  for (const name of Object.keys(joints) as (keyof SpriteJoints)[]) {
    const joint = joints[name];
    if (joint !== null) joint.rotation.z = pose[name];
  }
}
