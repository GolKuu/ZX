import type { CharacterSelection } from '@/src/data/characterRoster';
import type { CombatEvent } from '@/src/sim';

/** Lightweight procedural SFX: no downloads and no nondeterministic game state. */
export class LuckySoundController {
  private context: AudioContext | null = null;

  public constructor(private readonly selection: CharacterSelection) {}

  public accept(events: readonly CombatEvent[]): void {
    for (const event of events) {
      if (event.type === 'moveStarted' && this.isLucky(event.fighterId)) {
        this.play(event.moveId.includes('enhanced') ? 660 : 420, 0.045, 'triangle');
      } else if (event.type === 'hit' && this.isLucky(event.attackerId)) {
        const cinematic = event.moveId.includes('super') || event.moveId.includes('ultimate');
        this.play(cinematic ? 110 : 170, cinematic ? 0.18 : 0.075, 'square');
      } else if (event.type === 'block' && this.isLucky(event.defenderId)) {
        this.play(880, 0.035, 'sine');
      }
    }
  }

  private isLucky(fighterId: string): boolean {
    if (fighterId === 'p1') return this.selection[0] === 'lucky';
    if (fighterId === 'p2') return this.selection[1] === 'lucky';
    return false;
  }

  private play(
    frequency: number,
    duration: number,
    type: OscillatorType,
  ): void {
    if (typeof window === 'undefined' || !('AudioContext' in window)) return;
    this.context ??= new AudioContext();
    if (this.context.state === 'suspended') void this.context.resume();
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(45, frequency * 0.52),
      now + duration,
    );
    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }
}
