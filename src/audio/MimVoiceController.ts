import type { CharacterSelection } from '@/src/data/characterRoster';
import {
  FIXED_SCALE,
  type CombatEvent,
  type WorldSnapshot,
} from '@/src/sim';
import {
  MIM_VOICE_LINES,
  type MimVoiceCategory,
} from './mimVoiceLines';

const DODGE_COOLDOWN_FRAMES = 5 * 60;
const TAUNT_COOLDOWN_FRAMES = 7 * 60;
const NEARBY_ATTACK_DISTANCE = 3.2 * FIXED_SCALE;

export class MimVoiceController {
  private readonly mimFighters = new Set<string>();
  private readonly whiffAttempts = new Map<string, boolean>();
  private readonly nextLine: Record<MimVoiceCategory, number> = {
    dodge: 0,
    taunt: 0,
    victory: 0,
  };
  private active: HTMLAudioElement | null = null;
  private lastDodgeFrame = Number.NEGATIVE_INFINITY;
  private lastTauntFrame = Number.NEGATIVE_INFINITY;
  private successfulHits = 0;

  public constructor(selection: CharacterSelection) {
    if (selection[0] === 'mim') this.mimFighters.add('p1');
    if (selection[1] === 'mim') this.mimFighters.add('p2');
  }

  public accept(world: WorldSnapshot, events: readonly CombatEvent[]): void {
    if (this.mimFighters.size === 0) return;
    for (const event of events) {
      if (event.type === 'moveStarted') {
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
    if (this.mimFighters.has(winnerId)) {
      this.play('victory', true);
    }
  }

  public reset(): void {
    this.whiffAttempts.clear();
    this.lastDodgeFrame = Number.NEGATIVE_INFINITY;
    this.lastTauntFrame = Number.NEGATIVE_INFINITY;
    this.successfulHits = 0;
    this.stopActive();
  }

  private trackAttack(world: WorldSnapshot, attackerId: string): void {
    const defenderId = attackerId === 'p1' ? 'p2' : 'p1';
    if (
      !this.mimFighters.has(defenderId)
      || !fightersAreNearby(world, attackerId, defenderId)
    ) {
      this.whiffAttempts.delete(attackerId);
      return;
    }
    this.whiffAttempts.set(attackerId, false);
  }

  private trackContact(attackerId: string, defenderId: string): void {
    if (
      this.mimFighters.has(defenderId)
      && this.whiffAttempts.has(attackerId)
    ) {
      this.whiffAttempts.set(attackerId, true);
    }
  }

  private maybeCallOutWhiff(attackerId: string, frame: number): void {
    const connected = this.whiffAttempts.get(attackerId);
    this.whiffAttempts.delete(attackerId);
    if (
      connected === false
      && frame - this.lastDodgeFrame >= DODGE_COOLDOWN_FRAMES
      && this.play('dodge')
    ) {
      this.lastDodgeFrame = frame;
    }
  }

  private maybeTaunt(attackerId: string, frame: number): void {
    if (!this.mimFighters.has(attackerId)) return;
    this.successfulHits += 1;
    if (
      this.successfulHits % 3 === 0
      && frame - this.lastTauntFrame >= TAUNT_COOLDOWN_FRAMES
      && this.play('taunt')
    ) {
      this.lastTauntFrame = frame;
    }
  }

  private play(category: MimVoiceCategory, interrupt = false): boolean {
    if (typeof window === 'undefined') return false;
    if (!interrupt && this.active !== null && !this.active.ended) return false;
    this.stopActive();

    const lines = MIM_VOICE_LINES[category];
    const index = this.nextLine[category] % lines.length;
    this.nextLine[category] += 1;
    const line = lines[index] ?? lines[0];
    const audio = new window.Audio(line.src);
    audio.preload = 'auto';
    audio.volume = 0.96;
    this.active = audio;
    audio.addEventListener('ended', () => {
      if (this.active === audio) this.active = null;
    }, { once: true });
    void audio.play().catch(() => {
      if (this.active === audio) this.active = null;
    });
    return true;
  }

  private stopActive(): void {
    this.active?.pause();
    this.active = null;
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
