import type { Card, PackTier, PackTierConfig } from "./types";

/**
 * Canonical configuration of the 3 Mareona card pack tiers.
 * Calibrated strictly to prevent card inflation while maintaining exciting daily progression.
 */
export const PACK_TIERS: Record<PackTier, PackTierConfig> = {
  aficionado: {
    tier: "aficionado",
    name: "Sobre Aficionado",
    cardCount: 2,
    subtitle: "Nivel Básico · 2 cartas",
    description: "Recompensa diaria por visitar Mareona. Contiene 2 cartas históricas.",
  },
  rojiblanco: {
    tier: "rojiblanco",
    name: "Sobre Rojiblanco",
    cardCount: 3,
    subtitle: "Nivel Intermedio · 3 cartas",
    description: "Recompensa por superar el reto diario. Contiene 3 cartas (mínimo 1 OVR ≥ 75).",
    minOvrGuaranteed: 75,
  },
  leyenda: {
    tier: "leyenda",
    name: "Sobre Leyenda",
    cardCount: 5,
    subtitle: "Nivel Élite · 5 cartas",
    description: "Recompensa por pronósticos y rachas. Contiene 5 cartas (1 Leyenda garantizada).",
    minOvrGuaranteed: 82,
    legendGuaranteed: true,
  },
};

/**
 * Fisher-Yates array shuffle.
 */
function shuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i]!;
    result[i] = result[j]!;
    result[j] = temp;
  }
  return result;
}

/**
 * Generates an authentic pack opening selection with tier-specific guarantees and anti-repeat protections.
 *
 * @param tier Pack tier to generate.
 * @param allCards Master catalog of historical cards.
 * @param ownedSlugs Optional set of card slugs already owned by the user for duplicate protection.
 * @returns Array of unique cards for the pack.
 */
export function generatePackCards(
  tier: PackTier,
  allCards: readonly Card[],
  ownedSlugs?: ReadonlySet<string>
): Card[] {
  if (allCards.length === 0) return [];

  const config = PACK_TIERS[tier];
  const targetCount = config.cardCount;
  const pickedSlugs = new Set<string>();
  const packCards: Card[] = [];

  // Helper to pick a candidate card matching a predicate
  const pickCandidate = (predicate: (c: Card) => boolean): Card | null => {
    const pool = allCards.filter((c) => !pickedSlugs.has(c.slug) && predicate(c));
    if (pool.length === 0) return null;
    const shuffled = shuffle(pool);
    return shuffled[0] ?? null;
  };

  if (tier === "leyenda") {
    // 1. Guaranteed Legend (OVR >= 82)
    // Anti-repeat protection: prioritize a legend that the user doesn't already own
    let legend = pickCandidate(
      (c) => (c.ovr ?? 70) >= 82 && (!ownedSlugs || !ownedSlugs.has(c.slug))
    );
    // Fallback if all legends are already owned
    if (!legend) {
      legend = pickCandidate((c) => (c.ovr ?? 70) >= 82);
    }
    if (legend) {
      pickedSlugs.add(legend.slug);
      packCards.push(legend);
    }

    // 2. High-value cards for the remaining 4 slots
    const highValuePool = allCards.filter(
      (c) =>
        !pickedSlugs.has(c.slug) &&
        ((c.ovr ?? 70) >= 76 || c.kind === "crest" || c.kind === "moment" || c.kind === "coach")
    );
    const shuffledHigh = shuffle(highValuePool);
    while (packCards.length < targetCount && shuffledHigh.length > 0) {
      const card = shuffledHigh.pop()!;
      if (!pickedSlugs.has(card.slug)) {
        pickedSlugs.add(card.slug);
        packCards.push(card);
      }
    }
  } else if (tier === "rojiblanco") {
    // 1. Guaranteed OVR >= 75 card
    const qualityCard = pickCandidate((c) => (c.ovr ?? 70) >= 75);
    if (qualityCard) {
      pickedSlugs.add(qualityCard.slug);
      packCards.push(qualityCard);
    }
  }

  // Fill remaining slots from the general pool
  const remainingPool = shuffle(allCards.filter((c) => !pickedSlugs.has(c.slug)));
  for (const card of remainingPool) {
    if (packCards.length >= targetCount) break;
    pickedSlugs.add(card.slug);
    packCards.push(card);
  }

  return packCards;
}
