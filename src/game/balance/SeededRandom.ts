export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0 || 0x6d2b79f5;
  }

  next() {
    let value = this.state;
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    this.state = value >>> 0;
    return this.state / 0x1_0000_0000;
  }

  chance(probability: number) {
    return this.next() < probability;
  }

  integer(minimum: number, maximum: number) {
    return minimum + Math.floor(this.next() * (maximum - minimum + 1));
  }
}

export function deriveSeed(baseSeed: number, ...parts: Array<string | number>) {
  let hash = baseSeed >>> 0;
  for (const part of parts) {
    const text = String(part);
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193);
    }
  }
  return hash >>> 0;
}
