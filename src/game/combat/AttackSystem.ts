import { CollisionSystem } from '../core/CollisionSystem';
import { FighterStateMachine } from '../core/FighterStateMachine';
import type { FighterSnapshot, PlayerInputFrame } from '../core/types';
import { AttackSelector } from './AttackSelector';
import { EnergyComponent } from './EnergyComponent';
import type { AttackDefinition } from './AttackDefinition';
import { CharacterPassiveSystem } from './CharacterPassiveSystem';
import { setDefenseEffect } from './DefenseState';

export type AttackContact = {
  definition: AttackDefinition;
  hitboxIndex: number;
};

export class AttackSystem {
  private readonly collision = new CollisionSystem();
  private readonly energy = new EnergyComponent();
  private readonly states = new FighterStateMachine();
  private readonly selector: AttackSelector;
  private readonly passive = new CharacterPassiveSystem();

  constructor() {
    this.selector = new AttackSelector();
  }

  prepare(fighter: FighterSnapshot, input: PlayerInputFrame) {
    const requested = this.selector.select(fighter, input);
    if (requested && this.canStart(fighter, requested)) {
      this.start(fighter, requested, input.pressed.includes('PERFECT_REVERSAL'));
    }
    const definition = this.currentDefinition(fighter);
    if (!definition || !fighter.attack) return;

    fighter.attack.phase = this.phaseAt(definition, fighter.attack.frame);
    fighter.mode =
      fighter.attack.phase === 'startup'
        ? 'attackStartup'
        : fighter.attack.phase === 'active'
          ? 'attackActive'
          : 'attackRecovery';
    const movement = definition.movementTimeline.find(
      (entry) => entry.frame === fighter.attack?.frame,
    );
    if (movement) {
      fighter.velocityX = movement.velocityX * fighter.facing;
      fighter.velocityY = -movement.velocityY;
    }
  }

  findContact(attacker: FighterSnapshot, defender: FighterSnapshot): AttackContact | null {
    const runtime = attacker.attack;
    const definition = this.currentDefinition(attacker);
    if (!runtime || !definition || runtime.phase !== 'active') return null;
    const hurtbox = this.collision.getHurtbox(defender);

    for (const [index, hitbox] of definition.hitboxes.entries()) {
      if (runtime.hitHitboxes.includes(index)) continue;
      if (runtime.frame < hitbox.startFrame || runtime.frame > hitbox.endFrame) continue;
      if (!this.collision.overlaps(this.collision.getHitbox(attacker, hitbox), hurtbox)) continue;
      runtime.hitHitboxes.push(index);
      runtime.connected = true;
      return { definition, hitboxIndex: index };
    }
    return null;
  }

  finishTick(fighter: FighterSnapshot) {
    const runtime = fighter.attack;
    const definition = this.currentDefinition(fighter);
    if (!runtime || !definition) return;
    runtime.frame += 1;
    const total = definition.startupFrames + definition.activeFrames + definition.recoveryFrames;
    if (runtime.frame < total) return;
    const finishedDash = fighter.characterId === 'shira' && definition.id.includes('dash');
    if (finishedDash) {
      fighter.vulnerableTicksRemaining = runtime.connected ? 0 : 14;
      fighter.dashTicksRemaining = 0;
    }
    fighter.attack = null;
    fighter.velocityX = 0;
    if (fighter.mode.startsWith('attack')) {
      fighter.mode = fighter.grounded ? 'idle' : 'jumping';
    }
  }

  currentDefinition(fighter: FighterSnapshot) {
    return this.selector.find(fighter);
  }

  private canStart(fighter: FighterSnapshot, requested: AttackDefinition) {
    if (!fighter.attack) {
      const wakeupReversal =
        requested.action === 'MOMENTUM_REVERSAL' &&
        fighter.mode === 'wakeup' &&
        fighter.modeTicksRemaining <= 1;
      return (this.states.canStartAttack(fighter) || wakeupReversal) &&
        this.energy.canSpend(fighter, requested.energyCost);
    }
    const current = this.currentDefinition(fighter);
    if (!current) return false;
    return current.cancelWindows.some(
      (window) =>
        fighter.attack &&
        fighter.attack.frame >= window.startFrame &&
        fighter.attack.frame <= window.endFrame &&
        window.into.includes(requested.category) &&
        (!window.onHitOnly || fighter.attack.connected),
    ) && this.energy.canSpend(fighter, requested.energyCost);
  }

  private start(
    fighter: FighterSnapshot,
    definition: AttackDefinition,
    perfectReversal = false,
  ) {
    if (!this.energy.spend(fighter, definition.energyCost)) return;
    if (perfectReversal) {
      this.energy.gain(fighter, 15);
      setDefenseEffect(fighter, 'perfect-reversal');
    }
    fighter.velocityX = 0;
    fighter.attack = {
      id: definition.id,
      frame: 0,
      phase: 'startup',
      hitHitboxes: [],
      connected: false,
    };
    fighter.guard = null;
    fighter.mode = 'attackStartup';
    this.passive.spendEnhanced(fighter, definition);
  }

  private phaseAt(definition: AttackDefinition, frame: number) {
    if (frame < definition.startupFrames) return 'startup' as const;
    if (frame < definition.startupFrames + definition.activeFrames) return 'active' as const;
    return 'recovery' as const;
  }
}
