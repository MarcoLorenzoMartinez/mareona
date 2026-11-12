import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeTriviaText,
  evaluateTriviaAnswer,
  getTriviaForDate,
  TRIVIA_QUESTIONS,
} from '../../src/lib/trivia/engine.ts';
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
