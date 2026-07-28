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
  private readonly useDomArt: boolean;
  private readonly attackVisual: AttackVisualRenderer;
  private readonly defenseVisual: DefenseEffectRenderer;
  private readonly trail: MotionTrailRenderer;
  private sprite?: Phaser.GameObjects.Image;
  readonly characterId: string;
  private animationTick = 0;
  private state: AnimationStateId = 'idle';

  constructor(scene: Phaser.Scene, ownerId: PlayerId, character: CharacterDefinition) {
    this.characterId = character.id;
    this.useDomArt = character.visualModel?.type === 'final-original';
    this.shadow = scene.add.ellipse(0, 38, 96, 20, character.shadowColor, this.useDomArt ? 0.12 : 0.25).setDepth(1);
    this.rig = this.useDomArt ? ({ root: scene.add.container() } as any) : createCharacterBody(scene, character);
    this.facingContainer = scene.add.container(0, 38 - RIG_RESTING_BOTTOM, [this.rig.root]).setDepth(3);
    this.defenseVisual = new DefenseEffectRenderer(scene);
    this.attackVisual = new AttackVisualRenderer(scene, ownerId, character);
    this.trail = new MotionTrailRenderer(scene, character);
    this.container = scene.add.container(0, 0, [
      this.trail.graphics,
      this.shadow,
      this.defenseVisual.graphics,
      this.facingContainer,
      this.attackVisual.graphics,
    ]).setDepth(2);

    // if a Phaser texture already exists for this character, create sprite art
    const key = `character-art-${character.id}`;
    if (this.useDomArt && scene.textures.exists(key)) this.applySpriteTexture(key);
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
    if (!this.useDomArt) {
      this.rig.sync({
        state: this.state,
        tick: this.animationTick,
        phase: snapshot.attack?.phase ?? null,
        motion: attack?.motion ?? null,
        stopped,
      });
    }
    const stunned = snapshot.mode === 'hitstun' || snapshot.mode === 'blockstun';
    if (!this.useDomArt) this.rig.setAlpha(stunned ? 0.72 : snapshot.mode === 'wakeup' ? 0.85 : 1);
    this.shadow.setScale(snapshot.grounded ? 1 : 0.62);
    this.shadow.setAlpha(snapshot.grounded ? 0.25 : 0.14);
    this.defenseVisual.sync(snapshot);
    this.trail.sync(snapshot, this.state);
    this.attackVisual.sync(snapshot);
    // if we have a sprite, keep it aligned
    if (this.sprite) {
      this.sprite.setPosition(snapshot.x, snapshot.y - 38);
      this.sprite.setFlipX(snapshot.facing === -1);
    }
  }

  currentAnimationState() {
    return this.state;
  }

  destroy() {
    if (this.sprite) this.sprite.destroy();
    this.container.destroy(true);
  }

  applySpriteTexture(key: string) {
    if (this.sprite) return;
    const scene = this.container.scene;
    // create torso sprite; we'll keep arms/legs procedural
    this.sprite = scene.add.image(0, -10, key).setOrigin(0.5, 0.44).setDepth(4);
    this.sprite.setScale(0.5); // initial scale; tuned at runtime
    // hide only the procedural torso if API available
    try {
      this.rig.setTorsoVisible?.(false as any);
    } catch (e) {
      this.facingContainer.setVisible(false);
    }
  }
}
