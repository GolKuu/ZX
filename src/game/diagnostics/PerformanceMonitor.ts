import type Phaser from 'phaser';
import { validateHitboxAlignment } from './HitboxAlignment';

type Diagnostics = {
  fps: number;
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

  attach(scene: Phaser.Scene) {
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

  record(scene: Phaser.Scene, deltaMs: number) {
    this.frames += 1;
    this.frameTimes.push(deltaMs);
    if (this.frameTimes.length > 180) this.frameTimes.shift();
    const objects = scene.children.length;
    this.minObjects = Math.min(this.minObjects, objects);
    this.maxObjects = Math.max(this.maxObjects, objects);
    const average = this.frameTimes.reduce((sum, value) => sum + value, 0) /
      Math.max(1, this.frameTimes.length);
    const diagnostics: Diagnostics = {
      fps: Math.round(1_000 / Math.max(1, average)),
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
        `${diagnostics.fps} FPS · OBJ ${diagnostics.liveObjects} · ` +
        `HIT ${diagnostics.hitboxesChecked - diagnostics.hitboxErrors}/${diagnostics.hitboxesChecked}`,
      );
    }
  }

  destroy() {
    this.label?.destroy();
    this.label = null;
    delete window.__ZX_DIAGNOSTICS__;
  }
}
