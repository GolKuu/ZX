import type { CharacterSelection } from '@/src/data/characterRoster';
import { TAUNT_MOVE_ID } from '@/src/data/taunt-move';
import {
  FIXED_SCALE,
  type CombatEvent,
  type WorldSnapshot,
} from '@/src/sim';
import {
  hasVoiceProfile,
  type VoicedCharacterId,
} from './fighterVoiceProfiles';
import { VoicePlayer } from './VoicePlayer';

const DODGE_COOLDOWN_FRAMES = 5 * 60;
const TAUNT_COOLDOWN_FRAMES = 7 * 60;
const NEARBY_ATTACK_DISTANCE = 3.2 * FIXED_SCALE;
const FIRST_PLAYER_ID = 'p1';
const SECOND_PLAYER_ID = 'p2';

export class FighterVoiceController {
  private readonly voicedFighters = new Map<string, VoicedCharacterId>();
  private readonly whiffAttempts = new Map<string, boolean>();
  private readonly lastDodgeFrame = new Map<string, number>();
  private readonly lastTauntFrame = new Map<string, number>();
  private readonly successfulHits = new Map<string, number>();
  private readonly player = new VoicePlayer();

  public constructor(selection: CharacterSelection) {
    this.addFighter(FIRST_PLAYER_ID, selection[0]);
    this.addFighter(SECOND_PLAYER_ID, selection[1]);
  }

  public accept(world: WorldSnapshot, events: readonly CombatEvent[]): void {
    if (this.voicedFighters.size === 0) return;
    for (const event of events) {
      if (event.type === 'moveStarted') {
        if (event.moveId === TAUNT_MOVE_ID) {
          this.taunt(event.fighterId, event.frame);
          continue;
        }
        this.trackAttack(world, event.fighterId);
        continue;
      }
      if (event.type === 'hit' || event.type === 'block') {
        this.trackContact(event.attackerId, event.defenderId);
        if (event.type === 'hit') {
          this.maybeTaunt(event.attackerId, event.frame);
        }
        continue;
      }
      if (event.type === 'moveEnded') {
        this.maybeCallOutWhiff(event.fighterId, event.frame);
      }
    }
  }

  public celebrate(winnerId: string): void {
    const characterId = this.voicedFighters.get(winnerId);
    if (characterId !== undefined) {
      this.player.play(winnerId, characterId, 'victory', true);
    }
  }

  public reset(): void {
    this.whiffAttempts.clear();
    this.lastDodgeFrame.clear();
    this.lastTauntFrame.clear();
    this.successfulHits.clear();
    this.player.stop();
  }

  private trackAttack(world: WorldSnapshot, attackerId: string): void {
    const defenderId = opposingFighter(attackerId);
    if (
      !this.voicedFighters.has(defenderId)
      || !fightersAreNearby(world, attackerId, defenderId)
    ) {
      this.whiffAttempts.delete(attackerId);
      return;
    }
    this.whiffAttempts.set(attackerId, false);
  }

  private trackContact(attackerId: string, defenderId: string): void {
    if (
      this.voicedFighters.has(defenderId)
      && this.whiffAttempts.has(attackerId)
    ) {
      this.whiffAttempts.set(attackerId, true);
    }
  }

  private maybeCallOutWhiff(attackerId: string, frame: number): void {
    const connected = this.whiffAttempts.get(attackerId);
    this.whiffAttempts.delete(attackerId);
    const defenderId = opposingFighter(attackerId);
    const lastFrame = this.lastDodgeFrame.get(defenderId)
      ?? Number.NEGATIVE_INFINITY;
    if (
      connected === false
      && frame - lastFrame >= DODGE_COOLDOWN_FRAMES
      && this.play(defenderId, 'dodge')
    ) {
      this.lastDodgeFrame.set(defenderId, frame);
    }
  }

  /** The taunt button: the line plays on demand, still on its own cooldown. */
  private taunt(fighterId: string, frame: number): void {
    const lastFrame = this.lastTauntFrame.get(fighterId)
      ?? Number.NEGATIVE_INFINITY;
    if (
      frame - lastFrame >= TAUNT_COOLDOWN_FRAMES
      && this.play(fighterId, 'taunt')
    ) {
      this.lastTauntFrame.set(fighterId, frame);
    }
  }

  private maybeTaunt(attackerId: string, frame: number): void {
    if (!this.voicedFighters.has(attackerId)) return;
    const hitCount = (this.successfulHits.get(attackerId) ?? 0) + 1;
    this.successfulHits.set(attackerId, hitCount);
    const lastFrame = this.lastTauntFrame.get(attackerId)
      ?? Number.NEGATIVE_INFINITY;
    if (
      hitCount % 3 === 0
      && frame - lastFrame >= TAUNT_COOLDOWN_FRAMES
      && this.play(attackerId, 'taunt')
    ) {
      this.lastTauntFrame.set(attackerId, frame);
    }
  }

  private play(
    fighterId: string,
    category: 'dodge' | 'taunt',
  ): boolean {
    const characterId = this.voicedFighters.get(fighterId);
    return characterId !== undefined
      && this.player.play(fighterId, characterId, category);
  }

  private addFighter(
    fighterId: string,
    characterId: CharacterSelection[number],
  ): void {
    if (hasVoiceProfile(characterId)) {
      this.voicedFighters.set(fighterId, characterId);
    }
  }

}

function fightersAreNearby(
  world: WorldSnapshot,
  attackerId: string,
  defenderId: string,
): boolean {
  const attacker = world.fighters.find((fighter) => fighter.id === attackerId);
  const defender = world.fighters.find((fighter) => fighter.id === defenderId);
  if (attacker === undefined || defender === undefined) return false;
  return Math.abs(attacker.position.x - defender.position.x)
    <= NEARBY_ATTACK_DISTANCE;
}

function opposingFighter(fighterId: string): string {
  return fighterId === FIRST_PLAYER_ID ? SECOND_PLAYER_ID : FIRST_PLAYER_ID;
}
