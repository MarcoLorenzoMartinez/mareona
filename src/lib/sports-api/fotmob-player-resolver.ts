import { normalizePlayerSearchKey } from "./player-stats-matcher.ts";

const FOTMOB_SPORTING_ID = 9869;
const FOTMOB_SPORTING_B_ID = 161746;
const FOTMOB_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
};

interface SquadMember {
  readonly id: number;
  readonly name: string;
  readonly shirtNumber?: number | null;
}

interface TeamSquadResponse {
  readonly squad?: {
    readonly squad?: ReadonlyArray<{ readonly members?: readonly SquadMember[] }>;
  };
}

interface SearchSuggestion {
  readonly type: string;
  readonly id: string | number;
  readonly name?: string;
  readonly teamName?: string;
  readonly teamId?: number;
}

interface SearchSuggestGroup {
  readonly suggestions?: readonly SearchSuggestion[];
}

/**
 * Canonical FotMob player IDs for Sporting Gijón canteranos and edge cases
 * where provider names or filial assignments (Sporting B) differ.
 */
export const CANONICAL_FOTMOB_SPORTING_PLAYERS: Readonly<Record<string, number>> = {
  "mata": 1971125,
  "diego matabuena": 1971125,
  "alex diego": 1847867,
  "alex diego garcia": 1847867,
  "enol prendes": 1748414,
  "christian ferreres": 2144593,
  "ferreres": 2144593,
  "miguel conde": 1833800,
  "bruno rubio": 2144594,
  "iker martinez": 1670129,
  "andres cuenca": 1665439,
};

/**
 * Resolves the FotMob player ID for a Real Sporting player.
 * Uses a robust 3-tier resolution strategy:
 * 1. Canonical academy dictionary (handles nicknames like Mata and filial-registered players like Enol Prendes).
 * 2. Official first-team squad endpoint with dorsal collision disambiguation.
 * 3. Dynamic search suggestion fallback for future academy debuts.
 *
 * @param shirtNumber - Shirt number of the player.
 * @param playerName - Display name of the player.
 * @param fullName - Optional full federative name of the player.
 * @returns FotMob player ID or null if unresolvable.
 */
export async function resolveSportingPlayerId(
  shirtNumber: number | null,
  playerName: string,
  fullName?: string | null
): Promise<number | null> {
  // Tier 1: Canonical academy mapping
  const searchKey = normalizePlayerSearchKey(playerName);
  if (CANONICAL_FOTMOB_SPORTING_PLAYERS[searchKey]) {
    return CANONICAL_FOTMOB_SPORTING_PLAYERS[searchKey];
  }

  const fullKey = fullName ? normalizePlayerSearchKey(fullName) : "";
  if (fullKey && CANONICAL_FOTMOB_SPORTING_PLAYERS[fullKey]) {
    return CANONICAL_FOTMOB_SPORTING_PLAYERS[fullKey];
  }

  // Tier 2: First-team squad roster lookup
  try {
    const res = await fetch(`https://www.fotmob.com/api/data/teams?id=${FOTMOB_SPORTING_ID}`, {
      headers: FOTMOB_HEADERS,
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = (await res.json()) as TeamSquadResponse;
      const members: SquadMember[] = [];
      for (const group of data.squad?.squad ?? []) {
        if (group.members) members.push(...group.members);
      }

      // Check by dorsal with collision disambiguation
      if (shirtNumber !== null) {
        const matchingDorsal = members.filter((m) => m.shirtNumber === shirtNumber);
        if (matchingDorsal.length === 1) {
          return matchingDorsal[0].id;
        }
        if (matchingDorsal.length > 1) {
          const byName = matchingDorsal.find((m) => {
            const mKey = normalizePlayerSearchKey(m.name);
            return mKey.includes(searchKey) || searchKey.includes(mKey) ||
                   (fullKey && (mKey.includes(fullKey) || fullKey.includes(mKey)));
          });
          return byName ? byName.id : matchingDorsal[0].id;
        }
      }

      // Check by normalized name
      const byName = members.find((m) => {
        const mKey = normalizePlayerSearchKey(m.name);
        return mKey.includes(searchKey) || searchKey.includes(mKey) ||
               (fullKey && (mKey.includes(fullKey) || fullKey.includes(mKey)));
      });

      if (byName) return byName.id;
    }
  } catch {
    // Graceful fallback to search tier
  }

  // Tier 3: Search suggest API fallback
  try {
    const queryTerm = fullName?.trim() || playerName.trim();
    const searchRes = await fetch(
      `https://www.fotmob.com/api/data/search/suggest?term=${encodeURIComponent(queryTerm)}`,
      { headers: FOTMOB_HEADERS, next: { revalidate: 3600 } }
    );

    if (searchRes.ok) {
      const suggestData = (await searchRes.json()) as readonly SearchSuggestGroup[];
      for (const grp of suggestData) {
        for (const s of grp.suggestions ?? []) {
          if (
            s.type === "player" &&
            (s.teamId === FOTMOB_SPORTING_ID ||
             s.teamId === FOTMOB_SPORTING_B_ID ||
             s.teamName?.toLowerCase().includes("sporting"))
          ) {
            const parsedId = typeof s.id === "number" ? s.id : parseInt(s.id, 10);
            if (!Number.isNaN(parsedId)) return parsedId;
          }
        }
      }
    }
  } catch {
    // Unresolvable
  }

  return null;
}
