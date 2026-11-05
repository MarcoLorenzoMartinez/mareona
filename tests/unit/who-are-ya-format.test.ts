import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getNationalityFlagUrl, getPositionAbbr } from '../../src/lib/who-are-ya/format.ts';

describe('Who Are Ya Format Helpers', () => {
  it('maps Spain nationality to Spanish flag image URL', () => {
    assert.strictEqual(getNationalityFlagUrl('España'), 'https://flagcdn.com/w80/es.png');
  });

  it('maps other common nationalities in catalog', () => {
    assert.strictEqual(getNationalityFlagUrl('Argentina'), 'https://flagcdn.com/w80/ar.png');
    assert.strictEqual(getNationalityFlagUrl('Uruguay'), 'https://flagcdn.com/w80/uy.png');
    assert.strictEqual(getNationalityFlagUrl('Rusia'), 'https://flagcdn.com/w80/ru.png');
  });

  it('maps positions to clean 3-letter abbreviations', () => {
    assert.strictEqual(getPositionAbbr('Portero'), 'POR');
    assert.strictEqual(getPositionAbbr('Defensa'), 'DEF');
    assert.strictEqual(getPositionAbbr('Centrocampista'), 'MED');
    assert.strictEqual(getPositionAbbr('Delantero'), 'DEL');
  });
});
