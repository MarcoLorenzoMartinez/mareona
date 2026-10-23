"use client"; // Client: Vista de álbum físico con pliegos y casillas troqueladas

import type { Card } from "@/lib/cards/types";
import { HistoricalCard } from "@/components/cards/historical-card";
import { AlbumPageSpread } from "./album-page-spread";
import { AlbumCardSlot } from "./album-card-slot";
import { AlbumPastedCard } from "./album-pasted-card";

interface AlbumSpreadViewProps {
  readonly cards: readonly Card[];
  readonly getCardStatus: (slug: string) => { isOwned: boolean; quantity: number };
  /** Set of card slugs that were just acquired in this session */
  readonly newlyAcquiredSlugs?: ReadonlySet<string>;
}

interface CardGroup {
  title: string;
  subtitle: string;
  cards: Card[];
}

function getGroupKey(card: Card): string {
  if (card.kind === "coach") return "coaches";
  if (card.kind === "moment") return "moments";
  if (card.kind === "crest") return "crests";
  return card.decade;
}

const GROUP_META: Record<string, { title: string; subtitle: string }> = {
  "1920s": { title: "Años 20 y 30", subtitle: "Los Orígenes del Club · 1920 – 1939" },
  "1930s": { title: "Años 20 y 30", subtitle: "Los Orígenes del Club · 1920 – 1939" },
  "1940s": { title: "Años 40 y 50", subtitle: "Los Primeros Pasos en Primera · 1940 – 1959" },
  "1950s": { title: "Años 40 y 50", subtitle: "Los Primeros Pasos en Primera · 1940 – 1959" },
  "1960s": { title: "Años 60", subtitle: "Consolidación en la Élite · 1960 – 1969" },
  "1970s": { title: "La Década Dorada", subtitle: "EuroSporting · Quini · Subcampeones de Liga · 1970 – 1979" },
  "1980s": { title: "Años 80", subtitle: "Copa de la UEFA · Boskov · Ablanedo · 1980 – 1989" },
  "1990s": { title: "Años 90", subtitle: "La Gesta de Belgrado · Descenso y Regreso · 1990 – 1999" },
  "2000s": { title: "Años 2000", subtitle: "Ascenso de 2008 · David Villa · Preciado · 2000 – 2015" },
  "2010s": { title: "Años 2010 y 2020", subtitle: "Ascenso de los Guajes · Segunda División · 2015 – hoy" },
  "2020s": { title: "Años 2010 y 2020", subtitle: "Ascenso de los Guajes · Segunda División · 2015 – hoy" },
  coaches: { title: "Místers de Leyenda", subtitle: "Los Técnicos que Marcaron la Historia del Club" },
  moments: { title: "Grandes Momentos", subtitle: "Gestas Históricas e Hitos Imborrables del Real Sporting" },
  crests: { title: "Escudos Históricos", subtitle: "La Evolución del Escudo Rojiblanco · 1905 – Hoy" },
};

function groupCards(cards: readonly Card[]): CardGroup[] {
  const map = new Map<string, Card[]>();
  for (const card of cards) {
    const key = getGroupKey(card);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(card);
  }

  // Merge decade groups that share the same title
  const merged = new Map<string, Card[]>();
  for (const [key, groupCards] of map) {
    const meta = GROUP_META[key];
    const title = meta?.title ?? key;
    if (!merged.has(title)) merged.set(title, []);
    merged.get(title)!.push(...groupCards);
  }

  const order = [
    "Años 20 y 30",
    "Años 40 y 50",
    "Años 60",
    "La Década Dorada",
    "Años 80",
    "Años 90",
    "Años 2000",
    "Años 2010 y 2020",
    "Místers de Leyenda",
    "Grandes Momentos",
    "Escudos Históricos",
  ];

  const result: CardGroup[] = [];
  for (const title of order) {
    const groupCards = merged.get(title);
    if (!groupCards || groupCards.length === 0) continue;
    // Find the subtitle from the first key that maps to this title
    const firstKey = [...map.keys()].find((k) => (GROUP_META[k]?.title ?? k) === title) ?? title;
    const subtitle = GROUP_META[firstKey]?.subtitle ?? "";
    result.push({ title, subtitle, cards: groupCards });
  }

  return result;
}

export function AlbumSpreadView({
  cards,
  getCardStatus,
  newlyAcquiredSlugs = new Set(),
}: AlbumSpreadViewProps) {
  const groups = groupCards(cards);

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => {
        const ownedInGroup = group.cards.filter(
          (c) => getCardStatus(c.slug).isOwned
        ).length;
        const progress = group.cards.length > 0 ? ownedInGroup / group.cards.length : 0;

        return (
          <AlbumPageSpread
            key={group.title}
            pageTitle={group.title}
            pageSubtitle={group.subtitle}
            progress={progress}
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
              {group.cards.map((card, idx) => {
                const { isOwned } = getCardStatus(card.slug);
                const isNew = newlyAcquiredSlugs.has(card.slug);

                return (
                  <div key={card.id} className="relative w-full">
                    {isOwned ? (
                      <AlbumPastedCard rotationSeed={idx} isNew={isNew}>
                        <HistoricalCard card={card} isOwned size="sm" />
                      </AlbumPastedCard>
                    ) : (
                      <AlbumCardSlot card={card} cardNumber={idx + 1} />
                    )}
                  </div>
                );
              })}
            </div>
          </AlbumPageSpread>
        );
      })}
    </div>
  );
}
