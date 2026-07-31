import { GLITCH_MOVE_DEFINITIONS } from '@/src/data/glitch';

const COOLDOWN_MS = 55;
let lastPlayedAt = 0;

/**
 * Lightweight procedural SFX. No external binary dependency: every cue is a
 * short oscillator/noise-shaped spatial transient keyed by Move Data.
 */
export function playGlitchMoveSound(moveId: string): void {
  if (typeof window === 'undefined') return;
  const now = performance.now();
  if (now - lastPlayedAt < COOLDOWN_MS) return;
  lastPlayedAt = now;
  const definition = GLITCH_MOVE_DEFINITIONS.get(moveId);
  if (definition === undefined) return;
  playCue(definition.presentation.startupSound, definition.tags);
}

function playCue(cue: string, tags: readonly string[]): void {
  const AudioContextClass = window.AudioContext
    ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (AudioContextClass === undefined) return;
  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const enhanced = tags.includes('enhanced') || tags.includes('ultimate');
  const teleport = tags.includes('teleport');
  const duration = enhanced ? 0.16 : teleport ? 0.11 : 0.07;

  oscillator.type = teleport ? 'square' : enhanced ? 'sawtooth' : 'triangle';
  oscillator.frequency.setValueAtTime(frequencyFor(cue), context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    teleport ? 920 : enhanced ? 72 : 180,
    context.currentTime + duration,
  );
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.045, context.currentTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration);
  oscillator.addEventListener('ended', () => void context.close(), { once: true });
}

function frequencyFor(cue: string): number {
  let hash = 0;
  for (const char of cue) hash = (hash * 31 + char.charCodeAt(0)) % 540;
  return 240 + hash;
}
