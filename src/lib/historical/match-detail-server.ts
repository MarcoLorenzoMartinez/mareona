"use server";

import https from "node:https";
import rawSquads from "../../data/historical/squads.json" with { type: "json" };
import { resolveRivalPositions, inferTacticalPositions } from "./player-positions-resolver.ts";
import type {
  HistoricalMatchDetail,
  HistoricalMatchGoal,
  HistoricalMatchPlayer,
  HistoricalMatchCoach,
  HistoricalMatchReferee,
} from "./types";

const squadsRecord = rawSquads as unknown as Record<
  string,
  {
    readonly players?: readonly { readonly alias: string; readonly fullName: string; readonly photoUrl?: string | null; readonly position?: string }[];
    readonly coaches?: readonly { readonly alias: string; readonly fullName: string; readonly photoUrl?: string | null }[];
  }
>;

/** In-memory cache for loaded match sheets to ensure instant subsequent openings */
const matchDetailCache = new Map<string, HistoricalMatchDetail>();

function parsePlayerTable(
  tableHtml: string | undefined,
  season?: string,
  _isStarter = false,
  isSporting = false
): HistoricalMatchPlayer[] {
  if (!tableHtml) return [];
  const trs = tableHtml.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  const players: HistoricalMatchPlayer[] = [];
  const seasonSquad = isSporting && season ? squadsRecord[season] : undefined;

  for (const tr of trs) {
    if (tr.includes("display: none") || tr.includes("<th")) continue;
    const photoMatch = tr.match(/src=['"]([^'"]*(?:\/m\/|\/j\/)[^'"]+)['"]/i);
    let photoUrl = photoMatch && !photoMatch[1].includes("no-foto") ? photoMatch[1].replace(/^(\.\.\/)+/, "https://www.bdfutbol.com/") : null;
    const linkMatch = tr.match(/href=['"][^'"]*\/j\/j(\d+)\.html['"][^>]*>([^<]+)<\/a>/i);
    const nameMatch = tr.match(/<a[^>]*href=['"]\.\.\/j\/[^'"]*['"][^>]*>([^<]+)<\/a>/i);
    if (!linkMatch && !nameMatch) continue;

    const playerId = linkMatch ? linkMatch[1] : null;
    const name = linkMatch ? linkMatch[2].trim() : nameMatch![1].trim();
    let position: string | undefined = undefined;

    if (seasonSquad?.players) {
      const sp = seasonSquad.players.find(
        (p) =>
          (playerId && p.photoUrl?.match(/\/[jm]\/(\d+)/)?.[1] === playerId) ||
          p.alias.toLowerCase() === name.toLowerCase() ||
          p.fullName.toLowerCase() === name.toLowerCase()
      );
      if (sp?.photoUrl) photoUrl = sp.photoUrl;
      if (sp?.position) position = sp.position;
    }

    const subOut = tr.match(/class=['"][^'"]*\bSurt\b[^'"]*['"][^>]*><\/div>\s*(\d+)/)?.[1];
    const subIn = tr.match(/class=['"][^'"]*\bEntra\b[^'"]*['"][^>]*><\/div>\s*(\d+)/)?.[1];
    const yellow = tr.match(/class=['"][^'"]*\bTG\b[^'"]*['"][^>]*><\/div>\s*(\d+)/)?.[1];
    const red = tr.match(/class=['"][^'"]*\b(TR|TV)\b[^'"]*['"][^>]*><\/div>\s*(\d+)/)?.[2];

    players.push({
      name,
      photoUrl,
      position,
      subOut: subOut ? parseInt(subOut, 10) : undefined,
      subIn: subIn ? parseInt(subIn, 10) : undefined,
      yellowCard: yellow ? parseInt(yellow, 10) : undefined,
      redCard: red ? parseInt(red, 10) : undefined,
    });
  }
  return players;
}

function parseCoach(tableHtml: string | undefined, season?: string): HistoricalMatchCoach | null {
  if (!tableHtml) return null;
  const nameMatch = tableHtml.match(/<a[^>]*href=['"]\.\.\/l\/[^'"]*['"][^>]*>([^<]+)<\/a>/i);
  if (!nameMatch) return null;
  const name = nameMatch[1].trim();
  const photoMatch = tableHtml.match(/src=['"]([^'"]*(?:\/lm\/|\/l\/)[^'"]+)['"]/i);
  let photoUrl = photoMatch && !photoMatch[1].includes("no-foto") ? photoMatch[1].replace(/^(\.\.\/)+/, "https://www.bdfutbol.com/") : null;

  const coachId = tableHtml.match(/href=['"][^'"]*\/l\/l(\d+)\.html/i)?.[1];
  const seasonSquad = season ? squadsRecord[season] : undefined;
  if (seasonSquad?.coaches) {
    const sc = seasonSquad.coaches.find(
      (c) =>
        (coachId && c.photoUrl?.match(/\/l[m]?\/(\d+)/)?.[1] === coachId) ||
        c.alias.toLowerCase() === name.toLowerCase() ||
        c.fullName.toLowerCase() === name.toLowerCase()
    );
    if (sc?.photoUrl) photoUrl = sc.photoUrl;
  }
  return { name, photoUrl };
}

/**
 * Parses raw HTML match report from BDFutbol into typed match detail.
 */
export async function parseHistoricalMatchDetail(
  html: string,
  bdfMatchId: string,
  season?: string,
  isHomeParam?: boolean
): Promise<HistoricalMatchDetail> {
  const stadiumMatch = html.match(/<div class=['"]f14['"]>\s*Estadio\s*<\/div>\s*<div[^>]*>(?:<a[^>]*>)?([^<]+)/i);
  const venue = stadiumMatch ? stadiumMatch[1].trim() : undefined;

  const tables = html.match(/<table[^>]*class=['"]taula_estil[^'"]*['"][\s\S]*?<\/table>/gi) || [];

  let isHomeSporting = isHomeParam;
  if (isHomeSporting === undefined) {
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i)?.[1];
    if (titleMatch) {
      const homeName = titleMatch.split("-")[0]?.trim() || "";
      isHomeSporting = /sporting|gij[oó]n/i.test(homeName);
    } else if (season && squadsRecord[season]?.players) {
      const seasonPlayers = squadsRecord[season]!.players;
      const countMatches = (tbl?: string) =>
        tbl
          ? Array.from(tbl.matchAll(/\/j\/j(\d+)\.html/g), (m) => m[1]).filter((id) =>
              seasonPlayers.some((p) => p.photoUrl?.includes(`/${id}`))
            ).length
          : 0;
      isHomeSporting = countMatches(tables[0]) >= countMatches(tables[1]);
    } else {
      isHomeSporting = true;
    }
  }

  let referee: HistoricalMatchReferee | null = null;
  const refMatch = html.match(/<a[^>]*href=['"]\.\.\/r\/r\d+\.html['"][^>]*>([\s\S]*?)<\/a>/i);
  if (refMatch) {
    const rawRef = refMatch[1];
    const name = rawRef.replace(/<[^>]+>/g, "").trim();
    const photoMatch = rawRef.match(/src=['"]([^'"]*(?:\/am\/|\/r\/)[^'"]+)['"]/i);
    const photoUrl = photoMatch && !photoMatch[1].includes("no-foto") ? photoMatch[1].replace(/^(\.\.\/)+/, "https://www.bdfutbol.com/") : null;
    referee = { name, photoUrl };
  }

  const goals: HistoricalMatchGoal[] = [];
  const rightIdx = html.indexOf('class="text-right"');
  const leftIdx = html.indexOf('class="text-left"', rightIdx !== -1 ? rightIdx : 0);

  function extractGoals(snippet: string, isHome: boolean) {
    if (!snippet) return;
    const divs = snippet.matchAll(/<div class=['"]text-blanc['"][^>]*>([\s\S]*?)<\/div>/gi);
    for (const div of divs) {
      const content = div[1];
      const scoreMatch = content.match(/<span[^>]*>([^<]+)<\/span>/i);
      const scorerMatch = content.match(/<a[^>]*>([^<]+)<\/a>/i);
      const minMatch = content.match(/(\d+(?:\+\d+)?)'/);
      if (scoreMatch && scorerMatch && minMatch) {
        const minuteDisplay = minMatch[1];
        const minute = minuteDisplay.split("+").reduce((sum, p) => sum + (parseInt(p, 10) || 0), 0);
        goals.push({
          score: scoreMatch[1].trim(),
          scorer: scorerMatch[1].trim(),
          minute,
          minuteDisplay,
          isHome,
          isPenalty: /penalti/i.test(content),
          isOwnGoal: /p\.p\./i.test(content),
        });
      }
    }
  }

  if (rightIdx !== -1 && leftIdx !== -1 && leftIdx > rightIdx) {
    extractGoals(html.substring(rightIdx, leftIdx), true);
    extractGoals(html.substring(leftIdx, leftIdx + 2000), false);
  } else {
    extractGoals(html, true);
  }

  goals.sort((a, b) => a.minute - b.minute);

  const homeStarters = parsePlayerTable(tables[0], season, true, isHomeSporting);
  const awayStarters = parsePlayerTable(tables[1], season, true, !isHomeSporting);
  const homeBench = parsePlayerTable(tables[2], season, false, isHomeSporting);
  const awayBench = parsePlayerTable(tables[3], season, false, !isHomeSporting);

  const startYear = season ? parseInt(season.split("-")[0], 10) : undefined;
  const rivalStarters = isHomeSporting ? awayStarters : homeStarters;
  const rivalBench = isHomeSporting ? awayBench : homeBench;
  const sportingStarters = isHomeSporting ? homeStarters : awayStarters;

  await Promise.all([
    resolveRivalPositions(rivalStarters, true, startYear),
    resolveRivalPositions(rivalBench, false, startYear),
  ]);

  inferTacticalPositions(sportingStarters, startYear);

  return {
    bdfMatchId,
    venue,
    referee,
    goals,
    homeStarters,
    awayStarters,
    homeBench,
    awayBench,
    homeCoach: parseCoach(tables[4], isHomeSporting ? season : undefined),
    awayCoach: parseCoach(tables[5], !isHomeSporting ? season : undefined),
  };
}

function fetchMatchHtml(bdfMatchId: string): Promise<string> {
  const url = `https://www.bdfutbol.com/es/p/p.php?id=${encodeURIComponent(bdfMatchId)}`;
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false }, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`Failed to fetch match ${bdfMatchId}: HTTP ${res.statusCode}`));
        return;
      }
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

/**
 * Server Action: retrieves complete official match report for a historical match.
 */
export async function getHistoricalMatchDetail(
  bdfMatchId: string,
  season?: string,
  isHome?: boolean
): Promise<HistoricalMatchDetail | null> {
  if (!bdfMatchId || !/^\d+$/.test(bdfMatchId)) return null;

  const cacheKey = season ? `${bdfMatchId}-${season}-${isHome ?? "auto"}` : bdfMatchId;
  const cached = matchDetailCache.get(cacheKey);
  if (cached) return cached;

  try {
    const html = await fetchMatchHtml(bdfMatchId);
    const detail = await parseHistoricalMatchDetail(html, bdfMatchId, season, isHome);
    matchDetailCache.set(cacheKey, detail);
    return detail;
  } catch {
    return null;
  }
}
