import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';
import test from 'node:test';
import {
  STORY_CHAPTERS,
  STORY_PLAYER_CHARACTER_ID,
  storySelection,
} from '../.sim-test-build/src/story/campaign.js';
import {
  completeStoryBattle,
  migrateStorySave,
  newStorySave,
} from '../.sim-test-build/src/story/save.js';
import {
  GLITCH_CINEMATIC_ASSETS,
  STORY_DIALOGUE,
} from '../.sim-test-build/src/story/dialogue.js';

test('every chapter and final boss keep Glitch as the active player', () => {
  assert.equal(STORY_PLAYER_CHARACTER_ID, 'glitch');
  assert.equal(STORY_CHAPTERS.length, 11);
  for (let chapterIndex = 0; chapterIndex < STORY_CHAPTERS.length; chapterIndex += 1) {
    assert.equal(storySelection(chapterIndex)[0], 'glitch');
  }
  assert.equal(STORY_CHAPTERS.at(-1)?.opponentId, 'zero-form');
  assert.equal(storySelection(STORY_CHAPTERS.length - 1)[0], 'glitch');
});

test('new, continue, retry, defeat and migration contracts cannot select another protagonist', () => {
  const fresh = newStorySave();
  assert.equal(fresh.playableCharacterId, 'glitch');
  const migrated = migrateStorySave({
    ...fresh,
    playableCharacterId: 'titan',
    protagonistId: 'mim',
    chapterIndex: 999,
    checkpoint: 42,
  });
  assert.equal(migrated.playableCharacterId, 'glitch');
  assert.equal('protagonistId' in migrated, false);
  assert.equal(migrated.chapterIndex, STORY_CHAPTERS.length - 1);
  assert.equal(storySelection(migrated.chapterIndex)[0], 'glitch');
  assert.match(migrated.checkpoint, /safe-entry$/);
});

test('chapter transitions save Glitch unlocks immediately without touching roster balance', () => {
  const start = newStorySave();
  const next = completeStoryBattle(start);
  assert.equal(next.playableCharacterId, 'glitch');
  assert.equal(next.chapterIndex, 1);
  assert.deepEqual(next.completedBattles, ['prologue']);
  assert.deepEqual(storySelection(next.chapterIndex)[0], 'glitch');
});

test('campaign integrates bilingual subtitles and the required Glitch cinematic set', () => {
  assert.equal(STORY_DIALOGUE.length, STORY_CHAPTERS.length);
  for (const chapter of STORY_DIALOGUE) {
    assert.ok(chapter.length >= 2);
    for (const line of chapter) {
      assert.ok(line.en.length > 10);
      assert.ok(line.ru.length > 10);
      assert.ok(line.speaker.length > 0);
    }
  }
  assert.equal(GLITCH_CINEMATIC_ASSETS.portraits.length, 8);
  assert.equal(GLITCH_CINEMATIC_ASSETS.fullBodyPoses.length, 5);
  assert.equal(GLITCH_CINEMATIC_ASSETS.teleportSequences.length, 3);
  assert.equal(GLITCH_CINEMATIC_ASSETS.internalCoordinateSequences.length, 2);
  assert.equal(GLITCH_CINEMATIC_ASSETS.corruptedTransformation.length, 1);
  assert.equal(GLITCH_CINEMATIC_ASSETS.finalResonance.length, 1);
});

test('Story entry exposes only Start and Continue, and cannot route to Character Select', async () => {
  const screen = await readFile(new URL('../src/ui/StoryModeScreen.tsx', import.meta.url), 'utf8');
  const store = await readFile(new URL('../src/store/hudStore.ts', import.meta.url), 'utf8');
  assert.equal((screen.match(/<button/g) ?? []).length, 2);
  assert.match(screen, /START STORY/);
  assert.match(screen, /CONTINUE STORY/);
  assert.doesNotMatch(screen, /CharacterSelect|chapter selection|protagonist selection/i);
  assert.match(store, /state\.mode === 'story'[\s\S]*screen: 'story'/);
  assert.match(store, /storySelection\(state\.storySave\?\.chapterIndex \?\? 0\)/);
});
