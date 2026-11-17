import type {
  FormationSlot,
  PitchAssignedPlayer,
  TacticalFormationKey,
} from "./types.ts";
import { TACTICAL_FORMATIONS } from "./formations.ts";

/**
 * Calculates absolute suitability score of a player for a target slot in a new formation.
 * Evaluates natural roles, secondary capabilities, squad lines, flank preservation and memory.
 */
function computePlayerSlotFit(
  fromSlot: PitchAssignedPlayer,
  toSlot: FormationSlot
): number {
  const player = fromSlot.player;
  if (!player) return -10000;

  const toRole = toSlot.defaultRole;
  const toCoord = toSlot.defaultCoord;
  const fromRole = fromSlot.role;
  const fromCoord = fromSlot.coord;

  // 1. Goalkeeper exclusivity
  const isPlayerGk = player.defaultPosition === "POR" || player.naturalRole === "POR";
  const isSlotGk = toRole === "POR";
  if (isPlayerGk || isSlotGk) {
    return isPlayerGk === isSlotGk ? 10000 : -10000;
  }

  let score = 0;

  // 2. Natural & Secondary tactical profile match
  if (player.naturalRole === toRole) {
    score += 220; // Primary natural role match (e.g. Rosas -> LD, Ferrari -> DC)
  } else if (player.secondaryRoles?.includes(toRole)) {
    score += 120; // Known secondary capability (e.g. Cuenca -> LI, Rosas -> CAD)
  }

  // 3. Category alignment (DEF / MED / DEL)
  const isDefRole = ["DFC", "LI", "LD", "CAD", "CAI"].includes(toRole);
  const isMedRole = ["MCD", "MC", "MCO", "EI", "ED"].includes(toRole);
  const isAttRole = ["DC", "EI", "ED"].includes(toRole);

  if (player.defaultPosition === "DEF") {
    if (isDefRole) score += 60;
    else if (toRole === "MCD") score += 20; // Defender stepping into pivot
    else score -= 300; // Pure defenders must never be put in attack/wings
  } else if (player.defaultPosition === "MED") {
    if (isMedRole) score += 60;
    else if (isDefRole) score -= 150;
    else if (toRole === "DC") score += 10;
  } else if (player.defaultPosition === "DEL") {
    if (isAttRole) score += 60;
    else if (toRole === "MCO") score += 20;
    else score -= 300; // Strikers must never be put in defense
  }

  // Central defender penalty for extreme wide wingback duties
  if (player.naturalRole === "DFC" && (toRole === "CAD" || toRole === "CAI")) {
    score -= 60;
  }

  // 4. Positional Memory / User Inertia (retention of previous assigned role)
  if (fromRole === toRole) {
    score += 70;
  }

  // 5. Flank / Side consistency
  const fromFlank = fromCoord.x < 35 ? "L" : fromCoord.x > 65 ? "R" : "C";
  const toFlank = toCoord.x < 35 ? "L" : toCoord.x > 65 ? "R" : "C";

  if (fromFlank !== "C" && toFlank !== "C") {
    if (fromFlank === toFlank) score += 70; // Same flank retention
    else score -= 350; // Severe cross-flank penalty (left <-> right inversion)
  } else if (fromFlank === "C" && toFlank === "C") {
    score += 35; // Both central bonus
  }

  // 6. Proximity tie-breaker
  const dx = fromCoord.x - toCoord.x;
  const dy = fromCoord.y - toCoord.y;
  score -= Math.sqrt(dx * dx + dy * dy) * 0.25;

  return score;
}

interface MatchCandidate {
  readonly playerIndex: number;
  readonly newSlotIndex: number;
  readonly score: number;
}

/**
 * Player-centric tactical transition: optimizes player placement into the target formation
 * based on absolute individual suitability rather than relative slot drift.
 */
export function remapSlotsForNewFormation(
  currentSlots: readonly PitchAssignedPlayer[],
  newFormationKey: TacticalFormationKey
): readonly PitchAssignedPlayer[] {
  const newFormation = TACTICAL_FORMATIONS[newFormationKey];
  if (!newFormation) return currentSlots;

  const fieldedPlayers = currentSlots
    .map((slot, index) => ({ slot, originalIndex: index }))
    .filter((item) => item.slot.player !== null);

  if (fieldedPlayers.length === 0) {
    return newFormation.slots.map((s) => ({
      slotId: s.id,
      role: s.defaultRole,
      coord: s.defaultCoord,
      player: null,
    }));
  }

  // Precompute player-to-slot suitability scores
  const candidates: MatchCandidate[] = [];
  for (let pIdx = 0; pIdx < fieldedPlayers.length; pIdx++) {
    const from = fieldedPlayers[pIdx].slot;
    for (let sIdx = 0; sIdx < newFormation.slots.length; sIdx++) {
      const to = newFormation.slots[sIdx];
      const score = computePlayerSlotFit(from, to);
      candidates.push({ playerIndex: pIdx, newSlotIndex: sIdx, score });
    }
  }

  // Global greedy assignment: highest natural suitability locks in first
  candidates.sort((a, b) => b.score - a.score);

  const assignedNewSlots = new Map<number, number>(); // newSlotIndex -> playerIndex
  const usedPlayers = new Set<number>();

  for (const candidate of candidates) {
    if (usedPlayers.has(candidate.playerIndex)) continue;
    if (assignedNewSlots.has(candidate.newSlotIndex)) continue;
    if (candidate.score < -2000) continue; // Exclude invalid mappings (e.g. GK to outfield)

    assignedNewSlots.set(candidate.newSlotIndex, candidate.playerIndex);
    usedPlayers.add(candidate.playerIndex);

    if (usedPlayers.size === fieldedPlayers.length) break;
  }

  return newFormation.slots.map((slot, sIdx) => {
    const playerIdx = assignedNewSlots.get(sIdx);
    const matchedPlayer = playerIdx !== undefined ? fieldedPlayers[playerIdx].slot.player : null;

    return {
      slotId: slot.id,
      role: slot.defaultRole,
      coord: slot.defaultCoord,
      player: matchedPlayer,
    };
  });
}
