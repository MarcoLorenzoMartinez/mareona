"use client"; // Client: Orquestador del flujo completo del duelo de 11 cartas

import { useState } from "react";
import type { Card, CardStatKey, TacticalFormation } from "@/lib/cards/types.ts";
import { resolveCardStatComparison } from "@/lib/cards/combat.ts";
import { buildAiLineup, decideAiAttackMove, decideAiDefenseMove } from "@/lib/cards/duel-ai.ts";
import { DuelFormationPicker } from "./duel-formation-picker";
import { DuelCombatArena } from "./duel-combat-arena";
import { DuelSummaryModal } from "./duel-summary-modal";

interface DuelMatchViewProps {
  readonly allCards: readonly Card[];
}

export function DuelMatchView({ allCards }: DuelMatchViewProps) {
  const [matchState, setMatchState] = useState<"setup" | "playing" | "summary">("setup");
  const [playerLineup, setPlayerLineup] = useState<Card[]>([]);
  const [aiLineup, setAiLineup] = useState<Card[]>([]);
  const [round, setRound] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [playedCardIds, setPlayedCardIds] = useState<Set<string>>(new Set());
  const [aiPlayedCardIds, setAiPlayedCardIds] = useState<Set<string>>(new Set());

  const [aiAttackPending, setAiAttackPending] = useState<{
    position: Card["position"];
    statKey: CardStatKey;
    aiCard: Card;
  } | null>(null);

  const [lastResolution, setLastResolution] = useState<{
    playerCard: Card;
    aiCard: Card;
    contestedStat: CardStatKey;
    winner: "host" | "guest" | "tie";
  } | null>(null);

  const handleConfirmLineup = (formation: TacticalFormation, lineup: Card[]) => {
    setPlayerLineup(lineup);
    const aiTeam = buildAiLineup(formation);
    setAiLineup(aiTeam);
    setMatchState("playing");
    setRound(1);
    setPlayerScore(0);
    setAiScore(0);
    setPlayedCardIds(new Set());
    setAiPlayedCardIds(new Set());
    setIsPlayerTurn(true);
  };

  const handlePlayerAttack = (playerCard: Card, statKey: CardStatKey) => {
    const aiAvailable = aiLineup.filter((c) => !aiPlayedCardIds.has(c.id));
    const aiCard = decideAiDefenseMove(aiAvailable, statKey);

    const winner = resolveCardStatComparison(playerCard, aiCard, statKey);
    finalizeRound(playerCard, aiCard, statKey, winner);
  };

  const handlePlayerDefend = (playerCard: Card) => {
    if (!aiAttackPending) return;
    const { aiCard, statKey } = aiAttackPending;
    // For resolution: aiCard is attacker (host), playerCard is defender (guest)
    const winner = resolveCardStatComparison(playerCard, aiCard, statKey);
    setAiAttackPending(null);
    finalizeRound(playerCard, aiCard, statKey, winner);
  };

  const finalizeRound = (
    playerCard: Card,
    aiCard: Card,
    statKey: CardStatKey,
    winner: "host" | "guest" | "tie"
  ) => {
    if (winner === "host") setPlayerScore((s) => s + 1);
    if (winner === "guest") setAiScore((s) => s + 1);

    setPlayedCardIds((prev) => new Set([...prev, playerCard.id]));
    setAiPlayedCardIds((prev) => new Set([...prev, aiCard.id]));

    setLastResolution({ playerCard, aiCard, contestedStat: statKey, winner });
    setIsPlayerTurn(winner === "host");
  };

  const handleNextRound = () => {
    setLastResolution(null);
    if (round >= 11) {
      setMatchState("summary");
      return;
    }

    const nextRound = round + 1;
    setRound(nextRound);

    // Si le toca a la IA atacar en la nueva ronda, genera su ataque con niebla de guerra
    if (!isPlayerTurn) {
      const aiAvailable = aiLineup.filter((c) => !aiPlayedCardIds.has(c.id));
      const aiMove = decideAiAttackMove(aiAvailable);
      setAiAttackPending({
        position: aiMove.card.position,
        statKey: aiMove.statKey,
        aiCard: aiMove.card,
      });
    }
  };

  const handleRematch = () => {
    setMatchState("setup");
    setLastResolution(null);
    setAiAttackPending(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {matchState === "setup" && (
        <DuelFormationPicker
          availableCards={allCards}
          onConfirmLineup={handleConfirmLineup}
        />
      )}

      {matchState === "playing" && (
        <DuelCombatArena
          round={round}
          playerScore={playerScore}
          aiScore={aiScore}
          isPlayerTurn={isPlayerTurn && !aiAttackPending}
          aiAttackPending={aiAttackPending}
          playerLineup={playerLineup}
          playedCardIds={playedCardIds}
          lastResolution={lastResolution}
          onPlayerAttack={handlePlayerAttack}
          onPlayerDefend={handlePlayerDefend}
          onNextRound={handleNextRound}
        />
      )}

      <DuelSummaryModal
        isOpen={matchState === "summary"}
        playerScore={playerScore}
        aiScore={aiScore}
        onRematch={handleRematch}
      />
    </div>
  );
}
