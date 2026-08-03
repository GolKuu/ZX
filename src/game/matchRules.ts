export const ROUNDS_TO_WIN = 2;

export function isPracticeMode(mode: string | null): boolean {
  return mode === 'training' || mode === 'tutorial';
}
