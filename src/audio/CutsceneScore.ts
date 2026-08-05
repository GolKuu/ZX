import type { ShotCue } from '@/src/story/film';

/**
 * The story cutscene's score, synthesised in the browser.
 *
 * Same rule as every other sound in this project: nothing is downloaded. A
 * sustained bed runs under the whole scene and each cut adds one gesture on top
 * — a tick on a cut, a swell into a line, a hit on an impact. Silence is a cue
 * too, so `hush` ducks the bed instead of adding to it.
 */
export class CutsceneScore {
  private context: AudioContext | null = null;
  private bed: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private muted = false;

  public cue(cue: ShotCue): void {
    const context = this.ensure();
    if (context === null) return;
    const now = context.currentTime;
    if (cue === 'drone') this.duck(0.05, 1.4);
    else if (cue === 'hush') this.duck(0.012, 0.8);
    else if (cue === 'tick') this.tick(context, now);
    else if (cue === 'swell') this.swell(context, now);
    else this.impact(context, now);
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    const context = this.context;
    if (context === null || this.bed === null) return;
    this.bed.gain.cancelScheduledValues(context.currentTime);
    this.bed.gain.linearRampToValueAtTime(muted ? 0 : 0.04, context.currentTime + 0.3);
  }

  public stop(): void {
    const context = this.context;
    if (context === null) return;
    this.context = null;
    this.bed = null;
    void context.close().catch(() => undefined);
  }

  /** Builds the context and the bed on the first cue, never before. */
  private ensure(): AudioContext | null {
    if (this.muted) return null;
    if (this.context !== null) return this.context;
    if (typeof window === 'undefined' || !('AudioContext' in window)) return null;
    const context = new AudioContext();
    if (context.state === 'suspended') void context.resume();
    this.context = context;
    this.bed = context.createGain();
    this.bed.gain.setValueAtTime(0.0001, context.currentTime);
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(340, context.currentTime);
    this.bed.connect(filter).connect(context.destination);
    for (const [frequency, detune] of [[55, -6], [82.5, 7], [110, 3]] as const) {
      const voice = context.createOscillator();
      voice.type = 'sawtooth';
      voice.frequency.setValueAtTime(frequency, context.currentTime);
      voice.detune.setValueAtTime(detune, context.currentTime);
      voice.connect(this.bed);
      voice.start();
    }
    return context;
  }

  private duck(target: number, seconds: number): void {
    const context = this.context;
    if (context === null || this.bed === null || this.muted) return;
    this.bed.gain.cancelScheduledValues(context.currentTime);
    this.bed.gain.linearRampToValueAtTime(target, context.currentTime + seconds);
  }

  /** A cut: one dry blip, so the eye and the ear land on the same frame. */
  private tick(context: AudioContext, now: number): void {
    const voice = context.createOscillator();
    const gain = context.createGain();
    voice.type = 'triangle';
    voice.frequency.setValueAtTime(1_240, now);
    voice.frequency.exponentialRampToValueAtTime(640, now + 0.07);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.03, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    voice.connect(gain).connect(context.destination);
    voice.start(now);
    voice.stop(now + 0.1);
  }

  /** A line worth leaning into: air rising underneath it. */
  private swell(context: AudioContext, now: number): void {
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = this.noiseBuffer(context);
    source.loop = true;
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(220, now);
    filter.frequency.exponentialRampToValueAtTime(1_800, now + 1.3);
    filter.Q.setValueAtTime(1.4, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 1.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.7);
    source.connect(filter).connect(gain).connect(context.destination);
    source.start(now);
    source.stop(now + 1.75);
  }

  /** A hit: low body plus a short burst of air. */
  private impact(context: AudioContext, now: number): void {
    const body = context.createOscillator();
    const bodyGain = context.createGain();
    body.type = 'sine';
    body.frequency.setValueAtTime(96, now);
    body.frequency.exponentialRampToValueAtTime(34, now + 0.32);
    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.11, now + 0.01);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    body.connect(bodyGain).connect(context.destination);
    body.start(now);
    body.stop(now + 0.42);

    const air = context.createBufferSource();
    const airGain = context.createGain();
    air.buffer = this.noiseBuffer(context);
    airGain.gain.setValueAtTime(0.05, now);
    airGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
    air.connect(airGain).connect(context.destination);
    air.start(now);
    air.stop(now + 0.3);
  }

  private noiseBuffer(context: AudioContext): AudioBuffer {
    if (this.noise !== null) return this.noise;
    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let index = 0; index < samples.length; index += 1) {
      samples[index] = Math.random() * 2 - 1;
    }
    this.noise = buffer;
    return buffer;
  }
}
