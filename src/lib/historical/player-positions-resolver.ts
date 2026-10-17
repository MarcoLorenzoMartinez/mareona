import https from "node:https";
import initialCache from "../../data/historical/player-positions-cache.json" with { type: "json" };
import type { HistoricalMatchPlayer } from "./types";

/** Memory cache initialized with bundled seed data for instant (0 ms) lookups */
const positionsCache = new Map<string, string>(Object.entries(initialCache as Record<string, string>));

/**
 * Extracts official player position from BDFutbol profile HTML page.
 *
 * @param playerId Unique BDFutbol player numeric identifier.
 * @returns Canonical Spanish position (Portero, Defensa, Centrocampista, Delantero) or null.
 */
function fetchBdfutbolPosition(playerId: string): Promise<string | null> {
  const url = `https://www.bdfutbol.com/es/j/j${encodeURIComponent(playerId)}.html`;

  return new Promise((resolve) => {
    const req = https.get(url, { rejectUnauthorized: false }, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        resolve(null);
        return;
      }
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        const demSection = data.match(
          /<div>Demarcaci[óo]n<\/div>[\s\S]*?<div class="font-weight-bold">([\s\S]*?)<\/div>/i
        )?.[1];

        if (demSection) {
          const directMatch = demSection.match(/(Portero|Defensa|Centrocampista|Delantero)/i)?.[1];
          if (directMatch) {
            resolve(directMatch);
            return;
          }
          if (demSection.includes("por")) { resolve("Portero"); return; }
          if (demSection.includes("def")) { resolve("Defensa"); return; }
          if (demSection.includes("mig")) { resolve("Centrocampista"); return; }
          if (demSection.includes("dav")) { resolve("Delantero"); return; }
        }
        resolve(null);
      });
    });

    req.on("error", () => resolve(null));
    req.setTimeout(1200, () => {
      req.destroy();
      resolve(null);
    });
  });
}

/**
 * Infers tactical positions for starting XI players based on official line-up order.
 * In historical and contemporary Spanish football records, lineups are recorded in strict
 * tactical sequence from goalkeeper to forward line.
 *
 * @param starters Array of starting players.
 * @param startYear Starting calendar year of the season to determine tactical era.
 */
export function inferTacticalPositions(starters: HistoricalMatchPlayer[], startYear?: number): void {
  if (starters.length === 0) return;

  // The first player in official match report line-ups is invariably the goalkeeper
  if (!starters[0].position) {
    starters[0].position = "Portero";
  }

  const isWmEra = startYear !== undefined && startYear <= 1965;
  const defCount = isWmEra ? 3 : 4;
  const midCount = isWmEra ? 3 : 4;

  for (let i = 1; i < starters.length; i++) {
    if (starters[i].position) continue;

    if (i <= defCount) {
      starters[i].position = "Defensa";
    } else if (i <= defCount + midCount) {
      starters[i].position = "Centrocampista";
    } else {
      starters[i].position = "Delantero";
    }
  }
}

/**
 * Resolves positions for rival squad players using a multi-tiered strategy:
 * 1. Instant 0 ms resolution via persistent in-memory cache.
 * 2. Rapid parallel query to official player profiles (with strict 1.2s timeout).
 * 3. Immediate tactical sequence inference as zero-latency fallback.
 *
 * @param players Starting or bench player list.
 * @param isStarter True if processing starting XI (enables tactical order inference).
 * @param startYear Optional season start year for era-specific tactical alignments.
 */
export async function resolveRivalPositions(
  players: HistoricalMatchPlayer[],
  isStarter = false,
  startYear?: number
): Promise<void> {
  const missingPlayers: { player: HistoricalMatchPlayer; id: string }[] = [];

  for (const p of players) {
    if (p.position) continue;

    const idMatch = p.photoUrl?.match(/\/[jm]\/(\d+)/)?.[1];
    if (idMatch && positionsCache.has(idMatch)) {
      p.position = positionsCache.get(idMatch);
      continue;
    }

    if (idMatch) {
      missingPlayers.push({ player: p, id: idMatch });
    }
  }

  // Parallel fetch for un-cached players with strict ceiling to protect response times
  if (missingPlayers.length > 0) {
    await Promise.all(
      missingPlayers.map(async ({ player, id }) => {
        try {
          const pos = await fetchBdfutbolPosition(id);
          if (pos) {
            player.position = pos;
            positionsCache.set(id, pos);
          }
        } catch {
          // Gracefully falls through to tactical inference
        }
      })
    );
  }

  // Guaranteed fallback for starters: complete any gaps via tactical order inference
  if (isStarter) {
    inferTacticalPositions(players, startYear);
  }
}
