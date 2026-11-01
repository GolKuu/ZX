'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type { Group } from 'three';
import type { CharacterId } from '@/src/data/characterRoster';
import { combatRenderFrame, readCombatFighter } from '@/src/game/combatRuntime';
import { FIXED_SCALE } from '@/src/sim';
import { combatAnimationProgress } from '../combatAnimationProgress';
import { facingOpponent } from '../fighterPresentation';
import { GlitchSpriteEffects } from '../glitch/GlitchSpriteEffects';
import { VorghEffects } from '../vorgh/VorghEffects';
import { CharacterHeroFX } from '../photoSprite/CharacterHeroFX';
import { attackShapeFor } from './attackShapes';
import { characterBuild } from './characterBuild';
import { ForgeHeroSkeleton } from './ForgeHeroSkeleton';
import { applyForgeMotion, loadForgeMotions } from './forgeMotion';
import { groundForgePose } from './forgeGrounding';
import { finishForgePose, motionJoints } from './forgeMotionTransition';
import { FighterSkeleton, type FighterJoints } from './FighterSkeleton';
import { useFighterSurfaces } from './fighter3dMaterials';
import { applyPose, downPose, isKnockedDown, neutralPose } from './fighterPose';
import { applyFighterPosture, WALK_REFERENCE, WALK_THRESHOLD } from './fighterPosture';

/**
 * A fighter as real 3D geometry, posed from the simulation every frame.
 *
 * The character this replaces was a photograph on a billboard. That reads well
 * from one fixed angle and falls apart the moment the stage stops being flat —
 * it cannot turn, it cannot take the key light, and it cannot cast a shadow
 * shaped like a body. This one is a jointed rig standing in the room: the same
 * lights that hit the stone hit the fighter, and a move like the 540 is an
 * actual rotation rather than a drawing of one.
 *
 * Per rule R3 nothing here touches React state — the sim is read through refs
 * and only transforms are written.
 */
export function KombatFighter({
  characterId,
  fighterId,
}: {
  readonly characterId: CharacterId;
  readonly fighterId: 'p1' | 'p2';
}) {
  const outer = useRef<Group>(null);
  const joints = useRef<FighterJoints>(null);
  const build = characterBuild(characterId);
  const surfaces = useFighterSurfaces(characterId);
  const opponentId = fighterId === 'p1' ? 'p2' : 'p1';
  const downSince = useRef<number | null>(null);
  const presentationTime = useRef(0);
  const walkTime = useRef(0);
  const wasHitstopped = useRef(false);
  useEffect(() => { void loadForgeMotions(); }, []);

  useFrame((_, delta) => {
    const fighter = readCombatFighter(fighterId);
    const root = outer.current;
    const rig = joints.current;
    if (fighter === null || root === null || rig === null) return;

    const alpha = combatRenderFrame.interpolationAlpha;
    root.position.x = (
      fighter.previousPosition.x
      + (fighter.position.x - fighter.previousPosition.x) * alpha
    ) / FIXED_SCALE;
    root.position.y = fighter.position.y / FIXED_SCALE;

    // Show the new contact/reaction pose once before freezing it. Returning on
    // the first hitstop sample would hold the preceding windup pose instead.
    const hitstopped = fighter.hitstop > 0;
    if (hitstopped && wasHitstopped.current) return;
    wasHitstopped.current = hitstopped;
    const frameDelta = hitstopped ? 0 : delta;

    // The body turns to face the opponent. A billboard could only mirror; a rig
    // can rotate, which is most of why this is worth doing at all.
    const facing = facingOpponent(fighter, readCombatFighter(opponentId));
    // Lock orientation through the committed move: crossing cannot reverse a punch mid-swing.
    if (fighter.action === null) root.rotation.y = facing === 1 ? 1.12 : -1.12;

    presentationTime.current += frameDelta;
    const time = presentationTime.current;
    const pose = neutralPose(build.stoop);

    const down = isKnockedDown(fighter);
    if (down) {
      downSince.current ??= time;
      downPose(pose, (time - downSince.current) * 5);
    } else {
      downSince.current = null;
      applyFighterPosture(pose, fighter, time + (fighterId === 'p2' ? 0.37 : 0));
    }

    if (characterId === 'glitch' || characterId === 'vorgh') {
      // applyPose writes only authored Euler axes. Clear captured twist on the
      // remaining axes before falling back to a guard, reaction or unmapped move.
      motionJoints.forEach(joint => rig[joint].quaternion.identity());
    }
    applyPose(rig, pose);
    let motionKey = down ? 'down' : fighter.hitstun > 0 ? 'hit'
      : fighter.guarding ? 'guard' : fighter.crouching ? 'crouch' : 'air';
    let progress = -1;
    if ((characterId === 'glitch' || characterId === 'vorgh') && !down
      && fighter.hitstun === 0 && !fighter.guarding && !fighter.crouching && fighter.grounded) {
      const variant = characterId === 'vorgh' ? 'cinder' : 'ion';
      const action = fighter.action;
      const state = action?.moveId ?? (Math.abs(fighter.velocity.x) >= WALK_THRESHOLD ? 'walk' : 'idle');
      progress = action ? combatAnimationProgress(action.moveId, action.frame) : -1;
      if (state === 'walk') {
        const speed = Math.min(1.25, Math.max(.6, Math.abs(fighter.velocity.x) / WALK_REFERENCE));
        // Reverse the source cycle when retreating. Integrate phase so direction
        // or speed changes cannot seek abruptly to another point in the cycle.
        const direction = fighter.velocity.x * facing >= 0 ? 1 : -1;
        walkTime.current += frameDelta * speed * direction;
      }
      const sample = action ? progress : state === 'walk' ? walkTime.current : time;
      const captured = applyForgeMotion(rig, variant, state, sample, action === null, facing === 1);
      motionKey = `${captured ? 'capture' : 'authored'}:${state}`;
    }
    if (characterId === 'glitch' || characterId === 'vorgh') {
      finishForgePose(rig, motionKey, hitstopped ? .08 : frameDelta, progress);
      const visualHop = fighter.action && attackShapeFor(fighter.action.moveId) === 'spin540';
      if (!down && !visualHop) groundForgePose(rig, fighter.grounded);
    }
  });

  return (
    <>
      {characterId === 'glitch' && <GlitchSpriteEffects fighterId={fighterId} />}
      {characterId === 'vorgh' && <VorghEffects fighterId={fighterId} />}
      <group ref={outer}>
        <CharacterHeroFX fighterId={fighterId} kind={characterId} />
        {characterId === 'glitch' || characterId === 'vorgh'
          ? <ForgeHeroSkeleton build={build} ref={joints} />
          : <FighterSkeleton build={build} ref={joints} surfaces={surfaces} />}
      </group>
    </>
  );
}
