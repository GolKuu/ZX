import type Phaser from 'phaser';
import { describe, expect, it, vi } from 'vitest';
import {
  groundedRootOffsetY,
  ProceduralRig,
} from '../rendering/animation/ProceduralRig';
import {
  RIG_RESTING_BOTTOM,
  type RigParts,
} from '../rendering/animation/RigTypes';

vi.mock('phaser', () => ({
  default: {
    Math: {
      Linear: (from: number, to: number, amount: number) =>
        from + (to - from) * amount,
    },
  },
}));

describe('procedural rig stability', () => {
  it('keeps the feet on the shared ground line while scaling', () => {
    [0.72, 0.84, 1, 1.16].forEach((scaleY) => {
      const rootY = groundedRootOffsetY(0, scaleY);
      expect(rootY + RIG_RESTING_BOTTOM * scaleY)
        .toBeCloseTo(RIG_RESTING_BOTTOM);
    });
  });

  it('restores the head anchor on every animation frame', () => {
    const root = stubContainer();
    const head = stubContainer(0, -61);
    const parts: RigParts = {
      root: asPhaserContainer(root),
      torso: asPhaserContainer(stubContainer()),
      head: asPhaserContainer(head),
      frontArm: asPhaserContainer(stubContainer()),
      backArm: asPhaserContainer(stubContainer()),
      frontLeg: asPhaserContainer(stubContainer()),
      backLeg: asPhaserContainer(stubContainer()),
    };
    const rig = new ProceduralRig(parts, 'shira', 'shira');
    head.x = 240;
    head.y = 180;

    rig.sync({
      state: 'idle',
      tick: 12,
      phase: null,
      motion: null,
      stopped: false,
    });

    expect(head.x).toBe(0);
    expect(head.y).toBe(-61);
  });
});

type ContainerStub = {
  x: number;
  y: number;
  rotation: number;
  setPosition: (x: number, y: number) => ContainerStub;
  setRotation: (rotation: number) => ContainerStub;
  setScale: (x: number, y: number) => ContainerStub;
  setAlpha: (alpha: number) => ContainerStub;
};

function stubContainer(x = 0, y = 0): ContainerStub {
  return {
    x,
    y,
    rotation: 0,
    setPosition(nextX, nextY) {
      this.x = nextX;
      this.y = nextY;
      return this;
    },
    setRotation(rotation) {
      this.rotation = rotation;
      return this;
    },
    setScale() {
      return this;
    },
    setAlpha() {
      return this;
    },
  };
}

function asPhaserContainer(container: ContainerStub) {
  return container as unknown as Phaser.GameObjects.Container;
}
