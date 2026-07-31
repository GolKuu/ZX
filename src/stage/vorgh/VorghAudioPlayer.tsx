'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { readCombatFighter } from '@/src/game/combatRuntime';
import { VORGH_SOUND_EVENTS, type VorghSoundKind } from './vorghSoundEvents';

export function VorghAudioPlayer({ fighterId }: {
  readonly fighterId: 'p1' | 'p2';
}) {
  const lastSerial = useRef(0);
  const audio = useRef<AudioContext | null>(null);

  useFrame(() => {
    const action = readCombatFighter(fighterId)?.action;
    if (action === null || action === undefined || action.serial === lastSerial.current) return;
    lastSerial.current = action.serial;
    const kind = VORGH_SOUND_EVENTS[action.moveId];
    if (kind === undefined || typeof window === 'undefined') return;
    const context = audio.current ?? new AudioContext();
    audio.current = context;
    if (context.state !== 'running') {
      void context.resume().then(() => play(context, kind));
    } else {
      play(context, kind);
    }
  });
  return null;
}

function play(context: AudioContext, kind: VorghSoundKind): void {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;
  const [start, end, volume, span] = profile(kind);
  oscillator.type = kind === 'roar' || kind === 'super' ? 'sawtooth' : 'square';
  oscillator.frequency.setValueAtTime(start, now);
  oscillator.frequency.exponentialRampToValueAtTime(end, now + span);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + span);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + span);
}

function profile(kind: VorghSoundKind): readonly [number, number, number, number] {
  if (kind === 'super') return [95, 32, 0.09, 0.42];
  if (kind === 'roar') return [130, 44, 0.07, 0.34];
  if (kind === 'impact') return [78, 40, 0.06, 0.13];
  if (kind === 'dash') return [420, 90, 0.035, 0.16];
  return [620, 150, 0.035, 0.09];
}
