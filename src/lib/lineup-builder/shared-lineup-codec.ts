import type { PitchAssignedPlayer, TacticalFormationKey, TacticalRole } from "./types.ts";
import { TACTICAL_FORMATIONS } from "./formations.ts";

export interface SharedLineupStarter {
  readonly role: TacticalRole;
  readonly displayName: string;
  readonly shirtNumber: number | null;
  readonly photoUrl: string | null;
  readonly coord: { readonly x: number; readonly y: number };
}

export interface SharedLineupData {
  readonly formationKey: TacticalFormationKey;
  readonly teamTitle: string;
  readonly starters: readonly SharedLineupStarter[];
}

const LOCAL_STORAGE_KEY = "mareona_shared_once_draft";

function extractPhotoId(photoUrl: string | null): string {
  if (!photoUrl) return "";
  const match = photoUrl.match(/\/playerimages\/(\d+)\.png/);
  return match ? match[1] : photoUrl.startsWith("http") ? "" : photoUrl;
}

function reconstitutePhotoUrl(compact: string): string | null {
  if (!compact) return null;
  if (/^\d+$/.test(compact)) {
    return `https://images.fotmob.com/image_resources/playerimages/${compact}.png`;
  }
  return compact.startsWith("/") ? compact : null;
}

/**
 * Encodes a tactical lineup preserving exact hand-moved coordinates (x, y).
 */
export function encodeSharedLineup(data: SharedLineupData): string {
  const encodedStarters = data.starters
    .map((s) => {
      const cleanName = s.displayName.replace(/[*|,]/g, " ").trim();
      const num = s.shirtNumber ?? 0;
      const photoId = extractPhotoId(s.photoUrl);
      const x = Number(s.coord.x.toFixed(1));
      const y = Number(s.coord.y.toFixed(1));
      return `${cleanName}*${num}*${photoId}*${s.role}*${x}*${y}`;
    })
    .join(",");

  return `<!--once:${data.formationKey}|${encodedStarters}-->`;
}

/**
 * Decodes raw payload into SharedLineupData with exact coordinates.
 */
export function decodeSharedLineup(rawPayload: string): SharedLineupData | null {
  const match = rawPayload.match(/<!--once:(4-2-3-1|4-4-2|4-3-3|5-3-2|3-4-3|3-5-2)\|(.*?)-->/);
  if (!match) return null;

  const formationKey = match[1] as TacticalFormationKey;
  const startersPayload = match[2];
  if (!startersPayload) return null;

  const items = startersPayload.split(",");
  if (items.length !== 11) return null;

  const formation = TACTICAL_FORMATIONS[formationKey];
  const starters: SharedLineupStarter[] = [];

  for (let i = 0; i < items.length; i++) {
    const parts = items[i].split("*");
    if (parts.length < 6) return null;

    const [displayName, numStr, photoId, roleStr, xStr, yStr] = parts;
    const shirtNumber = Number(numStr) || null;
    const parsedX = parseFloat(xStr);
    const parsedY = parseFloat(yStr);

    const defaultSlot = formation?.slots[i];
    const coord = {
      x: !isNaN(parsedX) ? Math.min(95, Math.max(5, parsedX)) : defaultSlot?.defaultCoord.x ?? 50,
      y: !isNaN(parsedY) ? Math.min(95, Math.max(5, parsedY)) : defaultSlot?.defaultCoord.y ?? 50,
    };

    starters.push({
      displayName: displayName || (defaultSlot?.label ?? "Jugador"),
      shirtNumber,
      photoUrl: reconstitutePhotoUrl(photoId),
      role: (roleStr as TacticalRole) || defaultSlot?.defaultRole || "MC",
      coord,
    });
  }

  return { formationKey, teamTitle: "Real Sporting", starters };
}

/**
 * Converts live AssignedSlots from the LineupBuilder into SharedLineupData.
 */
export function buildSharedLineupFromSlots(
  formationKey: TacticalFormationKey,
  slots: readonly PitchAssignedPlayer[],
  teamTitle = "Real Sporting"
): SharedLineupData {
  const starters: SharedLineupStarter[] = slots.map((s) => ({
    role: s.role,
    displayName: s.player?.displayName ?? s.role,
    shirtNumber: s.player?.shirtNumber ?? null,
    photoUrl: s.player?.photoUrl ?? null,
    coord: {
      x: Number(s.coord.x.toFixed(1)),
      y: Number(s.coord.y.toFixed(1)),
    },
  }));

  return { formationKey, teamTitle, starters };
}

/**
 * Parses post text to extract attached lineup and return sanitized display text.
 */
export function parsePostLineup(body: string): { cleanBody: string; lineup: SharedLineupData | null } {
  const tagMatch = body.match(/<!--once:(4-2-3-1|4-4-2|4-3-3|5-3-2|3-4-3|3-5-2)\|.*?-->/);
  if (!tagMatch) return { cleanBody: body.trim(), lineup: null };

  const lineup = decodeSharedLineup(tagMatch[0]);
  const cleanBody = body.replace(tagMatch[0], "").trim();
  return { cleanBody, lineup };
}

export function saveLocalSharedLineup(data: SharedLineupData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Non-blocking quota failure
  }
}

export function loadLocalSharedLineup(): SharedLineupData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SharedLineupData;
    return parsed?.formationKey && Array.isArray(parsed.starters) ? parsed : null;
  } catch {
    return null;
  }
}
