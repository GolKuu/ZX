/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MATCH_SERVER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __ZX_DIAGNOSTICS__?: {
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
}
