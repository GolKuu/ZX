// Gives the fighters room to breathe while keeping the rim readable in the
// tracking camera. Gameplay boundaries use the same radius minus the fighter
// pushbox margin (see combatSetup.ts).
export const ARENA_RADIUS = 7.2;

export interface ArenaDebris {
  readonly position: readonly [number, number, number];
  readonly scale: readonly [number, number, number];
  readonly rotation: readonly [number, number, number];
  readonly speed: number;
}

export function buildDebris(count: number, seed: number): ArenaDebris[] {
  const items: ArenaDebris[] = [];
  let state = seed;
  const random = (): number => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };

  for (let index = 0; index < count; index += 1) {
    // Back half only (π…2π gives sin ≤ 0, so z ≤ 0).
    //
    // These used to ring the arena through a full turn, which put pillars and
    // floating rock on the *camera* side of the fight. Harmless while the camera
    // was locked to the origin; the moment it tracked a cornered pair, a
    // building-sized black box slid in front of the player. Nothing is allowed
    // between the lens and the fighters — the dressing reads as silhouette
    // behind them, which is all it was ever doing.
    const angle = Math.PI + random() * Math.PI;
    const distance = ARENA_RADIUS + 1.4 + random() * 8;
    items.push({
      position: [
        Math.cos(angle) * distance,
        -1.2 + random() * 5.5,
        Math.sin(angle) * distance,
      ],
      scale: [
        0.18 + random() * 0.5,
        0.14 + random() * 0.8,
        0.16 + random() * 0.45,
      ],
      rotation: [random() * 3.1, random() * 3.1, random() * 3.1],
      speed: 0.1 + random() * 0.35,
    });
  }

  return items;
}
