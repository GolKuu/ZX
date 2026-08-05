import assert from 'node:assert/strict';
import test from 'node:test';
import { CHARACTER_ROSTER } from '../.sim-test-build/src/data/characterRoster.js';
import { STORY_CHAPTERS } from '../.sim-test-build/src/story/campaign.js';
import { storyCinematic } from '../.sim-test-build/src/story/cinematics.js';
import { STORY_CAST_IDS, castMember, storyCast } from '../.sim-test-build/src/story/cast.js';
import { STORY_GOD_MODELS, storyGodModel } from '../.sim-test-build/src/story/godModels.js';

const BUILDS = ['fighter', 'colossus', 'construct', 'god', 'void'];
const HEX = /^#[0-9a-f]{6}$/;

const everyCast = () => STORY_CHAPTERS.map((chapter, index) => [chapter, storyCast(index), index]);

test('every chapter casts someone the stage can actually draw', () => {
  for (const [chapter, cast] of everyCast()) {
    assert.ok(cast.members.length > 0, `${chapter.id} has nobody opposite Glitch`);
    const ids = new Set(cast.members.map((member) => member.id));
    assert.equal(ids.size, cast.members.length, `${chapter.id} casts the same figure twice`);
    for (const member of cast.members) {
      assert.ok(BUILDS.includes(member.build), `${member.id}: ${member.build}`);
      assert.ok(member.signature.length > 0, member.id);
      for (const colour of [member.coat, member.shade, member.accent]) {
        assert.match(colour, HEX, `${member.id} has an unusable colour`);
      }
      assert.ok(member.name.length > 0 && member.nameRu.length > 0, member.id);
    }
  }
});

test('no chapter puts Glitch opposite Glitch, even as a drawing', () => {
  for (const [chapter, cast] of everyCast()) {
    for (const member of cast.members) {
      assert.notEqual(member.id, 'glitch', `${chapter.id} draws Glitch on both sides`);
    }
  }
  // The corrupted double is cast as the vessel, which is drawn as its own thing.
  assert.deepEqual(storyCast(8).members.map((member) => member.id), ['vessel']);
  assert.equal(storyCast(8).corrupted, true);
});

test('a rival chapter shows that rival, with the palette it fights in', () => {
  const rivals = [['silent-wall', 'mim'], ['winning-version', 'lucky'], ['last-order', 'titan'], ['all-the-pain', 'vorgh']];
  for (const [chapterId, characterId] of rivals) {
    const index = STORY_CHAPTERS.findIndex((chapter) => chapter.id === chapterId);
    const cast = storyCast(index);
    assert.deepEqual(cast.members.map((member) => member.id), [characterId]);
    assert.equal(cast.corrupted, false, `${chapterId} is a fight, not a possession`);
    const roster = CHARACTER_ROSTER.find((entry) => entry.id === characterId);
    assert.equal(cast.members[0].name, roster.displayName);
  }
  // The heavy is built like a heavy.
  assert.equal(castMember('titan').build, 'colossus');
});

test('the four laws stand as four gods, not as one silhouette repeated', () => {
  const index = STORY_CHAPTERS.findIndex((chapter) => chapter.id === 'four-laws');
  const cast = storyCast(index);
  assert.equal(cast.members.length, 4);
  assert.deepEqual(cast.members.map((member) => member.name), ['SPACE', 'MATTER', 'PROBABILITY', 'ENERGY']);
  for (const member of cast.members) {
    assert.equal(member.build, 'god');
  }
  // Every god carries a different emblem, or the row reads as one god four times.
  assert.equal(new Set(cast.members.map((member) => member.signature)).size, 4);
  assert.equal(new Set(cast.members.map((member) => member.accent)).size, 4);
  assert.equal(STORY_GOD_MODELS.length, 4);
  assert.equal(new Set(STORY_GOD_MODELS.map((model) => model.motion)).size, 4);
  assert.equal(new Set(STORY_GOD_MODELS.map((model) => model.silhouette)).size, 4);
  for (const member of cast.members) {
    const model = storyGodModel(member.id);
    assert.equal(model.id, member.id);
  }
});

test('the alliance and the ending are the same four rivals, one possessed and one free', () => {
  const at = (id) => storyCast(STORY_CHAPTERS.findIndex((chapter) => chapter.id === id));
  const fractured = at('fractured-alliance');
  const ending = at('zero-form');
  assert.deepEqual(
    fractured.members.map((member) => member.id),
    ending.members.map((member) => member.id),
  );
  assert.equal(fractured.corrupted, true);
  assert.equal(ending.corrupted, false);
});

test('a chorus chapter is cast as a chorus and a duel is cast as a duel', () => {
  for (const [chapter, cast, index] of everyCast()) {
    const expected = storyCinematic(index).side === 'chorus' ? 4 : 1;
    assert.equal(cast.members.length, expected, `${chapter.id} is staged for the wrong number`);
  }
});

test('every cast entry is reachable and clamped lookups still return a cast', () => {
  assert.ok(STORY_CAST_IDS.length >= 12);
  for (const id of STORY_CAST_IDS) assert.equal(castMember(id).id, id);
  assert.deepEqual(storyCast(-4), storyCast(0));
  assert.deepEqual(storyCast(99), storyCast(STORY_CHAPTERS.length - 1));
});
