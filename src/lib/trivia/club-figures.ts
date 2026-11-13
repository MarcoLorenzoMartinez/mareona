import rawHistoricalPlayers from '../../data/historical/club-all-time-players.json' with { type: 'json' };
import rawNotableFigures from '../../data/historical/club-historical-figures.json' with { type: 'json' };
import { normalizeSearchText } from '../utils/search-utils.ts';

export interface RawClubFigure {
  bdfId: number;
  name: string;
  fullName: string;
  position?: string;
  totalPlayed?: number;
}

export interface ClubFigure extends RawClubFigure {
  displayName: string;
  subLabel?: string;
}

const COMPOUND_FIRST_NAMES = new Set(['jose', 'juan', 'miguel', 'luis', 'victor']);

/**
 * Strips the second Spanish surname and unused middle baptismal names
 * to produce the natural football name (e.g., "Enrique Castro", "David Villa", "Joaquín Alonso").
 */
function getKnownFullName(fullName: string, alias: string): string {
  if (!fullName) return '';
  const rawParts = fullName.trim().split(/\s+/);
  if (rawParts.length <= 2) return fullName.trim();

  const parts: string[] = [];
  for (let i = 0; i < rawParts.length; i++) {
    const w = rawParts[i].toLowerCase();
    if ((w === 'de' || w === 'del') && i > 0 && i < rawParts.length - 1) {
      const nextW = rawParts[i + 1]?.toLowerCase();
      if (nextW === 'las' || nextW === 'los' || nextW === 'la') {
        parts.push(`${rawParts[i]} ${rawParts[i + 1]} ${rawParts[i + 2] ?? ''}`.trim());
        i += 2;
        continue;
      }
      continue;
    }
    parts.push(rawParts[i]);
  }

  if (parts.length <= 2) return parts.join(' ');

  // Russian patronymics (e.g. "Igor Anatolyevich Lediakhov" -> "Igor Lediakhov")
  if (
    parts.length === 3 &&
    normalizeSearchText(parts[1]).endsWith('vich') &&
    normalizeSearchText(parts[2]) === normalizeSearchText(alias)
  ) {
    return `${parts[0]} ${parts[2]}`;
  }

  const withoutSecondSurname = parts.slice(0, parts.length - 1);
  if (withoutSecondSurname.length === 3) {
    const firstNorm = normalizeSearchText(withoutSecondSurname[0]);
    if (!COMPOUND_FIRST_NAMES.has(firstNorm)) {
      return `${withoutSecondSurname[0]} ${withoutSecondSurname[2]}`;
    }
  }

  return withoutSecondSurname.join(' ');
}

/**
 * Computes the primary display name (known sporting name or alias) and optional
 * parenthetical clarification when the nickname differs from the given name.
 */
export function formatFigureDisplay(fig: RawClubFigure): { displayName: string; subLabel?: string } {
  const alias = (fig.name || '').trim();
  const knownFull = getKnownFullName(fig.fullName, alias);
  const normAlias = normalizeSearchText(alias);
  const normKnown = normalizeSearchText(knownFull);
  const normFull = normalizeSearchText(fig.fullName);

  if (!alias || normAlias === normKnown) {
    return { displayName: knownFull };
  }

  const fullWords = normFull.split(/\s+/);
  const knownWords = normKnown.split(/\s+/);
  const aliasWords = normAlias.split(/\s+/);

  if (aliasWords.length >= 2 && aliasWords.every((w) => fullWords.includes(w))) {
    const rawWords = fig.fullName.trim().split(/\s+/);
    if (rawWords.length === 3) {
      return { displayName: fig.fullName.trim() };
    }
    return { displayName: knownFull };
  }

  if (aliasWords.every((w) => knownWords.includes(w))) {
    return { displayName: knownFull };
  }

  const lastKnownWord = knownWords[knownWords.length - 1] ?? '';
  const lastAliasWord = aliasWords[aliasWords.length - 1] ?? '';
  if (
    aliasWords.length >= 2 &&
    (lastKnownWord === lastAliasWord || lastKnownWord.includes(lastAliasWord))
  ) {
    return { displayName: alias };
  }

  return { displayName: alias, subLabel: knownFull };
}

export const NOTABLE_HISTORICAL_FIGURES: readonly RawClubFigure[] =
  rawNotableFigures as RawClubFigure[];

/**
 * Builds the deduplicated catalog of all historical Sporting figures
 * (players with matches + notable non-playing club icons).
 */
function buildAllClubFigures(): ClubFigure[] {
  const seen = new Set<string>();
  const result: ClubFigure[] = [];

  for (const fig of NOTABLE_HISTORICAL_FIGURES) {
    seen.add(normalizeSearchText(fig.fullName));
    result.push({ ...fig, ...formatFigureDisplay(fig) });
  }

  const players = rawHistoricalPlayers as RawClubFigure[];
  for (const p of players) {
    if (!p.name || (p.totalPlayed ?? 0) <= 0) continue;
    const key = normalizeSearchText(p.fullName);
    if (!seen.has(key)) {
      seen.add(key);
      result.push({ ...p, ...formatFigureDisplay(p) });
    }
  }

  return result;
}

export const ALL_CLUB_FIGURES: readonly ClubFigure[] = buildAllClubFigures();

/**
 * Searches the catalog of Sporting figures strictly by person name or alias.
 * Roles and positions (e.g. president, coach) are strictly excluded from queries
 * to avoid revealing clues to trivia players.
 */
export function searchClubFigures(query: string, limit = 5): ClubFigure[] {
  const cleanQ = normalizeSearchText(query);
  if (cleanQ.length < 2) return [];

  const scored: { figure: ClubFigure; score: number }[] = [];

  for (const fig of ALL_CLUB_FIGURES) {
    const normDisplay = normalizeSearchText(fig.displayName);
    const normName = normalizeSearchText(fig.name);
    const normFull = normalizeSearchText(fig.fullName);

    const matchesDisplay = normDisplay.includes(cleanQ);
    const matchesName = normName.includes(cleanQ);
    const matchesFull = normFull.includes(cleanQ);

    if (!matchesDisplay && !matchesName && !matchesFull) {
      continue;
    }

    let score = 10;

    if (normDisplay === cleanQ || normName === cleanQ || normFull === cleanQ) {
      score += 1000;
    } else if (normDisplay.startsWith(cleanQ) || normName.startsWith(cleanQ)) {
      score += 500;
    } else if (normFull.startsWith(cleanQ)) {
      score += 400;
    } else {
      const words = `${normDisplay} ${normName} ${normFull}`.split(/\s+/);
      if (words.some((w) => w.startsWith(cleanQ))) {
        score += 250;
      }
    }

    score += Math.min(fig.totalPlayed ?? 0, 100);

    if ((fig.totalPlayed ?? 0) === 0 && (matchesDisplay || matchesName || matchesFull)) {
      score += 60;
    }

    scored.push({ figure: fig, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.figure);
}
