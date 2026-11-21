import rawWhoAreYaPlayers from "../../data/who-are-ya/players.json" with { type: "json" };
import { getChallengeForDate } from "../wordle/words.ts";
import { normalizeWord } from "../wordle/engine.ts";
import { evaluateTriviaAnswer, getTriviaForDate } from "../trivia/engine.ts";
import { getPlayerForDate } from "../who-are-ya/daily.ts";
import { ALL_PLAYERS, evaluateHigherLower, getEligiblePlayers } from "../higher-lower/engine.ts";
import type { HigherLowerGuess, HigherLowerMode } from "../higher-lower/types.ts";
import type { WhoAreYaPlayer } from "../who-are-ya/types.ts";
import type { QueuedGameEvent } from "./offline-sync-types.ts";

const WHO_ARE_YA_CATALOG = rawWhoAreYaPlayers as WhoAreYaPlayer[];

/**
 * Verifies on the server whether a queued daily game win includes valid proof
 * matching the canonical challenge solution for `challengeDate`.
 *
 * @param event - Queued game event submitted from the client.
 * @param today - Current canonical Europe/Madrid calendar date (YYYY-MM-DD).
 * @returns `true` only when the event corresponds to `today`, reports a win, and passes solution verification.
 */
export function verifyDailyGameWinProof(
  event: QueuedGameEvent,
  today: string
): boolean {
  if (!event.won || event.challengeDate !== today) return false;
  const proof = event.proof?.trim();
  if (!proof) return false;

  if (event.gameType === "wordle") {
    const challenge = getChallengeForDate(today);
    return normalizeWord(proof) === challenge.word;
  }

  if (event.gameType === "trivia") {
    const challenge = getTriviaForDate(today);
    return evaluateTriviaAnswer(proof, challenge.question);
  }

  if (event.gameType === "who_are_ya") {
    const target = getPlayerForDate(today, WHO_ARE_YA_CATALOG);
    return proof === String(target.bdfId);
  }

  if (event.gameType === "higher_lower") {
    if ((event.score ?? 0) < 3) return false;
    const parts = proof.split(":");
    if (parts.length !== 4) return false;
    const [leftRaw, rightRaw, modeRaw, guessRaw] = parts;
    const leftId = Number(leftRaw);
    const rightId = Number(rightRaw);
    if (!Number.isInteger(leftId) || !Number.isInteger(rightId) || leftId === rightId) {
      return false;
    }
    if (modeRaw !== "matches" && modeRaw !== "goals" && modeRaw !== "minutes") {
      return false;
    }
    if (guessRaw !== "higher" && guessRaw !== "lower") {
      return false;
    }
    const eligible = getEligiblePlayers(modeRaw as HigherLowerMode);
    const leftPlayer = eligible.find((p) => p.bdfId === leftId) ?? ALL_PLAYERS.find((p) => p.bdfId === leftId);
    const rightPlayer = eligible.find((p) => p.bdfId === rightId) ?? ALL_PLAYERS.find((p) => p.bdfId === rightId);
    if (!leftPlayer || !rightPlayer) return false;
    return evaluateHigherLower(
      leftPlayer,
      rightPlayer,
      modeRaw as HigherLowerMode,
      guessRaw as HigherLowerGuess
    ).isCorrect;
  }

  return false;
}
