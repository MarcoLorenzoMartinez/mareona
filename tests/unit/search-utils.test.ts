import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSearchText, matchesSearchQuery } from '../../src/lib/utils/search-utils.ts';

describe('Search and text normalization utilities', () => {
  it('normalizes common Spanish accents and tildes', () => {
    assert.equal(normalizeSearchText('Joaquín'), 'joaquin');
    assert.equal(normalizeSearchText('Álvarez'), 'alvarez');
    assert.equal(normalizeSearchText('MOLINÓN'), 'molinon');
    assert.equal(normalizeSearchText('Cádiz'), 'cadiz');
    assert.equal(normalizeSearchText('País Vasco'), 'pais vasco');
  });

  it('normalizes Eastern European diacritics like Šćepović', () => {
    assert.equal(normalizeSearchText('Šćepović'), 'scepovic');
    assert.equal(normalizeSearchText('Stefan Šćepović'), 'stefan scepovic');
    assert.equal(normalizeSearchText('Đorđe'), 'dorde');
    assert.equal(normalizeSearchText('Łukasz'), 'lukasz');
  });

  it('matches regardless of accents and case in matchesSearchQuery', () => {
    assert.equal(matchesSearchQuery('Šćepović', 'sc'), true);
    assert.equal(matchesSearchQuery('Šćepović', 'scepovic'), true);
    assert.equal(matchesSearchQuery('Šćepović', 'SCEPOVIC'), true);
    assert.equal(matchesSearchQuery('Joaquín', 'joaquin'), true);
    assert.equal(matchesSearchQuery('Joaquín Alonso', 'qui'), true);
    assert.equal(matchesSearchQuery('Atlético de Madrid', 'atletico'), true);
    assert.equal(matchesSearchQuery('Castilla y León', 'leon'), true);
    assert.equal(matchesSearchQuery('Castilla-La Mancha', 'mancha'), true);
  });

  it('handles empty, null, or undefined inputs gracefully', () => {
    assert.equal(normalizeSearchText(null), '');
    assert.equal(normalizeSearchText(undefined), '');
    assert.equal(normalizeSearchText('   '), '');
    assert.equal(matchesSearchQuery(null, 'sc'), false);
    assert.equal(matchesSearchQuery('test', null), false);
    assert.equal(matchesSearchQuery('test', ''), false);
  });
});
