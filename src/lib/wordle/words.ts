import type { WordleDailyWord } from './types';
import { normalizeWord } from './engine';

/**
 * Historical archive of daily Sportinguista words.
 * Full, non-truncated names and concepts from Sporting history.
 * Ordered chronologically by challenge date.
 */
export const SPORTING_DAILY_WORDS: WordleDailyWord[] = [
  {
    id: '2026-10-20',
    word: 'QUINI',
    trivia: 'Enrique Castro "Quini", El Brujo. Máximo goleador histórico del Sporting y leyenda eterna del fútbol español con 7 Trofeos Pichichi.',
  },
  {
    id: '2026-10-21',
    word: 'MOLINON',
    trivia: 'El Molinón - Enrique Castro Quini, el estadio de fútbol profesional más antiguo de España, inaugurado en 1908.',
  },
  {
    id: '2026-10-22',
    word: 'MAREO',
    trivia: 'Escuela de Fútbol de Mareo, templo y cantera de Mareona inaugurada en 1978, cuna de decenas de internacionales.',
  },
  {
    id: '2026-10-23',
    word: 'PRECIADO',
    trivia: 'Manolo Preciado, inolvidable técnico rojiblanco artífice del ascenso a Primera en 2008 y del retorno a la élite.',
  },
  {
    id: '2026-10-24',
    word: 'ABLANEDO',
    trivia: 'Juan Carlos Ablanedo, "El Gatu", portero irrepetible y triple Trofeo Zamora formado íntegramente en Mareo.',
  },
  {
    id: '2026-10-25',
    word: 'MAREONA',
    trivia: 'La Mareona, la fiel e incansable afición rojiblanca que tiñe de rojo y blanco cualquier estadio de España.',
  },
  {
    id: '2026-10-26',
    word: 'FERRERO',
    trivia: 'Enzo Ferrero, extremo argentino legendario y uno de los extranjeros más queridos de la historia del Sporting.',
  },
  {
    id: '2026-10-27',
    word: 'CHURRUCA',
    trivia: 'Iñaki Churruca, extremo zurdo magistral que formó junto a Quini una de las delanteras más temibles de Europa.',
  },
  {
    id: '2026-10-28',
    word: 'ROJIBLANCO',
    trivia: 'Los colores rojiblancos que representan la bandera de Gijón y la camiseta del Real Sporting desde 1905.',
  },
  {
    id: '2026-10-29',
    word: 'CASTRO',
    trivia: 'Jesús Castro, hermano de Quini y heroico portero del Sporting que salvó la vida de dos niños en la playa de Pechón.',
  },
  {
    id: '2026-10-30',
    word: 'JUANELE',
    trivia: 'Juan Alberto Juanele, talento puro de Mareo, genio del regate y figura de la década de los 90.',
  },
  {
    id: '2026-10-31',
    word: 'COTE',
    trivia: 'José Ángel Valdés "Cote", canterano de Roces y Mareo, lateral incansable que regresó para ser capitán del equipo.',
  },
  {
    id: '2026-11-01',
    word: 'DERBI',
    trivia: 'El Derbi Asturiano, una de las mayores rivalidades del fútbol español entre el Real Sporting y el Real Oviedo.',
  },
  {
    id: '2026-11-02',
    word: 'MANJARIN',
    trivia: 'Javier Manjarín, delantero formado en Mareo, campeón olímpico en Barcelona 92 y figura del club.',
  },
  {
    id: '2026-11-03',
    word: 'CIRI',
    trivia: 'Ciriaco Cano, histórico centrocampista y posteriormente entrenador rojiblanco en varias etapas clave.',
  },
  {
    id: '2026-11-04',
    word: 'GUAYES',
    trivia: 'Los guajes de Mareo, apelativo cariñoso a la cantera joven del Sporting que nutre al primer equipo.',
  },
  {
    id: '2026-11-05',
    word: 'PILES',
    trivia: 'El río Piles, que bordea el estadio de El Molinón antes de desembocar en la playa de San Lorenzo.',
  },
];

/**
 * Returns the challenge for a specific ISO date (YYYY-MM-DD).
 * Defaults to the latest available or modulo cycle if date is outside range.
 */
export function getChallengeForDate(dateStr: string): WordleDailyWord {
  const exact = SPORTING_DAILY_WORDS.find((item) => item.id === dateStr);
  if (exact) return exact;

  // Fallback: stable modulo hash of the date string to pick a deterministic challenge
  const hash = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = Math.abs(hash) % SPORTING_DAILY_WORDS.length;
  const picked = SPORTING_DAILY_WORDS[index];
  return {
    ...picked,
    id: dateStr,
  };
}

/**
 * Gets today's challenge based on Europe/Madrid timezone (CET/CEST) where midnight resets.
 */
export function getTodayChallenge(): WordleDailyWord {
  // Format current date in Europe/Madrid timezone as 'YYYY-MM-DD'
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const todayDateStr = formatter.format(new Date());
  return getChallengeForDate(todayDateStr);
}

/**
 * Validates whether a guess is valid.
 * Word must match the target length and contain only letters.
 */
export function isValidWordGuess(guess: string, targetLength: number): boolean {
  const norm = normalizeWord(guess);
  if (norm.length !== targetLength) return false;
  // Verify standard letters including Ñ
  return /^[A-ZÑ]+$/.test(norm);
}
