import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SPORTING_WORD_CATALOG,
  getChallengeForDate,
  getDaysSinceEpoch,
  getHistoricalChallenges,
  getWordAppearanceCounts,
  isValidWordGuess,
} from '../../src/lib/wordle/words.ts';

describe('Sporting Words & Non-repeating Bag Suite', () => {
  it('loads more than 100 historical Sporting words in catalog', () => {
    assert.ok(SPORTING_WORD_CATALOG.length >= 100, `Catalog has ${SPORTING_WORD_CATALOG.length} words`);
  });

  it('guarantees no word repeats within a full round of length N', () => {
    const totalWords = SPORTING_WORD_CATALOG.length;
    const seenWords = new Set<string>();

    const [epochYear, epochMonth, epochDay] = [2026, 10, 1];

    for (let i = 0; i < totalWords; i++) {
      const d = new Date(Date.UTC(epochYear, epochMonth - 1, epochDay + i));
      const isoDate = d.toISOString().slice(0, 10);
      const challenge = getChallengeForDate(isoDate);

      assert.equal(
        seenWords.has(challenge.word),
        false,
        `Word ${challenge.word} repeated at day ${i} before all ${totalWords} words were used!`
      );
      seenWords.add(challenge.word);
    }

    assert.equal(seenWords.size, totalWords);
  });

  it('increments appearance counts accurately', () => {
    const testDate = '2026-10-10';
    const counts = getWordAppearanceCounts(testDate);
    const days = getDaysSinceEpoch(testDate) + 1; // inclusive
    const totalAppearances = Object.values(counts).reduce((a, b) => a + b, 0);

    assert.equal(totalAppearances, days);
    // In the first round, no word should have appeared more than once
    for (const word of Object.keys(counts)) {
      assert.equal(counts[word], 1);
    }
  });

  it('generates chronological historical challenges up to current date', () => {
    const history = getHistoricalChallenges('2026-10-05');
    // Day 0: 2026-10-01, Day 4: 2026-10-05 -> 5 items
    assert.equal(history.length, 5);
    assert.equal(history[0].id, '2026-10-05'); // newest first
    assert.equal(history[4].id, '2026-10-01');
  });

  describe('isValidWordGuess validation', () => {
    it('accepts common words, verb conjugations, and plurals', () => {
      assert.equal(isValidWordGuess('GATOS', 5), true);
      assert.equal(isValidWordGuess('CASAS', 5), true);
      assert.equal(isValidWordGuess('COMER', 5), true);
      assert.equal(isValidWordGuess('COMES', 5), true);
      assert.equal(isValidWordGuess('CANTABA', 7), true);
    });

    it('accepts Sporting de Gijón catalog words and player names including those with letter Ñ', () => {
      assert.equal(isValidWordGuess('QUINI', 5), true);
      assert.equal(isValidWordGuess('MAREO', 5), true);
      assert.equal(isValidWordGuess('MOLINON', 7), true);
      assert.equal(isValidWordGuess('ROJIBLANCO', 10), true);
      // Sporting players and terms containing Ñ
      assert.equal(isValidWordGuess('MARIÑO', 6), true);
      assert.equal(isValidWordGuess('mariño', 6), true);
      assert.equal(isValidWordGuess('ERAÑA', 5), true);
      assert.equal(isValidWordGuess('MUÑIZ', 5), true);
      assert.equal(isValidWordGuess('YAÑEZ', 5), true);
      assert.equal(isValidWordGuess('CASTAÑER', 8), true);
    });

    it('accepts valid Spanish words containing letter Ñ from dictionary', () => {
      assert.equal(isValidWordGuess('SEÑOR', 5), true);
      assert.equal(isValidWordGuess('SUEÑO', 5), true);
      assert.equal(isValidWordGuess('NIÑOS', 5), true);
      assert.equal(isValidWordGuess('BAÑOS', 5), true);
      assert.equal(isValidWordGuess('PAÑAL', 5), true);
    });

    it('rejects invalid, random strings and gibberish', () => {
      assert.equal(isValidWordGuess('ZZZZZ', 5), false);
      assert.equal(isValidWordGuess('AEIOU', 5), false);
      assert.equal(isValidWordGuess('ASDFG', 5), false);
      assert.equal(isValidWordGuess('QWERT', 5), false);
    });

    it('rejects words with incorrect length', () => {
      assert.equal(isValidWordGuess('GATO', 5), false);
      assert.equal(isValidWordGuess('GATOS', 4), false);
    });
  });
});
