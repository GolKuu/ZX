import type Phaser from 'phaser';
import { validateHitboxAlignment } from './HitboxAlignment';
import { RendererProfiler } from './RendererProfiler';

type Diagnostics = {
  fps: number;
  cpuMs: number;
  gpuMs: number | null;
  memoryMb: number | null;
  drawCalls: number;
  renderer: string;
  maxFrameMs: number;
  liveObjects: number;
  objectDrift: number;
  canvasCount: number;
  hitboxesChecked: number;
  hitboxErrors: number;
};

export class PerformanceMonitor {
  private frameTimes: number[] = [];
  private minObjects = Number.POSITIVE_INFINITY;
  private maxObjects = 0;
  private readonly hitboxes = validateHitboxAlignment();
  private label: Phaser.GameObjects.Text | null = null;
  private frames = 0;
  private frameStartedAt = 0;
  private readonly renderer = new RendererProfiler();

  attach(scene: Phaser.Scene) {
    this.renderer.attach(scene);
    this.label = scene.add
      .text(936, 512, 'PERF: прогрев…', {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: '#ffffff',
        backgroundColor: '#252b38aa',
        padding: { x: 7, y: 4 },
      })
      .setOrigin(1, 0)
      .setDepth(40);
  }

  beginFrame() {
    this.frameStartedAt = performance.now();
  }

  record(scene: Phaser.Scene, deltaMs: number) {
    this.frames += 1;
    this.frameTimes.push(deltaMs);
    if (this.frameTimes.length > 180) this.frameTimes.shift();
    const objects = scene.children.length;
    this.minObjects = Math.min(this.minObjects, objects);
    this.maxObjects = Math.max(this.maxObjects, objects);
    const average = this.frameTimes.reduce((sum, value) => sum + value, 0) /
      Math.max(1, this.frameTimes.length);
    const renderer = this.renderer.snapshot();
    const diagnostics: Diagnostics = {
      fps: Math.round(1_000 / Math.max(1, average)),
      cpuMs: Math.round((performance.now() - this.frameStartedAt) * 10) / 10,
      gpuMs: renderer.gpuMs,
      memoryMb: memoryUsageMb(),
      drawCalls: renderer.drawCalls,
      renderer: renderer.renderer,
      maxFrameMs: Math.round(Math.max(...this.frameTimes) * 10) / 10,
      liveObjects: objects,
      objectDrift: this.maxObjects - this.minObjects,
      canvasCount: scene.game.canvas.parentElement?.querySelectorAll('canvas').length ?? 1,
      hitboxesChecked: this.hitboxes.checked,
      hitboxErrors: this.hitboxes.errors.length,
    };
    window.__ZX_DIAGNOSTICS__ = diagnostics;
    if (this.frames % 30 === 0) {
      this.label?.setText(
        `${diagnostics.fps} FPS · CPU ${diagnostics.cpuMs}ms · ` +
        `GPU ${valueOrDash(diagnostics.gpuMs)}ms · DC ${diagnostics.drawCalls}\n` +
        `MEM ${valueOrDash(diagnostics.memoryMb)}MB · OBJ ${diagnostics.liveObjects}`,
      );
    }
  }

  destroy() {
    this.label?.destroy();
    this.renderer.destroy();
    this.label = null;
    delete window.__ZX_DIAGNOSTICS__;
  }
}

function memoryUsageMb() {
  const memory = (performance as Performance & {
    memory?: { usedJSHeapSize: number };
  }).memory;
  return memory
    ? Math.round(memory.usedJSHeapSize / 1024 / 1024 * 10) / 10
    : null;
}

function valueOrDash(value: number | null) {
  return value === null ? '—' : value;
}
