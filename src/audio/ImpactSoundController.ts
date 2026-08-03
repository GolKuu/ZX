import type { CombatEvent } from '@/src/sim';

/** Short layered Web Audio transients keep every landed blow audible without assets. */
export class ImpactSoundController {
  private context: AudioContext | null = null;

  public accept(events: readonly CombatEvent[]): void {
    for (const event of events) {
      if (event.type === 'hit') this.play(event.damage);
    }
  }

  private play(damage: number): void {
    if (typeof window === 'undefined') return;
    this.context ??= new AudioContext();
    const context = this.context;
    const play = () => createImpact(context, damage);
    if (context.state === 'running') play();
    else void context.resume().then(play).catch(() => undefined);
  }
}

function createImpact(context: AudioContext, damage: number): void {
  const now = context.currentTime;
  const weight = Math.min(1, Math.max(0, (damage - 18) / 70));
  const duration = 0.07 + weight * 0.09;

  const body = context.createOscillator();
  const bodyGain = context.createGain();
  body.type = weight > 0.55 ? 'sawtooth' : 'triangle';
  body.frequency.setValueAtTime(105 - weight * 34, now);
  body.frequency.exponentialRampToValueAtTime(38, now + duration);
  bodyGain.gain.setValueAtTime(0.0001, now);
  bodyGain.gain.exponentialRampToValueAtTime(0.045 + weight * 0.055, now + 0.004);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  body.connect(bodyGain).connect(context.destination);
  body.start(now);
  body.stop(now + duration);

  const crack = context.createOscillator();
  const crackGain = context.createGain();
  crack.type = 'square';
  crack.frequency.setValueAtTime(760 + damage * 4, now);
  crack.frequency.exponentialRampToValueAtTime(180, now + 0.035);
  crackGain.gain.setValueAtTime(0.025 + weight * 0.025, now);
  crackGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
  crack.connect(crackGain).connect(context.destination);
  crack.start(now);
  crack.stop(now + 0.045);
}
