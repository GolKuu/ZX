import type Phaser from 'phaser';

type TimerExtension = {
  TIME_ELAPSED_EXT: number;
  GPU_DISJOINT_EXT: number;
};

export class RendererProfiler {
  private gl: WebGL2RenderingContext | null = null;
  private extension: TimerExtension | null = null;
  private activeQuery: WebGLQuery | null = null;
  private pendingQueries: WebGLQuery[] = [];
  private drawCalls = 0;
  private lastDrawCalls = 0;
  private gpuMs: number | null = null;
  private originalDrawArrays: WebGL2RenderingContext['drawArrays'] | null = null;
  private originalDrawElements: WebGL2RenderingContext['drawElements'] | null = null;
  private renderer: Phaser.Renderer.Canvas.CanvasRenderer |
    Phaser.Renderer.WebGL.WebGLRenderer | null = null;

  attach(scene: Phaser.Scene) {
    this.renderer = scene.game.renderer;
    if (!('gl' in this.renderer) || !(this.renderer.gl instanceof WebGL2RenderingContext)) {
      return;
    }
    this.gl = this.renderer.gl;
    this.extension = this.gl.getExtension(
      'EXT_disjoint_timer_query_webgl2',
    ) as TimerExtension | null;
    this.wrapDrawCalls();
    this.renderer.on('prerender', this.beginGpuFrame, this);
    this.renderer.on('postrender', this.endGpuFrame, this);
  }

  snapshot() {
    return {
      drawCalls: this.gl ? this.lastDrawCalls : canvasDrawCount(this.renderer),
      gpuMs: this.gpuMs,
      renderer: this.gl ? 'WebGL2' : 'Canvas',
    };
  }

  destroy() {
    this.renderer?.off('prerender', this.beginGpuFrame, this);
    this.renderer?.off('postrender', this.endGpuFrame, this);
    if (this.gl && this.originalDrawArrays && this.originalDrawElements) {
      this.gl.drawArrays = this.originalDrawArrays;
      this.gl.drawElements = this.originalDrawElements;
      this.pendingQueries.forEach((query) => this.gl?.deleteQuery(query));
      if (this.activeQuery) this.gl.deleteQuery(this.activeQuery);
    }
    this.pendingQueries = [];
    this.activeQuery = null;
    this.gl = null;
    this.renderer = null;
  }

  private wrapDrawCalls() {
    if (!this.gl) return;
    this.originalDrawArrays = this.gl.drawArrays.bind(this.gl);
    this.originalDrawElements = this.gl.drawElements.bind(this.gl);
    this.gl.drawArrays = (mode, first, count) => {
      this.drawCalls += 1;
      this.originalDrawArrays?.(mode, first, count);
    };
    this.gl.drawElements = (mode, count, type, offset) => {
      this.drawCalls += 1;
      this.originalDrawElements?.(mode, count, type, offset);
    };
  }

  private beginGpuFrame() {
    this.lastDrawCalls = this.drawCalls;
    this.drawCalls = 0;
    this.pollQueries();
    if (!this.gl || !this.extension || this.activeQuery) return;
    const query = this.gl.createQuery();
    if (!query) return;
    this.gl.beginQuery(this.extension.TIME_ELAPSED_EXT, query);
    this.activeQuery = query;
  }

  private endGpuFrame() {
    if (!this.gl || !this.extension || !this.activeQuery) return;
    this.gl.endQuery(this.extension.TIME_ELAPSED_EXT);
    this.pendingQueries.push(this.activeQuery);
    this.activeQuery = null;
  }

  private pollQueries() {
    if (!this.gl || !this.extension) return;
    const query = this.pendingQueries[0];
    if (!query || !this.gl.getQueryParameter(query, this.gl.QUERY_RESULT_AVAILABLE)) return;
    const disjoint = this.gl.getParameter(this.extension.GPU_DISJOINT_EXT) === true;
    if (!disjoint) {
      const nanoseconds = Number(this.gl.getQueryParameter(query, this.gl.QUERY_RESULT));
      this.gpuMs = Math.round(nanoseconds / 100_000) / 10;
    }
    this.gl.deleteQuery(query);
    this.pendingQueries.shift();
  }
}

function canvasDrawCount(
  renderer: RendererProfiler['renderer'],
) {
  return renderer && 'drawCount' in renderer ? renderer.drawCount : 0;
}
