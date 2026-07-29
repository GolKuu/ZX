'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

const WARMUP_SECONDS = 2;
const SAMPLE_SECONDS = 10;
const SLOW_FRAME_SECONDS = 1 / 55;

type FrameSample = {
  deltas: number[];
  elapsed: number;
  reported: boolean;
};

function percentile(values: readonly number[], ratio: number) {
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * ratio));
  return sorted[index] ?? 0;
}

export function FrameProfiler() {
  const enabledRef = useRef(false);
  const sampleRef = useRef<FrameSample>({ deltas: [], elapsed: 0, reported: false });

  useEffect(() => {
    enabledRef.current = new URLSearchParams(window.location.search).get('profile') === '1';
  }, []);

  useFrame((_, delta) => {
    if (!enabledRef.current) return;

    const sample = sampleRef.current;
    sample.elapsed += delta;
    if (sample.elapsed <= WARMUP_SECONDS || sample.reported) return;

    sample.deltas.push(delta);
    if (sample.elapsed < WARMUP_SECONDS + SAMPLE_SECONDS) return;

    const measuredSeconds = sample.deltas.reduce((total, value) => total + value, 0);
    const report = {
      averageFps: Number((sample.deltas.length / measuredSeconds).toFixed(1)),
      p95FrameMs: Number((percentile(sample.deltas, 0.95) * 1_000).toFixed(1)),
      sampleFrames: sample.deltas.length,
      slowFramePercent: Number((
        sample.deltas.filter((value) => value > SLOW_FRAME_SECONDS).length /
        sample.deltas.length *
        100
      ).toFixed(1)),
    };

    sample.reported = true;
    document.documentElement.dataset.ccuProfile = JSON.stringify(report);
    console.info(`CCU_PERFORMANCE ${JSON.stringify(report)}`);
  });

  return null;
}
