import type { Card, CardStatKey, TacticalFormation } from "./types.ts";
import { FORMATION_REQUIREMENTS, getCardStatValue } from "./combat.ts";
import { HISTORICAL_CARDS_SEED } from "./seed-data.ts";

/**
 * Builds a balanced AI lineup conforming strictly to the chosen formation.
 */
export function buildAiLineup(formation: TacticalFormation): Card[] {
  const req = FORMATION_REQUIREMENTS[formation];
  const playable = HISTORICAL_CARDS_SEED.filter((c) => !c.kind || c.kind === "player");
  const gks = playable.filter((c) => c.position === "goalkeeper");
  const defs = playable.filter((c) => c.position === "defender");
  const mids = playable.filter((c) => c.position === "midfielder");
  const fwds = playable.filter((c) => c.position === "forward");

  return [
    ...gks.slice(0, req.goalkeepers),
    ...defs.slice(0, req.defenders),
    ...mids.slice(0, req.midfielders),
    ...fwds.slice(0, req.forwards),
  ];
}

/**
 * Selects an attacking move for the AI: picks an available card and its highest relative stat.
 */
export function decideAiAttackMove(availableCards: readonly Card[]): {
  readonly card: Card;
  readonly statKey: CardStatKey;
} {
  const card = availableCards[Math.floor(Math.random() * availableCards.length)];
  const stats: readonly CardStatKey[] = ["matches_played", "attack_power", "defense_power", "ovr"];

  let bestStat: CardStatKey = "ovr";
  let maxVal = -1;

  for (const s of stats) {
    const val = getCardStatValue(card, s);
    // Normalize matches_played to 0-100 scale for comparison with 50-99 stats
    const normalized = s === "matches_played" ? Math.min(val / 5, 100) : val;
    if (normalized > maxVal) {
      maxVal = normalized;
      bestStat = s;
    }
  }

  return { card, statKey: bestStat };
}

/**
 * Selects a defense response for the AI given opponent's position and contested stat.
 * Free choice: AI can either contest with a strong card or discard a lower card.
 */
export function decideAiDefenseMove(
  availableCards: readonly Card[],
  contestedStat: CardStatKey
): Card {
  // Sort available cards by contested stat descending
  const sorted = [...availableCards].sort(
    (a, b) => getCardStatValue(b, contestedStat) - getCardStatValue(a, contestedStat)
  );

  // 70% chance to play the strongest available card, 30% tactical sacrifice
  if (Math.random() < 0.75 || sorted.length === 1) {
    return sorted[0];
  }
  return sorted[sorted.length - 1];
}
