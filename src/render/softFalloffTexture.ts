import { CanvasTexture } from 'three';

/**
 * A radial white-to-clear ramp on a small canvas.
 *
 * Any quad standing in for something soft — a contact shadow, a puff of dust, a
 * pool of light — needs one of these as its alpha, or it renders as exactly what
 * it is: a rectangle. Sharing one generator means every soft thing on the stage
 * falls off the same way, which is a large part of why a set reads as coherent.
 */
export function createSoftFalloffTexture(): CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context !== null) {
    const ramp = context.createRadialGradient(
      size / 2, size / 2, 0, size / 2, size / 2, size / 2,
    );
    ramp.addColorStop(0, '#ffffff');
    ramp.addColorStop(0.45, '#9a9a9a');
    ramp.addColorStop(1, '#000000');
    context.fillStyle = ramp;
    context.fillRect(0, 0, size, size);
  }
  return new CanvasTexture(canvas);
}
