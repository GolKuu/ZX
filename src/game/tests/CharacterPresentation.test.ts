import { describe, expect, it } from 'vitest';
import { getCharacterAttacks } from '../data/attacks/characterAttacks';
import { SIGNATURE_SPECIALS } from '../data/attacks/signatureSpecials';
import { circleFighters } from '../data/characters/circleFighters';
import { poseFor } from '../rendering/animation/PoseLibrary';
import { RIG_RESTING_BOTTOM, type RigFrame } from '../rendering/animation/RigTypes';
import { VICTORY_POSES } from '../rendering/animation/victoryPoseConfigs';
import { FORCE_MODEL_CONFIGS, forceModelConfig } from '../rendering/fighters/forceModelConfigs';
import {
  MODEL_EYE_GLOW,
  MODEL_OUTLINE,
  MODEL_OUTLINE_CSS,
} from '../rendering/fighters/modelStyle';
import {
  VICTORY_CUTSCENE_MS,
  VICTORY_SCENES,
} from '../rendering/victory/victoryScenes';

describe('final character presentation', () => {
  it('gives every fighter a named hand hit, kick and force special', () => {
    circleFighters.forEach((fighter) => {
      const attacks = getCharacterAttacks(fighter.id);
      expect(attacks.lightChain[0].name).toBe(fighter.basicAttackNames[0]);
      expect(attacks.lightChain[0].motion).toBe('punch');
      expect(attacks.lightChain[1].name).toBe(fighter.basicAttackNames[1]);
      expect(attacks.lightChain[1].motion).toContain('kick');
      expect(attacks.special.name).toBe(SIGNATURE_SPECIALS[fighter.id].name);
      expect(attacks.special.visualShape)
        .toBe(SIGNATURE_SPECIALS[fighter.id].visualShape);
    });
    expect(new Set(Object.values(SIGNATURE_SPECIALS).map((move) => move.name)).size).toBe(15);
  });

  it('uses final fight models with a distinct configuration for every new rig', () => {
    circleFighters.forEach((fighter) => {
      expect(fighter.visualModel.type.startsWith('final-')).toBe(true);
      if (fighter.id === 'granite' || fighter.id === 'shira') {
        expect(forceModelConfig(fighter.id)).toBeNull();
      } else {
        expect(forceModelConfig(fighter.id)).toBeTruthy();
      }
    });
    expect(Object.keys(FORCE_MODEL_CONFIGS)).toHaveLength(13);
    expect(new Set(
      Object.values(FORCE_MODEL_CONFIGS).map((config) => JSON.stringify(config)),
    ).size).toBe(13);
  });

  it('keeps the shared reference outline and luminous visor language', () => {
    expect(MODEL_OUTLINE).toBe(0x201a36);
    expect(MODEL_OUTLINE_CSS).toBe('#201a36');
    expect(MODEL_EYE_GLOW).toBe(0xcffff7);
  });

  it('keeps grounded idle and walking poses above the shared foot anchor', () => {
    expect(RIG_RESTING_BOTTOM).toBe(99);
    circleFighters.forEach((fighter) => {
      for (let tick = 0; tick < 120; tick += 3) {
        expect(poseFor(frame('idle', tick), fighter.visualKind, fighter.id).y)
          .toBeLessThanOrEqual(0);
        expect(poseFor(frame('walk', tick), fighter.visualKind, fighter.id).y)
          .toBeLessThanOrEqual(0);
      }
    });
  });

  it('ships a unique victory pose and cutscene text for all 15 fighters', () => {
    expect(VICTORY_CUTSCENE_MS).toBeGreaterThanOrEqual(3_000);
    expect(Object.keys(VICTORY_POSES)).toHaveLength(15);
    expect(Object.keys(VICTORY_SCENES)).toHaveLength(15);
    expect(new Set(
      Object.values(VICTORY_POSES).map((pose) => JSON.stringify(pose)),
    ).size).toBe(15);
    expect(new Set(Object.values(VICTORY_SCENES).map((scene) => scene.title)).size).toBe(15);
  });
});

function frame(state: 'idle' | 'walk', tick: number): RigFrame {
  return { state, tick, phase: null, motion: null, stopped: false };
}
