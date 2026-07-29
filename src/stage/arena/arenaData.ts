export const ARENA_RADIUS = 5.1;

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
    const angle = random() * Math.PI * 2;
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
