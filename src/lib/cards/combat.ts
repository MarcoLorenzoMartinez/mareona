import type { Card, CardStatKey, TacticalFormation, TacticalSlotRequirement } from "./types.ts";

export const FORMATION_REQUIREMENTS: Record<TacticalFormation, TacticalSlotRequirement> = {
  "4-3-3": { goalkeepers: 1, defenders: 4, midfielders: 3, forwards: 3 },
  "4-4-2": { goalkeepers: 1, defenders: 4, midfielders: 4, forwards: 2 },
  "3-5-2": { goalkeepers: 1, defenders: 3, midfielders: 5, forwards: 2 },
  "4-5-1": { goalkeepers: 1, defenders: 4, midfielders: 5, forwards: 1 },
  "3-4-3": { goalkeepers: 1, defenders: 3, midfielders: 4, forwards: 3 },
  "5-3-2": { goalkeepers: 1, defenders: 5, midfielders: 3, forwards: 2 },
  "5-2-3": { goalkeepers: 1, defenders: 5, midfielders: 2, forwards: 3 },
  "4-2-3-1": { goalkeepers: 1, defenders: 4, midfielders: 5, forwards: 1 },
};

/**
 * Resolves a head-to-head stat duel between two cards.
 *
 * @param hostCard The card played by the round initiator.
 * @param guestCard The card played by the defender.
 * @param statKey The selected stat contested in this round.
 * @returns "host" if host value is higher, "guest" if guest is higher, or "tie".
 */
export function resolveCardStatComparison(
  hostCard: Card,
  guestCard: Card,
  statKey: CardStatKey
): "host" | "guest" | "tie" {
  const hostVal = getCardStatValue(hostCard, statKey);
  const guestVal = getCardStatValue(guestCard, statKey);

  if (hostVal > guestVal) return "host";
  if (guestVal > hostVal) return "guest";
  return "tie";
}

/**
 * Extracts numeric value for the requested stat key.
 */
export function getCardStatValue(card: Card, statKey: CardStatKey): number {
  switch (statKey) {
    case "matches_played":
      return card.matchesPlayed ?? 0;
    case "attack_power":
      return card.attackPower ?? 0;
    case "defense_power":
      return card.defensePower ?? 0;
    case "ovr":
      return card.ovr ?? 0;
  }
}

/**
 * Validates if a set of 11 cards conforms to the requirements of the chosen formation.
 */
export function validateTacticalFormation(
  formation: TacticalFormation,
  cards: readonly Card[]
): { readonly isValid: boolean; readonly reason?: string } {
  if (cards.length !== 11) {
    return { isValid: false, reason: "Debe haber exactamente 11 cartas alineadas" };
  }

  const req = FORMATION_REQUIREMENTS[formation];
  const counts = { goalkeeper: 0, defender: 0, midfielder: 0, forward: 0 };

  for (const card of cards) {
    if (!card.position) {
      return {
        isValid: false,
        reason: `La carta ${card.knownAs} no es un futbolista de campo para competir`,
      };
    }
    counts[card.position]++;
  }

  if (counts.goalkeeper !== req.goalkeepers) {
    return {
      isValid: false,
      reason: `La formación ${formation} requiere ${req.goalkeepers} portero(s), se encontraron ${counts.goalkeeper}`,
    };
  }
  if (counts.defender !== req.defenders) {
    return {
      isValid: false,
      reason: `La formación ${formation} requiere ${req.defenders} defensas, se encontraron ${counts.defender}`,
    };
  }
  if (counts.midfielder !== req.midfielders) {
    return {
      isValid: false,
      reason: `La formación ${formation} requiere ${req.midfielders} centrocampistas, se encontraron ${counts.midfielder}`,
    };
  }
  if (counts.forward !== req.forwards) {
    return {
      isValid: false,
      reason: `La formación ${formation} requiere ${req.forwards} delanteros, se encontraron ${counts.forward}`,
    };
  }

  return { isValid: true };
}
