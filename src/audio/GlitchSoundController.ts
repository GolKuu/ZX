import type { CharacterSelection } from '@/src/data/characterRoster';
import { GLITCH_MOVE_DEFINITIONS } from '@/src/data/glitch';
import type { CombatEvent } from '@/src/sim';

/** Procedural impact channel; startup cues remain attached to the sprite. */
export class GlitchSoundController {
  private context: AudioContext | null = null;

  public constructor(private readonly selection: CharacterSelection) {}

  public accept(events: readonly CombatEvent[]): void {
    for (const event of events) {
      if (event.type !== 'hit' || !this.isGlitch(event.attackerId)) continue;
      const cue = GLITCH_MOVE_DEFINITIONS.get(
        event.moveId,
      )?.presentation.impactSound;
      if (cue !== undefined) this.play(cue, event.damage);
    }
  }

  private isGlitch(fighterId: string): boolean {
    if (fighterId === 'p1') return this.selection[0] === 'glitch';
    if (fighterId === 'p2') return this.selection[1] === 'glitch';
    return false;
  }

  private play(cue: string, damage: number): void {
    if (typeof window === 'undefined' || !('AudioContext' in window)) return;
    this.context ??= new AudioContext();
    if (this.context.state === 'suspended') void this.context.resume();
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = damage >= 80 ? 'sawtooth' : 'square';
    oscillator.frequency.setValueAtTime(hashFrequency(cue), now);
    oscillator.frequency.exponentialRampToValueAtTime(68, now + 0.09);
    gain.gain.setValueAtTime(0.052, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.09);
  }
}

function hashFrequency(value: string): number {
  let hash = 0;
  for (const character of value) {
    hash = (hash * 33 + character.charCodeAt(0)) % 420;
  }
  return 180 + hash;
}
