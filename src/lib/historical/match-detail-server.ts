"use server";

import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import { parseHistoricalMatchDetail } from "./match-detail-parser";
import type { HistoricalMatchDetail } from "./types";

const SEASON_SLUG_REGEX = /^\d{4}-\d{2}$/;
const MATCH_DETAILS_DIR = path.resolve(process.cwd(), "src", "data", "historical", "match-details");

/** In-memory cache for loaded match sheets to ensure instant subsequent openings. */
const matchDetailCache = new Map<string, HistoricalMatchDetail>();

const BDFUTBOL_REQUEST_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  Referer: "https://www.bdfutbol.com/",
};

function fetchMatchHtml(bdfMatchId: string): Promise<string> {
  const url = `https://www.bdfutbol.com/es/p/p.php?id=${encodeURIComponent(bdfMatchId)}`;
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: BDFUTBOL_REQUEST_HEADERS,
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Failed to fetch match ${bdfMatchId}: HTTP ${res.statusCode}`));
          return;
        }
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          if (
            !data ||
            data.includes("Attention Required! | Cloudflare") ||
            data.includes("cf-browser-verification")
          ) {
            reject(new Error(`Cloudflare challenge encountered for match ${bdfMatchId}`));
            return;
          }
          resolve(data);
        });
      }
    );

    req.on("error", reject);
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error(`Timeout fetching match ${bdfMatchId}`));
    });
  });
}

function readBundledMatchDetail(bdfMatchId: string, season?: string): HistoricalMatchDetail | null {
  if (!season || !SEASON_SLUG_REGEX.test(season)) return null;
  try {
    const detailsPath = path.resolve(MATCH_DETAILS_DIR, `${season}.json`);
    if (!detailsPath.startsWith(MATCH_DETAILS_DIR + path.sep)) return null;
    if (!fs.existsSync(detailsPath)) return null;
    const content = fs.readFileSync(detailsPath, "utf8");
    const seasonRecord = JSON.parse(content) as Record<string, HistoricalMatchDetail>;
    return seasonRecord[bdfMatchId] ?? null;
  } catch {
    return null;
  }
}

/**
 * Server Action: retrieves complete official match report for a historical match.
 *
 * @param bdfMatchId - Numeric BDFutbol match identifier.
 * @param season - Optional season slug (`YYYY-YY`).
 * @param isHome - Optional flag indicating whether Real Sporting played at home.
 * @returns Parsed match report or `null` when unavailable.
 */
export async function getHistoricalMatchDetail(
  bdfMatchId: string,
  season?: string,
  isHome?: boolean
): Promise<HistoricalMatchDetail | null> {
  if (!bdfMatchId || !/^\d+$/.test(bdfMatchId)) return null;
  if (season !== undefined && !SEASON_SLUG_REGEX.test(season)) return null;

  const cacheKey = season ? `${bdfMatchId}-${season}-${isHome ?? "auto"}` : bdfMatchId;
  if (process.env.NODE_ENV === "production") {
    const cached = matchDetailCache.get(cacheKey);
    if (cached) return cached;
  }

  const bundled = readBundledMatchDetail(bdfMatchId, season);
  if (bundled) {
    matchDetailCache.set(cacheKey, bundled);
    return bundled;
  }

  try {
    const html = await fetchMatchHtml(bdfMatchId);
    const detail = await parseHistoricalMatchDetail(html, bdfMatchId, season, isHome);
    matchDetailCache.set(cacheKey, detail);
    return detail;
  } catch {
    return null;
  }
}
