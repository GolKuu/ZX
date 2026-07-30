import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useHudStore } from '@/src/store/hudStore';
import { useRenderStore } from '@/src/store/renderStore';
import styles from './AaaVisualJudge.module.css';

type CapturePhase =
  | 'main-menu'
  | 'character-select'
  | 'match-start'
  | 'neutral-gameplay'
  | 'combo'
  | 'super'
  | 'victory';

interface FrameAnalysis {
  readonly phase: CapturePhase;
  readonly reason: string;
  readonly time: number;
  readonly imageUrl: string;
  readonly overall: number;
  readonly categories: Readonly<Record<Category, number>>;
  readonly findings: readonly string[];
  readonly strengths: readonly string[];
}

type Category = 'character' | 'animation' | 'arena' | 'lighting' | 'shader'
  | 'vfx' | 'ui' | 'presentation' | 'spectacle';

const COOLDOWN_MS: Record<CapturePhase, number> = {
  'main-menu': 7000,
  'character-select': 5000,
  'match-start': 4500,
  'neutral-gameplay': 3200,
  'combo': 900,
  'super': 900,
  'victory': 8000,
};

const SAMPLE_SCALE = 0.35;
const TARGET_LONG_EDGE = 360;
const MAX_UI_LOG = 16;

const PHASE_TARGETS: Record<CapturePhase, Record<Category, number>> = {
  'main-menu': {
    character: 66,
    animation: 52,
    arena: 72,
    lighting: 78,
    shader: 74,
    vfx: 70,
    ui: 86,
    presentation: 84,
    spectacle: 78,
  },
  'character-select': {
    character: 62,
    animation: 54,
    arena: 68,
    lighting: 76,
    shader: 78,
    vfx: 72,
    ui: 88,
    presentation: 86,
    spectacle: 80,
  },
  'match-start': {
    character: 78,
    animation: 66,
    arena: 84,
    lighting: 86,
    shader: 84,
    vfx: 84,
    ui: 84,
    presentation: 88,
    spectacle: 82,
  },
  'neutral-gameplay': {
    character: 84,
    animation: 82,
    arena: 86,
    lighting: 88,
    shader: 86,
    vfx: 82,
    ui: 82,
    presentation: 90,
    spectacle: 88,
  },
  'combo': {
    character: 86,
    animation: 88,
    arena: 86,
    lighting: 88,
    shader: 88,
    vfx: 92,
    ui: 64,
    presentation: 92,
    spectacle: 90,
  },
  'super': {
    character: 88,
    animation: 92,
    arena: 90,
    lighting: 94,
    shader: 94,
    vfx: 95,
    ui: 70,
    presentation: 96,
    spectacle: 94,
  },
  'victory': {
    character: 84,
    animation: 80,
    arena: 86,
    lighting: 90,
    shader: 90,
    vfx: 88,
    ui: 82,
    presentation: 92,
    spectacle: 90,
  },
};

export function AaaVisualJudge() {
  const screen = useHudStore((state) => state.screen);
  const snapshot = useHudStore((state) => state.snapshot);
  const superVersion = useRenderStore((state) =>
    state.mimSuperVersion
    + state.echoSuperVersion
    + state.chronoSuperVersion
    + state.glitchSuperVersion,
  );

  const [samples, setSamples] = useState<Partial<Record<CapturePhase, FrameAnalysis>>>({});
  const [log, setLog] = useState<string[]>([]);
  const [open, setOpen] = useState(true);

  const previousScreen = useRef(screen);
  const lastCaptureAt = useRef<Record<CapturePhase, number>>({
    'main-menu': 0,
    'character-select': 0,
    'match-start': 0,
    'neutral-gameplay': 0,
    'combo': 0,
    'super': 0,
    'victory': 0,
  });
  const lastComboKey = useRef('');
  const lastSuperVersion = useRef(superVersion);
  const previousImage = useRef<Uint8ClampedArray | null>(null);
  const previousImageMeta = useRef({ width: 0, height: 0 });
  const hasCaptured = useRef(false);

  const overall = useMemo(() => {
    const recorded = Object.values(samples).filter(
      (sample): sample is FrameAnalysis => sample !== undefined,
    );
    if (recorded.length === 0) return null;
    const sum = recorded.reduce((acc, sample) => acc + sample.overall, 0);
    return Math.round((sum / recorded.length) * 10) / 10;
  }, [samples]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const now = Date.now();
    const prev = previousScreen.current;
    const pending: Array<{ phase: CapturePhase; reason: string }> = [];
    if (!hasCaptured.current && screen === 'mode') {
      pending.push({ phase: 'main-menu', reason: 'Initial menu bootstrap' });
    }

    if (screen === 'mode' && prev !== 'mode') {
      pending.push({ phase: 'main-menu', reason: 'Main menu is active' });
    } else if (screen === 'character' && prev !== 'character') {
      pending.push({ phase: 'character-select', reason: 'Character select displayed' });
    } else if (screen === 'versus' && prev !== 'versus') {
      pending.push({ phase: 'match-start', reason: 'Round intro / versus flow' });
    } else if (screen === 'result' && prev !== 'result') {
      pending.push({ phase: 'victory', reason: 'Round/result screen' });
    }

    if (screen === 'fight') {
      if (prev === 'versus' || prev === 'character') {
        pending.push({ phase: 'neutral-gameplay', reason: 'Gameplay controls regained' });
      }

      const combo = snapshot.combo;
      if (combo !== null && combo.hits >= 2) {
        const comboKey = `${combo.attackerId}:${combo.hits}`;
        if (comboKey !== lastComboKey.current) {
          lastComboKey.current = comboKey;
          pending.push({ phase: 'combo', reason: `Combo ${combo.hits}H ${combo.damage} dmg` });
        }
      } else if (combo === null || combo.hits === 0) {
        lastComboKey.current = '';
      }

      if (superVersion !== lastSuperVersion.current) {
        lastSuperVersion.current = superVersion;
        pending.push({ phase: 'super', reason: 'Super phase start' });
      }

      if (
        now - lastCaptureAt.current['neutral-gameplay'] > 3200
        && snapshot.frame % 4 === 0
      ) {
        pending.push({ phase: 'neutral-gameplay', reason: 'Continuous gameplay read-check' });
      }
    }

    previousScreen.current = screen;

    for (const capture of pending) {
      maybeCapture(capture.phase, capture.reason);
    }

    function maybeCapture(phase: CapturePhase, reason: string) {
      if (now - lastCaptureAt.current[phase] < COOLDOWN_MS[phase]) return;
      lastCaptureAt.current[phase] = now;

      const frame = captureCanvas();
      if (frame === null) return;

      const analysis = evaluateFrame(
        frame,
        { width: previousImageMeta.current.width, height: previousImageMeta.current.height, data: previousImage.current },
        phase,
      );
      previousImage.current = frame.pixels;
      previousImageMeta.current = { width: frame.width, height: frame.height };

      const analysisWithMeta: FrameAnalysis = {
        ...analysis,
        phase,
        reason,
        time: now,
        imageUrl: frame.url,
      };

      setSamples((current) => ({
        ...current,
        [phase]: analysisWithMeta,
      }));
      setLog((current) => {
        const next = [
          `[${phase.toUpperCase()}] ${analysisWithMeta.overall}/100 - ${analysisWithMeta.findings[0] ?? 'No show-stopper found'}`,
          ...current,
        ];
        return next.slice(0, MAX_UI_LOG);
      });
      hasCaptured.current = true;
    }
  }, [screen, snapshot.combo, snapshot.frame, superVersion]);

  return (
    <aside className={styles.judgeRoot} aria-label="AAA Visual Judge">
      <header className={styles.header}>
        <button type="button" onClick={() => setOpen((value) => !value)}>
          AAA Judge
          <small>{open ? 'Collapse' : 'Expand'}</small>
        </button>
        {overall !== null && <strong>Overall: {overall}/100</strong>}
      </header>
      {open && (
        <section className={styles.content}>
          <p className={styles.goal}>
            Reference target: Guilty Gear Strive / Dragon Ball FighterZ / Naruto Storm / SF6 / Tekken8.
          </p>
          <ul className={styles.phaseList}>
            {(Object.entries(samples) as Array<[CapturePhase, FrameAnalysis]>)
              .map((item) => item)
              .sort((left, right) => right[1].time - left[1].time)
              .slice(0, 7)
              .map(([phase, sample]) => (
                <li key={`${phase}-${sample.time}`}>
                  <div className={styles.phaseHeader}>
                    <span>{phase}</span>
                    <b>{sample.overall}/100</b>
                  </div>
                  <div className={styles.categoryRow}>
                    {Object.entries(sample.categories).map(([category, score]) => (
                      <i
                        data-low={score < 60}
                        key={category}
                        title={`${category}: ${score}`}
                      >
                        {category[0].toUpperCase()}
                        <u>{score}</u>
                      </i>
                    ))}
                  </div>
                  {/* Captures are short-lived canvas data URLs and cannot use the Next image optimizer. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sample.imageUrl} alt={`${phase} visual capture`} />
                  <p>
                    <strong>{sample.findings[0]}</strong>
                    {' '}
                    {sample.findings[1] !== undefined ? sample.findings[1] : null}
                  </p>
                  {sample.strengths.length > 0 && (
                    <p className={styles.good}>{sample.strengths[0]}</p>
                  )}
                </li>
              ))}
          </ul>
          <div className={styles.logWrap}>
            <h3>Brutal critique stream</h3>
            <ul>
              {log.length === 0 ? (
                <li>No auto-analysis yet. Start a match.</li>
              ) : (
                log.map((entry) => <li key={entry}>{entry}</li>)
              )}
            </ul>
          </div>
        </section>
      )}
    </aside>
  );
}

function captureCanvas() {
  const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
  if (canvas === null) return null;

  const width = Math.max(1, Math.min(TARGET_LONG_EDGE, Math.floor(canvas.width * SAMPLE_SCALE)));
  const height = Math.max(1, Math.floor(canvas.height * (width / canvas.width)));
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const ctx = offscreen.getContext('2d', { willReadFrequently: true });
  if (ctx === null) return null;

  ctx.drawImage(canvas, 0, 0, width, height);
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const url = offscreen.toDataURL('image/jpeg', 0.5);
  return { width, height, pixels, url };
}

function evaluateFrame(
  frame: { width: number; height: number; pixels: Uint8ClampedArray; },
  previous: { width: number; height: number; data: Uint8ClampedArray | null; },
  phase: CapturePhase,
): Omit<FrameAnalysis, 'time' | 'phase' | 'reason' | 'imageUrl'> {
  const { width, height } = frame;
  const {
    lumaMin,
    lumaMax,
    lumaMean,
    lumaStd,
    saturationMean,
    saturationStd,
    entropy,
    edgeDensity,
    dominantShare,
    motionDelta,
    zFightScore: zFightRawScore,
  } = analyzePixels(frame.pixels, width, height, previous);

  const spread = (lumaMax - lumaMin) / 255;
  const contrastScore = clamp(Math.round(spread * 100));
  const saturationScore = clamp(Math.round(saturationMean * 120));
  const entropyScore = clamp(Math.round(entropy * 110));
  const edgeScore = clamp(Math.round(edgeDensity * 220));
  const motionScore = clamp(Math.round(motionDelta * 120));
  const dominancePenalty = clamp(Math.round((dominantShare - 0.34) * 180), 0);
  const bandingScore = clamp(Math.round(Math.max(0, (dominantShare - 0.2) * 260)));
  const aliasingScore = clamp(
    Math.round(Math.max(0, 78 - edgeScore) + Math.max(0, 86 - entropyScore)),
  );
  const readabilityScore = clamp(
    Math.round((contrastScore * 0.58) + (lightingScore(shadowToLuma(spread)) * 0.42)),
  );
  const zFightScore = clamp(
    Math.round((dominancePenalty * 0.82) + (aliasingScore * 0.18) + (zFightRawScore * 0.32)),
  );
  const motionReadability = clamp(
    Math.round(
      (motionScore * 1.5) + (contrastScore * 0.38) - (aliasingScore * 0.28),
    ),
  );

  const character = clamp(
    Math.round(
      (contrastScore * 0.46)
      + (edgeScore * 0.38)
      + (saturationScore * 0.16)
      - dominancePenalty * 0.42,
    ),
  );
  const animation = clamp(
    Math.round(
      (motionScore * 0.62)
      + motionReadability * 0.18
      + (lumaStd * 0.85)
      + Math.min(100, saturationStd * 80)
      + (phase === 'combo' || phase === 'super' ? 24 : 0),
    ),
  );
  const arena = clamp(
    Math.round(
      (entropyScore * 0.58)
      + (lumaStd * 1.5)
      + Math.max(0, Math.min(14, lumaMean - 48)) * 0.42
      + (phase === 'match-start' || phase === 'victory' ? 12 : 0),
    ),
  );
  const lighting = clamp(
    Math.round(
      (contrastScore * 0.8)
      + Math.min(24, (lumaMean - 40) * 0.15)
      + lightingScore(shadowToLuma(spread))
      + 12,
    ),
  );
  const shader = clamp(
    Math.round(
      (entropyScore * 0.48)
      + (saturationScore * 0.33)
      + (contrastScore * 0.19)
      - dominancePenalty * 1.22
      - aliasingScore * 0.25,
    ),
  );
  const vfx = clamp(
    Math.round(
      (edgeScore * 0.47)
      + (motionScore * 0.23)
      - bandingScore * 0.18
      + (phase === 'super' ? 28 : 12),
    ),
  );
  const ui = clamp(
    Math.round(
      (100 - clamp(Math.round(dominantShare * 170)))
      + (phase === 'victory' ? 16 : 0)
      - (edgeScore < 28 ? 10 : 0)
      - (aliasingScore > 34 ? 12 : 0),
    ),
  );
  const presentation = clamp(
    Math.round(
      character * 0.16
      + animation * 0.13
      + arena * 0.14
      + lighting * 0.16
      + shader * 0.13
      + vfx * 0.1
      + ui * 0.14
      + phaseWeight(phase) * 0.14,
    ),
  );
  const spectacle = clamp(
    Math.round((vfx + animation + lighting + edgeScore) / 4),
  );
  const categories: Record<Category, number> = {
    character,
    animation,
    arena,
    lighting,
    shader,
    vfx,
    ui,
    presentation,
    spectacle,
  };

  const baseOverall = clamp(
    Math.round(
      (character + animation + arena + lighting + shader + vfx + ui + presentation + spectacle) / 9,
    ),
  );
  const target = PHASE_TARGETS[phase];
  const targetMissPenalty = Object.entries(target)
      .reduce((sum, [category, required]) => {
      const current = categories[category as Category];
      return sum + Math.max(0, required - current);
    }, 0);
  const overall = clamp(baseOverall - Math.round(targetMissPenalty * 0.42));

  const findings = buildFindings(
    { character, animation, arena, lighting, shader, vfx, ui, presentation, spectacle },
    {
      contrastScore,
      saturationScore,
      edgeScore,
      motionScore,
      entropyScore,
      dominancePenalty,
      bandingScore,
      aliasingScore,
      readabilityScore,
      zFightScore,
      phase,
    },
  );
  const strengths = buildStrengths(categories, phase);

  return {
    overall,
    categories,
    findings,
    strengths,
  };
}

function analyzePixels(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  previous: { width: number; height: number; data: Uint8ClampedArray | null; },
) {
  let lumaMin = 255;
  let lumaMax = 0;
  let lumaTotal = 0;
  let lumaVariance = 0;
  let saturationTotal = 0;
  let saturationVariance = 0;
  const bins = new Map<number, number>();
  let edgeCount = 0;
  let motionTotal = 0;
  let motionSamples = 0;
  let zFightSamples = 0;

  const stride = 4;
  const pixels = width * height;
  const pixelIndexLimit = pixels * 4;
  for (let offset = 0; offset < pixelIndexLimit; offset += stride) {
    const red = data[offset] ?? 0;
    const green = data[offset + 1] ?? 0;
    const blue = data[offset + 2] ?? 0;
    const alpha = data[offset + 3] ?? 255;
    if (alpha < 50) continue;

    const lum = 0.299 * red + 0.587 * green + 0.114 * blue;
    lumaMin = Math.min(lumaMin, lum);
    lumaMax = Math.max(lumaMax, lum);
    lumaTotal += lum;
    saturationTotal += saturation(red, green, blue);
    const quant = ((red >> 5) << 10) | ((green >> 5) << 5) | (blue >> 5);
    bins.set(quant, (bins.get(quant) ?? 0) + 1);

    if (previous.data !== null && previous.width === width && previous.height === height) {
      const i = offset / 4;
      const px = data[offset] ?? 0;
      const py = data[offset + 1] ?? 0;
      const pz = data[offset + 2] ?? 0;
      const prevOffset = (i * 4);
      const prev = previous.data[prevOffset] ?? 0;
      const prevG = previous.data[prevOffset + 1] ?? 0;
      const prevB = previous.data[prevOffset + 2] ?? 0;
      motionTotal += Math.abs(px - prev) + Math.abs(py - prevG) + Math.abs(pz - prevB);
      motionSamples += 1;
    }
  }

  const pixelCount = Math.max(1, (width * height));
  const lumaMean = lumaTotal / pixelCount;
  for (let offset = 0; offset < pixelIndexLimit; offset += stride) {
    const red = data[offset] ?? 0;
    const green = data[offset + 1] ?? 0;
    const blue = data[offset + 2] ?? 0;
    const alpha = data[offset + 3] ?? 255;
    if (alpha < 50) continue;
    const lum = 0.299 * red + 0.587 * green + 0.114 * blue;
    lumaVariance += (lum - lumaMean) ** 2;
  }
  const lumaStd = Math.sqrt(lumaVariance / pixelCount);
  const saturationMean = saturationTotal / pixelCount;
  for (let offset = 0; offset < pixelIndexLimit; offset += stride) {
    const red = data[offset] ?? 0;
    const green = data[offset + 1] ?? 0;
    const blue = data[offset + 2] ?? 0;
    const alpha = data[offset + 3] ?? 255;
    if (alpha < 50) continue;
    const sat = saturation(red, green, blue);
    saturationVariance += (sat - saturationMean) ** 2;
  }
  saturationVariance = Math.sqrt(saturationVariance / pixelCount);

  const histBins = 16;
  const hist = new Array(histBins).fill(0);
  for (const count of bins.values()) {
    const bucket = Math.min(histBins - 1, Math.floor(count / Math.max(1, pixelCount / histBins)));
    hist[bucket] += count;
  }
  const entropy = hist.reduce((sum, value) => {
    if (value === 0) return sum;
    const p = value / pixelCount;
    return sum - p * (Math.log2(p));
  }, 0);
  const dominantShare = Math.max(...bins.values(), 1) / pixelCount;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const center = ((y * width) + x) * 4;
      const left = center - 4;
      const right = center + 4;
      const up = center - width * 4;
      const down = center + width * 4;
      const lumCenter = 0.299 * data[center] + 0.587 * data[center + 1] + 0.114 * data[center + 2];
      const lumaLeft = 0.299 * data[left] + 0.587 * data[left + 1] + 0.114 * data[left + 2];
      const lumaRight = 0.299 * data[right] + 0.587 * data[right + 1] + 0.114 * data[right + 2];
      const lumaUp = 0.299 * data[up] + 0.587 * data[up + 1] + 0.114 * data[up + 2];
      const lumaDown = 0.299 * data[down] + 0.587 * data[down + 1] + 0.114 * data[down + 2];
      const local = Math.abs(lumCenter - lumaLeft) + Math.abs(lumCenter - lumaRight) + Math.abs(lumCenter - lumaUp)
        + Math.abs(lumCenter - lumaDown);
      const gx = (lumaRight - lumCenter) * (lumCenter - lumaLeft);
      const gy = (lumaDown - lumCenter) * (lumCenter - lumaUp);
      if (gx < -220 && gy < -220) {
        zFightSamples += 1;
      }
      if (local > 78) edgeCount += 1;
    }
  }
  const edgeDensity = edgeCount / Math.max(1, width * height);
  const motionDelta = motionSamples === 0 ? 0 : motionTotal / (motionSamples * 3);
  const zFightScore = clamp(
    Math.round((zFightSamples / Math.max(1, (width - 2) * (height - 2))) * 220),
  );

  return {
    lumaMin,
    lumaMax,
    lumaMean,
    lumaStd,
    saturationMean,
    saturationStd: saturationVariance,
    entropy,
    dominantShare,
    edgeDensity,
    motionDelta,
    zFightScore,
  };
}

function saturation(red: number, green: number, blue: number) {
  const max = Math.max(red, green, blue) / 255;
  const min = Math.min(red, green, blue) / 255;
  return max === 0 ? 0 : (max - min) / max;
}

function clamp(value: number, max = 100) {
  return Math.max(0, Math.min(max, value));
}

function clamp01(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function shadowToLuma(spread: number): number {
  return clamp01(spread * 1.18, 0.07, 1);
}

function lightingScore(shadowBalance: number): number {
  const centered = 1 - Math.abs(shadowBalance - 0.62);
  return clamp(Math.round(52 + centered * 58));
}

function phaseWeight(phase: CapturePhase) {
  if (phase === 'super' || phase === 'combo') return 22;
  if (phase === 'match-start' || phase === 'victory') return 24;
  return 18;
}

function buildFindings(
  categories: Record<Category, number>,
  metrics: {
    contrastScore: number;
    saturationScore: number;
    edgeScore: number;
    motionScore: number;
    entropyScore: number;
    dominancePenalty: number;
    bandingScore: number;
    aliasingScore: number;
    readabilityScore: number;
    zFightScore: number;
    phase: CapturePhase;
  },
) {
  const findings: string[] = [];
  if (categories.lighting < 78) {
    findings.push(
      'Lighting still feels generic: add stronger 3-point hierarchy (cold rim + hard contrast key + motivated backlight) with time-shifted shadows so the body reads like 3D stage spectacle.',
    );
  }
  if (categories.character < 80) {
    findings.push(
      'Character silhouette and read are still unstable; widen profile contrast, raise outer silhouette intensity, and force a secondary value shadow pass to keep each fighter readable against busy VFX.',
    );
  }
  if (categories.shader < 82 || categories.vfx < 82) {
    findings.push(
      'Shading layer still leaks "single-pass" look; introduce non-linear cel bands, rim edge falloff response, and secondary specular contour so materials feel carved, not painted.',
    );
  }
  if (metrics.aliasingScore > 28) {
    findings.push(
      'Aliasing/stutter appears on fast edges; add conservative MSAA/FXAA pass strategy in render chain and anti-shimmer damping for sub-pixel silhouettes.',
    );
  }
  if (metrics.bandingScore > 30) {
    findings.push(
      'Banding/posterization remains in distant gradients; inject temporal dither/noise and avoid straight-linear tone ramps on floor/sky transitions.',
    );
  }
  if (metrics.zFightScore > 40) {
    findings.push(
      'Z-conflict detected; separate coplanar planes, add per-layer depth bias, and detach decals from hero geometry by micro-offsets to avoid shimmer.',
    );
  }
  if (metrics.readabilityScore < 58) {
    findings.push(
      'Readability is still below AAA standard; increase local contrast windows around fighters, impact telegraphs, HUD text and edge cues before heavy particle moments.',
    );
  }
  if (categories.animation < 84 && (metrics.phase === 'combo' || metrics.phase === 'super')) {
    findings.push(
      'Combo/super timing still reads too linear; add 2-3 hard anticipation frames, readable impact pauses, then delayed recovery so cadence feels like real fight-cinema.',
    );
  }
  if (metrics.edgeScore < 36 && metrics.motionScore < 26) {
    findings.push(
      'Impact readability is insufficient for super-level spectacle; add a separate hit-park layer (screen-space shockwave, dust shard burst, and parallax lens pop).',
    );
  }
  if (categories.ui < 80 && metrics.phase === 'main-menu') {
    findings.push(
      'Main menu remains too static; build a moving hero state, depth in card stacks, and stronger high-contrast call-to-action pulses to match pro UI rhythm.',
    );
  }
  if (categories.spectacle < 84 && (metrics.phase === 'super' || metrics.phase === 'victory')) {
    findings.push(
      'No AAA spectacle event on major moments; supers and finishers need world-scale lighting reaction (arena bloom gate + lens flare bloom + delayed smoke wash).',
    );
  }
  if (categories.ui < 68 && metrics.phase === 'victory') {
    findings.push(
      'Victory screen lacks prestige; elevate composition hierarchy and cinematic spacing so the outcome moment communicates match context instantly.',
    );
  }
  if (findings.length === 0) {
    findings.push('No catastrophic issues found; still force-check VFX readability against movement/aliasing under stress and keep pushing toward 88+ consistency.');
  }
  if (metrics.dominancePenalty > 15) {
    findings.push(
      'Flat surfaces too uniform at camera distance; layer micro-noise and anisotropic breakup in floor/FX materials to prevent skyline flatness.',
    );
  }
  return findings.slice(0, 3);
}

function buildStrengths(categories: Record<Category, number>, phase: CapturePhase) {
  const strengths: string[] = [];
  if (categories.arena >= 86) strengths.push(`Arena reads as a live stage, not a background card, for ${phase}.`);
  if (categories.animation >= 84) strengths.push('Combat cadence contains readable weight and clear hit rhythm.');
  if (categories.lighting >= 84) strengths.push('Lighting pass has layered contrast depth with directional hierarchy.');
  if (categories.spectacle >= 88) strengths.push('Major cinematic moments begin to show modern combat presentation scale.');
  if (strengths.length === 0) return ['No meaningful strengths captured yet.'];
  return strengths.slice(0, 1);
}


