'use client';

import { useEffect, useRef } from 'react';

export function FpsMeter() {
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frameId = 0;
    let frames = 0;
    let sampleStartedAt = performance.now();

    const measure = (now: number) => {
      frames += 1;
      const elapsed = now - sampleStartedAt;

      if (elapsed >= 500 && labelRef.current) {
        const fps = Math.round((frames * 1000) / elapsed);
        labelRef.current.textContent = `${fps} FPS`;
        labelRef.current.dataset.stable = String(fps >= 55);
        frames = 0;
        sampleStartedAt = now;
      }

      frameId = requestAnimationFrame(measure);
    };

    frameId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return <span ref={labelRef}>MEASURING</span>;
}
