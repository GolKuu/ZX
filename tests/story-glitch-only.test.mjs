import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';
import test from 'node:test';
import {
  STORY_CHAPTERS,
  STORY_PLAYER_CHARACTER_ID,
  storyChapterHasBattle,
  storySelection,
} from '../.sim-test-build/src/story/campaign.js';
import {
  STORY_CINEMATIC_BEAT_NAMES,
  storyCinematic,
  storyLineFocus,
  storyLineIntensity,
} from '../.sim-test-build/src/story/cinematics.js';
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

test('no chapter ever stages Glitch against Glitch', () => {
  for (const [index, chapter] of STORY_CHAPTERS.entries()) {
    assert.notEqual(
      chapter.combatOpponentId,
      STORY_PLAYER_CHARACTER_ID,
      `${chapter.id} would put Glitch on both sides of the stage`,
    );
    // The seeded snapshot has to be a real matchup even where no fight happens.
    assert.notEqual(storySelection(index)[1], STORY_PLAYER_CHARACTER_ID);
  }
});

test('the four self-confrontations are cinematic and the rivals still fight', () => {
  const cinematic = STORY_CHAPTERS
    .filter((_, index) => !storyChapterHasBattle(index))
    .map((chapter) => chapter.id);
  assert.deepEqual(cinematic, ['prologue', 'the-vessel', 'the-fifth', 'zero-form']);
  for (const [index, chapter] of STORY_CHAPTERS.entries()) {
    assert.equal(
      storyChapterHasBattle(index),
      chapter.combatOpponentId !== null,
      `${chapter.id} disagrees with its own opponent`,
    );
  }
});

test('a cutscene-only chapter still carries its unlocks into the save', () => {
  // The Vessel is the chapter that hands back Spatial Shift. Losing its battle
  // must not lose the two techniques the rest of the campaign is balanced for.
  let save = newStorySave();
  for (let step = 0; step < STORY_CHAPTERS.length; step += 1) {
    save = completeStoryBattle(save);
  }
  assert.ok(save.unlockedTechniques.includes('glitch.super-2'));
  assert.ok(save.unlockedTechniques.includes('glitch.spatial-cancel'));
  assert.ok(save.unlockedTechniques.includes('glitch.ultimate'));
  assert.ok(save.completedBattles.includes('the-vessel'));
});

test('every chapter maps to an authored cinematic beat', () => {
  const seen = new Set();
  for (let index = 0; index < STORY_CHAPTERS.length; index += 1) {
    const cinematic = storyCinematic(index);
    assert.ok(
      STORY_CINEMATIC_BEAT_NAMES.includes(cinematic.beat),
      `${cinematic.beat} is not in GLITCH_CINEMATIC_ASSETS`,
    );
    assert.ok(cinematic.durationSeconds >= 4 && cinematic.durationSeconds <= 8);
    assert.ok(['rival', 'fifth', 'construct', 'chorus'].includes(cinematic.side));
    seen.add(cinematic.beat);
  }
  // A campaign where every chapter looked the same is what this replaced.
  assert.ok(seen.size >= 8, `only ${seen.size} distinct beats across 11 chapters`);
  assert.deepEqual(storyCinematic(-5), storyCinematic(0));
  assert.deepEqual(storyCinematic(99), storyCinematic(STORY_CHAPTERS.length - 1));
});

test('the cutscene stage frames whoever is speaking, at the line intensity', () => {
  for (const lines of STORY_DIALOGUE) {
    for (const line of lines) {
      const intensity = storyLineIntensity(line);
      assert.ok(
        intensity > 0 && intensity <= 1,
        `${line.expression} has no usable intensity`,
      );
      assert.equal(
        storyLineFocus(line),
        line.speaker === 'GLITCH' ? 'glitch' : 'opposite',
        `${line.speaker} is framed on the wrong side`,
      );
    }
  }
  // Possession is the loudest state the rig has, a settled line the quietest.
  const at = (expression) => storyLineIntensity({ ...STORY_DIALOGUE[0][0], expression });
  assert.ok(at('influenced') > at('angry'));
  assert.ok(at('angry') > at('determined'));
  assert.ok(at('determined') > at('normal'));
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
