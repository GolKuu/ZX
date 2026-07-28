import Phaser from 'phaser';
import type { CharacterDefinition } from '../../data/characters/circleFighters';
import type { FighterSnapshot, PlayerId } from '../../core/types';
import {
  resolveAnimationState,
  type AnimationContext,
} from '../animation/AnimationStateResolver';
import type { AnimationStateId } from '../animation/AnimationCatalog';
import { AttackVisualRenderer } from '../effects/AttackVisualRenderer';
import { DefenseEffectRenderer } from '../effects/DefenseEffectRenderer';
import { MotionTrailRenderer } from '../effects/MotionTrailRenderer';
import { createCharacterBody } from './CharacterBodyFactory';
import { findCharacterAttack } from '../../data/attacks/characterAttacks';
import { RIG_RESTING_BOTTOM } from '../animation/RigTypes';

export class FighterRenderer {
  readonly container: Phaser.GameObjects.Container;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly facingContainer: Phaser.GameObjects.Container;
  private readonly rig: ReturnType<typeof createCharacterBody>;
  private readonly attackVisual: AttackVisualRenderer;
  private readonly defenseVisual: DefenseEffectRenderer;
  private readonly trail: MotionTrailRenderer;
  private animationTick = 0;
  private state: AnimationStateId = 'idle';

  constructor(scene: Phaser.Scene, ownerId: PlayerId, character: CharacterDefinition) {
    this.shadow = scene.add.ellipse(0, 38, 96, 20, character.shadowColor, 0.25);
    this.rig = createCharacterBody(scene, character);
    this.facingContainer = scene.add.container(0, 38 - RIG_RESTING_BOTTOM, [this.rig.root]);
    this.defenseVisual = new DefenseEffectRenderer(scene);
    this.attackVisual = new AttackVisualRenderer(scene, ownerId, character);
    this.trail = new MotionTrailRenderer(scene, character);
    this.container = scene.add.container(0, 0, [
      this.trail.graphics,
      this.shadow,
      this.defenseVisual.graphics,
      this.facingContainer,
      this.attackVisual.graphics,
    ]);
  }

  sync(snapshot: FighterSnapshot, context: AnimationContext, stopped = false) {
    const nextState = resolveAnimationState(snapshot, context);
    if (nextState !== this.state) this.animationTick = 0;
    this.state = nextState;
    const attack = snapshot.attack
      ? findCharacterAttack(snapshot.characterId, snapshot.attack.id)
      : null;
    if (!stopped) this.animationTick += 1;
    this.container.setPosition(snapshot.x, snapshot.y - 38);
    this.facingContainer.setScale(snapshot.facing, 1);
    this.rig.sync({
      state: this.state,
      tick: this.animationTick,
      phase: snapshot.attack?.phase ?? null,
      motion: attack?.motion ?? null,
      stopped,
    });
    const stunned = snapshot.mode === 'hitstun' || snapshot.mode === 'blockstun';
    this.rig.setAlpha(stunned ? 0.72 : snapshot.mode === 'wakeup' ? 0.85 : 1);
    this.shadow.setScale(snapshot.grounded ? 1 : 0.62);
    this.shadow.setAlpha(snapshot.grounded ? 0.25 : 0.14);
    this.defenseVisual.sync(snapshot);
    this.trail.sync(snapshot, this.state);
    this.attackVisual.sync(snapshot);
  }

  currentAnimationState() {
    return this.state;
  }

  destroy() {
    this.container.destroy(true);
  }
}
