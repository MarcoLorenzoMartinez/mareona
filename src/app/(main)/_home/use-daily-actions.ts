// Client: Lee pronósticos y misiones de localStorage, que no existen en el servidor
"use client";

import { useSyncExternalStore } from "react";
import { useAuth } from "@/context/auth-context";
import { getDailyMissionState, getTodayDateString } from "@/lib/cards/pack-storage";
import { getStoredPrediction } from "@/lib/porra/storage";

export interface PorraOpening {
  readonly matchId: string;
  readonly kickoffAt: string;
}

export interface DailyActions {
  readonly porraPending: boolean;
  readonly porraVoted: boolean;
  readonly packReady: boolean;
  readonly wordleDone: boolean;
  readonly triviaDone: boolean;
  readonly whoAreYaDone: boolean;
}

const SYNC_EVENTS = [
  "storage",
  "mareona_pack_inventory_changed",
  "mareona_missions_state_changed",
] as const;

function subscribe(onChange: () => void): () => void {
  for (const name of SYNC_EVENTS) window.addEventListener(name, onChange);
  return () => {
    for (const name of SYNC_EVENTS) window.removeEventListener(name, onChange);
  };
}

function checkWordleCompletedToday(today: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(`mareona_wordle_v2_state_${today}`);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { status?: string };
    return parsed.status === "SOLVED" || parsed.status === "FAILED";
  } catch {
    return false;
  }
}

function checkTriviaCompletedToday(today: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(`mareona_trivia_${today}`);
    return Boolean(raw);
  } catch {
    return false;
  }
}

function checkWhoAreYaCompletedToday(today: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(`mareona_who_are_ya_${today}`);
    if (!raw) return false;
    const guesses = JSON.parse(raw) as Array<{ isCorrect?: boolean }>;
    if (!Array.isArray(guesses)) return false;
    return guesses.some((g) => g.isCorrect) || guesses.length >= 6;
  } catch {
    return false;
  }
}

/**
 * Resolves which daily actions and minigame challenges have been completed today.
 * The snapshot is a primitive string so React can compare it by value, and the
 * server snapshot is null to let the UI avoid flashing a wrong state before hydration.
 *
 * @param porra Next Porra match, or null when no upcoming fixture is known.
 * @returns Daily action flags, or null until client storage has been read.
 */
export function useDailyActions(porra: PorraOpening | null): DailyActions | null {
  const { user } = useAuth();
  const userId = user?.id;

  const snapshot = useSyncExternalStore(
    subscribe,
    () => {
      const today = getTodayDateString();
      const isOpen = porra !== null && Date.parse(porra.kickoffAt) > Date.now();
      const porraPending = isOpen && getStoredPrediction(porra.matchId, userId) === null;
      const porraVoted = isOpen && !porraPending;
      const packReady = !getDailyMissionState(undefined, userId).hasClaimedDailyLogin;
      const wordleDone = checkWordleCompletedToday(today);
      const triviaDone = checkTriviaCompletedToday(today);
      const whoAreYaDone = checkWhoAreYaCompletedToday(today);

      return `${porraPending ? 1 : 0}${porraVoted ? 1 : 0}${packReady ? 1 : 0}${wordleDone ? 1 : 0}${triviaDone ? 1 : 0}${whoAreYaDone ? 1 : 0}`;
    },
    () => null
  );

  if (snapshot === null) return null;
  return {
    porraPending: snapshot[0] === "1",
    porraVoted: snapshot[1] === "1",
    packReady: snapshot[2] === "1",
    wordleDone: snapshot[3] === "1",
    triviaDone: snapshot[4] === "1",
    whoAreYaDone: snapshot[5] === "1",
  };
}
