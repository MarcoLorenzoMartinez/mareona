import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeTriviaText,
  evaluateTriviaAnswer,
  getTriviaForDate,
  TRIVIA_QUESTIONS,
} from '../../src/lib/trivia/engine.ts';
import { searchClubFigures } from '../../src/lib/trivia/club-figures.ts';
import type { TriviaQuestion } from '../../src/lib/trivia/types.ts';

describe('Trivia Engine Suite', () => {
  it('normalizes diacritics, case, and whitespace', () => {
    assert.equal(normalizeTriviaText('  Enrique Castro "Quini"  '), 'enrique castro quini');
    assert.equal(normalizeTriviaText('Joaquín Alonso González'), 'joaquin alonso gonzalez');
    assert.equal(normalizeTriviaText('1978 / 79'), '1978 / 79');
  });

  it('evaluates answers correctly regardless of accents or casing', () => {
    const question: TriviaQuestion = {
      id: 'test-1',
      question: '¿Quién es el máximo goleador?',
      type: 'player',
      canonicalAnswer: 'Quini',
      acceptedAnswers: ['quini', 'enrique castro quini', 'enrique de castro gonzalez'],
      explanation: 'Explicación de prueba.',
    };

    assert.equal(evaluateTriviaAnswer('QUINI', question), true);
    assert.equal(evaluateTriviaAnswer('Quini', question), true);
    assert.equal(evaluateTriviaAnswer('Enrique Castro Quini', question), true);
    assert.equal(evaluateTriviaAnswer('Ablanedo', question), false);
  });

  it('matches player questions seamlessly between nickname and full legal name', () => {
    const question: TriviaQuestion = {
      id: 'test-sergio',
      question: '¿Quién marcó el gol de la permanencia?',
      type: 'player',
      canonicalAnswer: 'Sergio Álvarez',
      acceptedAnswers: ['sergio alvarez', 'sergio'],
      explanation: 'Gol ante el Villarreal.',
    };

    // 'Sergio Álvarez Díaz' is his fullName in club-all-time-players.json
    assert.equal(evaluateTriviaAnswer('Sergio Álvarez Díaz', question), true);
    assert.equal(evaluateTriviaAnswer('Sergio Álvarez', question), true);
    assert.equal(evaluateTriviaAnswer('Sergio', question), true);
  });

  it('evaluates presidents and non-playing historical figures like Anselmo López and Carriega', () => {
    const anselmoQuestion = TRIVIA_QUESTIONS.find((q) => q.id === 'q-first-president-1905')!;
    assert.ok(anselmoQuestion, 'Question q-first-president-1905 must exist');

    // Both direct typing and catalog selection must evaluate to true
    assert.equal(evaluateTriviaAnswer('anselmo', anselmoQuestion), true);
    assert.equal(evaluateTriviaAnswer('Anselmo López', anselmoQuestion), true);
    assert.equal(evaluateTriviaAnswer('Anselmo López Sánchez', anselmoQuestion), true);
    assert.equal(evaluateTriviaAnswer('anselmo lopez', anselmoQuestion), true);

    const carriegaQuestion = TRIVIA_QUESTIONS.find((q) => q.id === 'q-coach-ascenso-1970')!;
    assert.ok(carriegaQuestion, 'Question q-coach-ascenso-1970 must exist');
    assert.equal(evaluateTriviaAnswer('Carriega', carriegaQuestion), true);
    assert.equal(evaluateTriviaAnswer('Luis Cid Carriega', carriegaQuestion), true);
    assert.equal(evaluateTriviaAnswer('luis cid', carriegaQuestion), true);

    const vegaQuestion = TRIVIA_QUESTIONS.find((q) => q.id === 'q-president-golden-era')!;
    assert.ok(vegaQuestion, 'Question q-president-golden-era must exist');
    assert.equal(evaluateTriviaAnswer('Manuel Vega-Arango', vegaQuestion), true);
    assert.equal(evaluateTriviaAnswer('Manuel Vega-Arango Alvaré', vegaQuestion), true);
    assert.equal(evaluateTriviaAnswer('vega-arango', vegaQuestion), true);
  });

  it('searches and ranks club figures autocomplete accurately with natural display names', () => {
    const anselmoMatches = searchClubFigures('anselmo');
    assert.ok(anselmoMatches.length > 0);
    assert.equal(anselmoMatches[0].displayName, 'Anselmo López');
    assert.equal(anselmoMatches[0].subLabel, undefined);

    const quiniMatches = searchClubFigures('quini');
    assert.ok(quiniMatches.length > 0);
    assert.equal(quiniMatches[0].displayName, 'Quini');
    assert.equal(quiniMatches[0].subLabel, 'Enrique Castro');

    const cundiMatches = searchClubFigures('cundi');
    assert.ok(cundiMatches.length > 0);
    assert.equal(cundiMatches[0].displayName, 'Cundi');
    assert.equal(cundiMatches[0].subLabel, 'Secundino Suárez');

    const villaMatches = searchClubFigures('villa');
    assert.ok(villaMatches.some((f) => f.displayName === 'David Villa' && !f.subLabel));

    const vegaMatches = searchClubFigures('vega-arango');
    assert.ok(vegaMatches.length > 0);
    assert.equal(vegaMatches[0].displayName, 'Manuel Vega-Arango');
    assert.equal(vegaMatches[0].subLabel, undefined);

    // Role terms like 'presidente' or 'entrenador' must NOT return results (names only)
    const presidentMatches = searchClubFigures('presidente', 10);
    assert.equal(presidentMatches.length, 0, 'Role terms must not be searchable');

    // Searching real names matches figures without revealing their roles
    const fernandoMatches = searchClubFigures('fernando', 5);
    assert.ok(fernandoMatches.some((f) => f.displayName === 'Fernando Fernández Quirós'));
  });

  it('contains at least 100 historical questions in catalog', () => {
    assert.ok(TRIVIA_QUESTIONS.length >= 100);
  });

  it('guarantees no question repeats within a full cycle of length N', () => {
    const total = TRIVIA_QUESTIONS.length;
    const seenIds = new Set<string>();

    for (let i = 0; i < total; i++) {
      const d = new Date(Date.UTC(2026, 10, 13 + i));
      const iso = d.toISOString().split('T')[0];
      const challenge = getTriviaForDate(iso);
      seenIds.add(challenge.question.id);
    }

    assert.equal(seenIds.size, total);
  });
});
