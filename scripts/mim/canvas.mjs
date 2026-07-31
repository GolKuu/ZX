import sharp from 'sharp';
import { rgba } from './palette.mjs';

/**
 * A plain integer pixel buffer.
 *
 * Everything MIM is drawn with lands on whole pixels: no anti-aliasing, no
 * sub-pixel centres, no scaling during authoring. That is the only way the
 * pixel grid stays stable across seventy animation poses.
 */
export class PixelCanvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
  }

  set(x, y, colour) {
    const px = Math.round(x);
    const py = Math.round(y);
    if (px < 0 || py < 0 || px >= this.width || py >= this.height) return;
    const [r, g, b, a] = typeof colour === 'string' ? rgba(colour) : colour;
    if (a === 0) return;
    const index = (py * this.width + px) * 4;
    this.data[index] = r;
    this.data[index + 1] = g;
    this.data[index + 2] = b;
    this.data[index + 3] = a;
  }

  get(x, y) {
    const px = Math.round(x);
    const py = Math.round(y);
    if (px < 0 || py < 0 || px >= this.width || py >= this.height) return null;
    const index = (py * this.width + px) * 4;
    return [
      this.data[index],
      this.data[index + 1],
      this.data[index + 2],
      this.data[index + 3],
    ];
  }

  isOpaque(x, y) {
    const pixel = this.get(x, y);
    return pixel !== null && pixel[3] > 0;
  }

  rect(x, y, width, height, colour) {
    for (let py = 0; py < height; py += 1) {
      for (let px = 0; px < width; px += 1) this.set(x + px, y + py, colour);
    }
  }

  /** Bresenham, so a limb never gains a half-pixel. */
  line(x0, y0, x1, y1, colour) {
    let ax = Math.round(x0);
    let ay = Math.round(y0);
    const bx = Math.round(x1);
    const by = Math.round(y1);
    const dx = Math.abs(bx - ax);
    const dy = -Math.abs(by - ay);
    const sx = ax < bx ? 1 : -1;
    const sy = ay < by ? 1 : -1;
    let error = dx + dy;
    for (;;) {
      this.set(ax, ay, colour);
      if (ax === bx && ay === by) break;
      const doubled = 2 * error;
      if (doubled >= dy) {
        error += dy;
        ax += sx;
      }
      if (doubled <= dx) {
        error += dx;
        ay += sy;
      }
    }
  }

  /** A limb: a line given thickness, with a rounded cap at each end. */
  capsule(x0, y0, x1, y1, radius, colour) {
    const steps = Math.max(
      1,
      Math.ceil(Math.hypot(x1 - x0, y1 - y0)),
    );
    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps;
      this.disc(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, radius, colour);
    }
  }

  disc(cx, cy, radius, colour) {
    const r = Math.max(0.5, radius);
    const limit = Math.ceil(r);
    for (let py = -limit; py <= limit; py += 1) {
      for (let px = -limit; px <= limit; px += 1) {
        if (px * px + py * py <= r * r) this.set(cx + px, cy + py, colour);
      }
    }
  }

  ellipse(cx, cy, rx, ry, colour) {
    for (let py = -Math.ceil(ry); py <= Math.ceil(ry); py += 1) {
      for (let px = -Math.ceil(rx); px <= Math.ceil(rx); px += 1) {
        if ((px * px) / (rx * rx) + (py * py) / (ry * ry) <= 1) {
          this.set(cx + px, cy + py, colour);
        }
      }
    }
  }

  polygon(points, colour) {
    const ys = points.map(([, y]) => y);
    const top = Math.floor(Math.min(...ys));
    const bottom = Math.ceil(Math.max(...ys));
    for (let y = top; y <= bottom; y += 1) {
      const crossings = [];
      for (let index = 0; index < points.length; index += 1) {
        const [ax, ay] = points[index];
        const [bx, by] = points[(index + 1) % points.length];
        if ((ay <= y && by > y) || (by <= y && ay > y)) {
          crossings.push(ax + ((y - ay) / (by - ay)) * (bx - ax));
        }
      }
      crossings.sort((a, b) => a - b);
      for (let pair = 0; pair + 1 < crossings.length; pair += 2) {
        for (let x = Math.ceil(crossings[pair]); x <= Math.floor(crossings[pair + 1]); x += 1) {
          this.set(x, y, colour);
        }
      }
    }
  }

  /**
   * Edge light along one direction.
   *
   * This is what makes MIM read as lit technology rather than flat shapes: the
   * top-and-front edges of every cluster pick up a cold highlight, so the
   * direction the light comes from is the same in every pose.
   */
  rim(dx, dy, colour, brightColour) {
    const source = new Uint8ClampedArray(this.data);
    const alphaAt = (x, y) => {
      if (x < 0 || y < 0 || x >= this.width || y >= this.height) return 0;
      return source[(y * this.width + x) * 4 + 3];
    };
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        const index = (y * this.width + x) * 4;
        if (source[index + 3] === 0 || alphaAt(x + dx, y + dy) !== 0) continue;
        // Bright clusters take the brighter highlight so white stays white.
        const luminance = source[index] + source[index + 1] + source[index + 2];
        this.set(x, y, luminance > 470 ? brightColour ?? colour : colour);
      }
    }
  }

  /** One-pixel dark contour around every opaque cluster. Never inside it. */
  outline(colour = 'ink') {
    const source = new Uint8ClampedArray(this.data);
    const opaque = (x, y) => {
      if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false;
      return source[(y * this.width + x) * 4 + 3] > 0;
    };
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        if (opaque(x, y)) continue;
        if (
          opaque(x - 1, y) || opaque(x + 1, y)
          || opaque(x, y - 1) || opaque(x, y + 1)
        ) {
          this.set(x, y, colour);
        }
      }
    }
  }

  /** Tight crop plus a one-pixel clear border, which the asset check requires. */
  trim(padding = 1) {
    let minX = this.width;
    let minY = this.height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        if (this.data[(y * this.width + x) * 4 + 3] === 0) continue;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
    if (maxX < 0) return { canvas: new PixelCanvas(1, 1), offsetX: 0, offsetY: 0 };
    const width = maxX - minX + 1 + padding * 2;
    const height = maxY - minY + 1 + padding * 2;
    const cropped = new PixelCanvas(width, height);
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const index = (y * this.width + x) * 4;
        cropped.set(x - minX + padding, y - minY + padding, [
          this.data[index],
          this.data[index + 1],
          this.data[index + 2],
          this.data[index + 3],
        ]);
      }
    }
    return { canvas: cropped, offsetX: minX - padding, offsetY: minY - padding };
  }

  blit(other, x, y) {
    for (let py = 0; py < other.height; py += 1) {
      for (let px = 0; px < other.width; px += 1) {
        const index = (py * other.width + px) * 4;
        if (other.data[index + 3] === 0) continue;
        this.set(x + px, y + py, [
          other.data[index],
          other.data[index + 1],
          other.data[index + 2],
          other.data[index + 3],
        ]);
      }
    }
  }

  /** Nearest-neighbour only: scaling with a filter would destroy the grid. */
  scaled(factor) {
    const out = new PixelCanvas(this.width * factor, this.height * factor);
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        const index = (y * this.width + x) * 4;
        if (this.data[index + 3] === 0) continue;
        const colour = [
          this.data[index],
          this.data[index + 1],
          this.data[index + 2],
          this.data[index + 3],
        ];
        for (let sy = 0; sy < factor; sy += 1) {
          for (let sx = 0; sx < factor; sx += 1) {
            out.set(x * factor + sx, y * factor + sy, colour);
          }
        }
      }
    }
    return out;
  }

  async write(file) {
    await sharp(Buffer.from(this.data), {
      raw: { width: this.width, height: this.height, channels: 4 },
    })
      .png({ palette: true, compressionLevel: 9, effort: 10 })
      .toFile(file);
  }
}
