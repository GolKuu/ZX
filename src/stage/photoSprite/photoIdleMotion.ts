export interface PhotoIdleMotion {
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
  readonly scaleX: number;
  readonly scaleY: number;
}

/**
 * Breath and weight-shift for a fighter who is not doing anything.
 *
 * A neutral fighter here holds exactly one atlas frame, and it does not move.
 * That is a deliberate decision and the right one — the sheet's six standing
 * poses are unrelated drawings, and cycling them read as a broken dance rather
 * than as an idle. But the consequence was that both fighters were perfectly
 * frozen images for most of a round, and nothing tells an eye "this is a
 * picture, not a person" faster than absolute stillness. Real fighters never
 * stop moving; the idle is the animation players spend the most time watching.
 *
 * So the motion is put back procedurally instead of by frame. Four cycles at
 * incommensurable rates — breath, sway, bob and a slow settle — never line up
 * into a visible loop, which is what makes short idles read as canned.
 *
 * Two rules keep it from looking like a floating sprite:
 *
 *   - **The feet do not leave the floor.** The vertical term is carried almost
 *     entirely by `scaleY` about the base, i.e. the body rising and falling on
 *     its own legs, not the whole cut-out translating upward.
 *   - **The two fighters are never in phase.** Synchronised breathing across
 *     the pair is instantly readable as a script running, so P2 is offset by
 *     an irrational fraction of the cycle and runs fractionally slower.
 */

interface IdleProfile {
  /** Breaths per second. Heavy characters breathe slower and deeper. */
  readonly rate: number;
  readonly breath: number;
  readonly sway: number;
  readonly bob: number;
}

const PROFILES: Record<string, IdleProfile> = {
  glitch: { rate: 1.05, breath: 0.009, sway: 0.0055, bob: 0.006 },
  lucky: { rate: 1.18, breath: 0.008, sway: 0.007, bob: 0.007 },
  mim: { rate: 0.98, breath: 0.0095, sway: 0.006, bob: 0.0055 },
  titan: { rate: 0.72, breath: 0.014, sway: 0.0035, bob: 0.004 },
  vorgh: { rate: 0.86, breath: 0.012, sway: 0.005, bob: 0.005 },
};

const NEUTRAL: PhotoIdleMotion = {
  x: 0,
  y: 0,
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
};

export function photoIdleMotion(
  elapsedTime: number,
  kind: string,
  fighterId: 'p1' | 'p2',
  /** 0 while acting or reacting, 1 in true neutral. */
  weight: number,
): PhotoIdleMotion {
  if (weight <= 0) return NEUTRAL;
  const profile = PROFILES[kind] ?? PROFILES.mim;
  if (profile === undefined) return NEUTRAL;

  // 0.618 of a cycle apart, and 3% off the tempo: the pair drift in and out of
  // phase over about half a minute and never visibly sync.
  const offset = fighterId === 'p2' ? 0.618 : 0;
  const rate = profile.rate * (fighterId === 'p2' ? 0.97 : 1);
  const t = elapsedTime * rate + offset * Math.PI * 2;

  const breath = Math.sin(t * Math.PI);
  // Chest expansion leads the shoulders settling, so the horizontal recovery
  // trails the vertical one by a quarter cycle.
  const settle = Math.sin(t * Math.PI - Math.PI * 0.5);
  const sway = Math.sin(t * 0.61);
  const drift = Math.sin(t * 0.37 + 1.7);

  return {
    x: sway * profile.sway * weight,
    // Deliberately small next to the scale term: this is the body's centre
    // rising, not the fighter leaving the ground.
    y: breath * profile.bob * 0.35 * weight,
    rotation: drift * 0.0045 * weight,
    scaleX: 1 + settle * profile.breath * 0.4 * weight,
    scaleY: 1 + breath * profile.breath * weight,
  };
}
