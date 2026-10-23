import type { Card } from "@/lib/cards/types";

export const CARDS_PER_PAGE = 12;

export interface AlbumChapter {
  readonly id: string;
  readonly label: string;
  readonly startPage: number;
  readonly endPage: number;
  readonly eraSubtitle: string;
}

export function getCardChronologicalWeight(card: Card): number {
  if (card.kind === "crest") return 1000;
  if (card.kind === "moment") return 9000;
  if (card.kind === "coach") return 8000;

  const decadeWeight: Record<string, number> = {
    "1920s": 2000,
    "1930s": 2500,
    "1940s": 3000,
    "1950s": 4000,
    "1960s": 5000,
    "1970s": 6000,
    "1980s": 7000,
    "1990s": 7500,
    "2000s": 7800,
    "2010s": 7900,
    "2020s": 7950,
  };

  const base = decadeWeight[card.decade] ?? 5000;
  const yearOffset = card.year ? card.year - 1900 : 0;
  return base + yearOffset;
}

/**
 * Sorts cards strictly chronologically for the album progression.
 */
export function sortCardsChronologically(cards: readonly Card[]): Card[] {
  return [...cards].sort((a, b) => {
    const wa = getCardChronologicalWeight(a);
    const wb = getCardChronologicalWeight(b);
    if (wa !== wb) return wa - wb;
    return a.knownAs.localeCompare(b.knownAs);
  });
}

/**
 * Paginates an array of cards into fixed-size chunks of CARDS_PER_PAGE.
 */
export function paginateCards(cards: readonly Card[], pageSize = CARDS_PER_PAGE): Card[][] {
  if (cards.length === 0) return [[]];
  const pages: Card[][] = [];
  for (let i = 0; i < cards.length; i += pageSize) {
    pages.push(cards.slice(i, i + pageSize));
  }
  return pages;
}

const CHAPTER_TITLES: Record<string, { label: string; subtitle: string }> = {
  crests: { label: "Escudos", subtitle: "Orígenes e Identidad (1905–Hoy)" },
  "1920s": { label: "Años 20 y 30", subtitle: "Primeros Pasos y Liga (1920–1939)" },
  "1930s": { label: "Años 20 y 30", subtitle: "Primeros Pasos y Liga (1920–1939)" },
  "1940s": { label: "Años 40 y 50", subtitle: "Primer Ascenso a Primera (1940–1959)" },
  "1950s": { label: "Años 40 y 50", subtitle: "Primer Ascenso a Primera (1940–1959)" },
  "1960s": { label: "Años 60", subtitle: "Asentamiento en Primera (1960–1969)" },
  "1970s": { label: "Años 70", subtitle: "La Década Dorada y Quini (1970–1979)" },
  "1980s": { label: "Años 80", subtitle: "El EuroSporting y Copa UEFA (1980–1989)" },
  "1990s": { label: "Años 90", subtitle: "Gesta en Belgrado y Desafíos (1990–1999)" },
  "2000s": { label: "Años 2000", subtitle: "Era Villa y Ascenso de Preciado (2000–2015)" },
  "2010s": { label: "2015–Hoy", subtitle: "Los Guajes y Época Actual (2015–Hoy)" },
  "2020s": { label: "2015–Hoy", subtitle: "Los Guajes y Época Actual (2015–Hoy)" },
  coaches: { label: "Místers", subtitle: "Técnicos que Forjaron la Historia" },
  moments: { label: "Momentos", subtitle: "Partidos y Gestas Legendarias" },
};

/**
 * Computes logical chapters mapping directly to page numbers in the paginated album.
 */
export function computeAlbumChapters(pages: readonly Card[][]): AlbumChapter[] {
  const chapters: AlbumChapter[] = [];
  let currentKey = "";

  pages.forEach((pageCards, pageIdx) => {
    const pageNum = pageIdx + 1;
    const firstCard = pageCards[0];
    if (!firstCard) return;

    const rawKey =
      firstCard.kind === "crest"
        ? "crests"
        : firstCard.kind === "moment"
          ? "moments"
          : firstCard.kind === "coach"
            ? "coaches"
            : firstCard.decade;

    const meta = CHAPTER_TITLES[rawKey] ?? { label: rawKey, subtitle: "" };
    const label = meta.label;

    if (label !== currentKey) {
      currentKey = label;
      chapters.push({
        id: `chapter-${pageNum}`,
        label,
        startPage: pageNum,
        endPage: pageNum,
        eraSubtitle: meta.subtitle,
      });
    } else if (chapters.length > 0) {
      const last = chapters[chapters.length - 1];
      chapters[chapters.length - 1] = {
        ...last,
        endPage: pageNum,
      };
    }
  });

  return chapters;
}
