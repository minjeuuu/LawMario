import test from 'node:test';
import assert from 'node:assert/strict';
import {
  shuffleChoiceOptionsSafely,
  MARIO_WORLD_ELEMENTS,
  getRandomMarioWorldElement,
  filterTopicsByWorldAndQuery,
  TOPIC_DUEL_PAIRS,
} from './round14Improvements';
import { ALL_LAW_TOPICS } from '../data/laborLawData';

test('shuffleChoiceOptionsSafely correctly tracks correct answer across random swaps', () => {
  const options = ['Option A (Correct)', 'Option B', 'Option C', 'Option D'];
  const correctIndex = 0;

  // Run 20 iterations with varied pseudo-random seeds
  for (let seed = 1; seed <= 20; seed++) {
    const fakeRng = () => ((seed * 9301 + 49297) % 233280) / 233280;
    const shuffled = shuffleChoiceOptionsSafely(options, correctIndex, fakeRng);

    assert.equal(shuffled.options.length, 4);
    assert.ok(shuffled.correctIndex >= 0 && shuffled.correctIndex < 4);
    assert.equal(shuffled.options[shuffled.correctIndex], 'Option A (Correct)');
  }
});

test('MARIO_WORLD_ELEMENTS provides at least 8 unique labor law parallels with quotes and icons', () => {
  assert.ok(MARIO_WORLD_ELEMENTS.length >= 8);
  const element = getRandomMarioWorldElement();
  assert.ok(element.name.length > 0);
  assert.ok(element.laborConcept.length > 0);
  assert.ok(element.articleCitation.length > 0);
  assert.ok(element.quote.length > 0);
});

test('filterTopicsByWorldAndQuery accurately filters topics by world and search term', () => {
  const all = filterTopicsByWorldAndQuery(ALL_LAW_TOPICS, 'all', '');
  assert.equal(all.length, ALL_LAW_TOPICS.length);

  const world1Only = filterTopicsByWorldAndQuery(ALL_LAW_TOPICS, 'world1', '');
  assert.ok(world1Only.every((t) => t.worldId === 'world1'));
  assert.ok(world1Only.length > 0);

  const overtimeQuery = filterTopicsByWorldAndQuery(ALL_LAW_TOPICS, 'world1', 'overtime');
  assert.ok(overtimeQuery.length > 0);
  assert.ok(overtimeQuery.every((t) => t.worldId === 'world1'));
});

test('TOPIC_DUEL_PAIRS defines comparative doctrine analysis between statutory twins', () => {
  assert.ok(TOPIC_DUEL_PAIRS.length >= 4);
  const holidayDuel = TOPIC_DUEL_PAIRS.find((d) => d.id === 'duel_regular_vs_special_holiday');
  assert.ok(holidayDuel);
  assert.equal(holidayDuel.conceptA.name.includes('Regular Holiday'), true);
  assert.equal(holidayDuel.conceptB.name.includes('Special Non-Working'), true);
  assert.ok(holidayDuel.pivotalDistinction.length > 10);
});
