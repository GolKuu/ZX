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
    character: 38,
    animation: 30,
    arena: 52,
    lighting: 55,
    shader: 48,
    vfx: 34,
    ui: 65,
    presentation: 52,
    spectacle: 34,
  },
  'character-select': {
    character: 42,
    animation: 34,
    arena: 42,
    lighting: 50,
    shader: 46,
    vfx: 32,
    ui: 72,
    presentation: 56,
    spectacle: 32,
  },
  'match-start': {
    character: 56,
    animation: 50,
    arena: 64,
    lighting: 66,
    shader: 60,
    vfx: 58,
    ui: 60,
    presentation: 66,
    spectacle: 60,
  },
  'neutral-gameplay': {
    character: 64,
    animation: 58,
    arena: 72,
    lighting: 68,
    shader: 66,
    vfx: 62,
    ui: 58,
    presentation: 72,
    spectacle: 60,
  },
  'combo': {
    character: 72,
    animation: 72,
    arena: 74,
    lighting: 70,
    shader: 72,
    vfx: 72,
    ui: 55,
    presentation: 76,
    spectacle: 74,
  },
  'super': {
    character: 78,
    animation: 84,
    arena: 80,
    lighting: 82,
    shader: 82,
    vfx: 88,
    ui: 66,
    presentation: 86,
    spectacle: 90,
  },
  'victory': {
    character: 76,
    animation: 72,
    arena: 78,
    lighting: 84,
    shader: 80,
    vfx: 78,
    ui: 74,
    presentation: 82,
    spectacle: 84,
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
    zFightScore,
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
  const zFightScore = clamp(Math.round((dominancePenalty * 0.82) + (aliasingScore * 0.18)));

  const character = clamp(
    Math.round(
      (contrastScore * 0.46)
      + (edgeScore * 0.38)
      + (saturationScore * 0.16)
      - dominancePenalty * 0.2,
    ),
  );
  const animation = clamp(
    Math.round(
      (motionScore * 0.65)
      + Math.min(100, saturationStd * 80)
      + (phase === 'combo' || phase === 'super' ? 24 : 0),
    ),
  );
  const arena = clamp(
    Math.round(
      (entropyScore * 0.58)
      + (lumaStd * 1.4)
      + (phase === 'match-start' || phase === 'victory' ? 12 : 0),
    ),
  );
  const lighting = clamp(
    Math.round(
      (contrastScore * 0.8)
      + Math.min(24, (lumaMean - 40) * 0.15)
      + 10,
    ),
  );
  const shader = clamp(
    Math.round(
      (entropyScore * 0.48)
      + (saturationScore * 0.33)
      + (contrastScore * 0.19)
      - dominancePenalty,
    ),
  );
  const vfx = clamp(
    Math.round(
      (edgeScore * 0.47)
      + (motionScore * 0.23)
      + (phase === 'super' ? 22 : 8),
    ),
  );
  const ui = clamp(
    Math.round(
      (100 - clamp(Math.round(dominantShare * 150)))
      + (phase === 'victory' ? 16 : 0),
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
  const overall = clamp(baseOverall - Math.round(targetMissPenalty * 0.35));

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
  if (categories.lighting < 58) {
    findings.push(
      'Lighting is flat like a generic browser post-filter; add harder rim + directional key light shifts 12-18% apart and a second shadow pivot from the opposite side.',
    );
  }
  if (categories.character < 56) {
    findings.push(
      'Silhouette read is weak; each fighter must keep a bold 1px+ outline contrast band that does not collapse at distance, even at 40m in this stage.',
    );
  }
  if (categories.shader < 55 || categories.vfx < 52) {
    findings.push(
      'Shader pass looks procedural and synthetic; break the flat ramps with hue-shifted contour bands and non-linear response (like Strive/Naruto Storm energy layering), not a pure multiply.',
    );
  }
  if (metrics.aliasingScore > 38) {
    findings.push(
      'Aliasing/temporal shimmer is visible on thin edges; add jitter-resistant post-composite sampling and soften razor-thin geometry silhouettes.',
    );
  }
  if (metrics.bandingScore > 36) {
    findings.push(
      'Banding visible in skies/ground transitions; inject low-amplitude dithering and avoid hard posterized ramps at distant depths.',
    );
  }
  if (metrics.zFightScore > 52) {
    findings.push(
      'Likely z-fighting pattern detected; separate coplanar planes, add per-layer depth bias, and push decals to a safer offset.',
    );
  }
  if (metrics.readabilityScore < 52) {
    findings.push(
      'Readability for characters/impact and HUD layers is weak; increase local contrast around read windows and silhouette edges.',
    );
  }
  if (categories.animation < 54 && (metrics.phase === 'combo' || metrics.phase === 'super')) {
    findings.push(
      'Combo/super timing lacks readable weight; add 2-4 hard hold frames and micro-stutter at impact, then recover with eased re-entry.',
    );
  }
  if (metrics.edgeScore < 35 && metrics.motionScore < 24) {
    findings.push(
      'Impact readability is low; add screen-space impact shockwave + rim-pop + debris shards with independent parallax delay.',
    );
  }
  if (categories.ui < 58 && metrics.phase === 'main-menu') {
    findings.push(
      'Main/UI plane looks like a static poster; scale contrast on menu type and make selection rails breathe with directional glow pulses.',
    );
  }
  if (categories.spectacle < 60 && (metrics.phase === 'super' || metrics.phase === 'victory')) {
    findings.push(
      'No spectacle floor; supers must land with a world-scale reaction (arena bloom gate, lens flash, and post-burst smoke wash).',
    );
  }
  if (findings.length === 0) {
    findings.push('No catastrophic issues found, but still below AAA standard parity if any score stays < 80 in this phase.');
  }
  if (metrics.dominancePenalty > 15) {
    findings.push(
      'Banding/flat surfaces detected; push palette noise or anisotropic breakup in floor/FX textures so surfaces break at large scale.',
    );
  }
  return findings.slice(0, 3);
}

function buildStrengths(categories: Record<Category, number>, phase: CapturePhase) {
  const strengths: string[] = [];
  if (categories.arena >= 68) strengths.push(`Arena geometry density is above baseline for ${phase}.`);
  if (categories.animation >= 62) strengths.push(`Movement cadence has punch at this phase.`);
  if (categories.lighting >= 64) strengths.push(`Lighting curve has decent depth and color hierarchy.`);
  if (strengths.length === 0) return ['No meaningful strengths captured yet.'];
  return strengths.slice(0, 1);
}


