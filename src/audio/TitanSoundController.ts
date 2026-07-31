import type { CharacterSelection } from '@/src/data/characterRoster';
import { TITAN_PRESENTATION } from '@/src/data/titan';
import type { CombatEvent } from '@/src/sim';

/** Tiny procedural sound bank: no downloaded binaries and no network calls. */
export class TitanSoundController {
  private context: AudioContext | null = null;

  public constructor(private readonly selection: CharacterSelection) {}

  public accept(events: readonly CombatEvent[]): void {
    for (const event of events) {
      if (event.type === 'moveStarted' && this.isTitan(event.fighterId)) {
        const presentation = TITAN_PRESENTATION[event.moveId];
        if (presentation !== undefined && presentation.sounds.length > 0) {
          this.pulse(
            presentation.sounds.includes('reactorPulse') ? 82 : 54,
            presentation.camera === 'cinematic' ? 0.34 : 0.16,
          );
        }
      } else if (event.type === 'grapple' && this.isTitan(event.attackerId)) {
        this.pulse(46, 0.2);
      } else if (
        event.type === 'armourAbsorbed'
        && this.isTitan(event.defenderId)
      ) {
        this.pulse(128, 0.08);
      }
    }
  }

  private isTitan(fighterId: string): boolean {
    if (fighterId === 'p1') return this.selection[0] === 'titan';
    if (fighterId === 'p2') return this.selection[1] === 'titan';
    return false;
  }

  private pulse(frequency: number, duration: number): void {
    const AudioContextClass = window.AudioContext;
    this.context ??= new AudioContextClass();
    const context = this.context;
    if (context.state === 'suspended') void context.resume();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(24, frequency * 0.55),
      context.currentTime + duration,
    );
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.075, context.currentTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + duration,
    );
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }
}
