export function meterSegments(value: number, count: number): number {
  if (count <= 0) return 0;
  const normalized = Math.max(0, Math.min(100, value));
  return Math.min(count, Math.floor((normalized * count) / 100));
}
