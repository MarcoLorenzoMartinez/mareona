"use client"; // Client: Gestión del tablero de combate, selección de cartas y niebla de guerra

import { useState } from "react";
import type { Card, CardStatKey } from "@/lib/cards/types.ts";
import { getCardStatValue } from "@/lib/cards/combat.ts";
import { HistoricalCard } from "@/components/cards/historical-card";

interface DuelCombatArenaProps {
  readonly round: number;
  readonly playerScore: number;
  readonly aiScore: number;
  readonly isPlayerTurn: boolean;
  readonly aiAttackPending: { position: Card["position"]; statKey: CardStatKey } | null;
  readonly playerLineup: readonly Card[];
  readonly playedCardIds: ReadonlySet<string>;
  readonly lastResolution: {
    playerCard: Card;
    aiCard: Card;
    contestedStat: CardStatKey;
    winner: "host" | "guest" | "tie";
  } | null;
  readonly onPlayerAttack: (card: Card, statKey: CardStatKey) => void;
  readonly onPlayerDefend: (card: Card) => void;
  readonly onNextRound: () => void;
}

const STAT_LABELS: Record<CardStatKey, string> = {
  matches_played: "PJ (Partidos)",
  attack_power: "ATQ (Ataque)",
  defense_power: "DEF (Defensa)",
  ovr: "OVR (Media)",
};

const POS_LABELS: Record<Card["position"], string> = {
  goalkeeper: "PORTERO",
  defender: "DEFENSA",
  midfielder: "CENTROCAMPISTA",
  forward: "DELANTERO",
};

export function DuelCombatArena({
  round,
  playerScore,
  aiScore,
  isPlayerTurn,
  aiAttackPending,
  playerLineup,
  playedCardIds,
  lastResolution,
  onPlayerAttack,
  onPlayerDefend,
  onNextRound,
}: DuelCombatArenaProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const availablePlayerCards = playerLineup.filter((c) => !playedCardIds.has(c.id));
  const selectedCard = availablePlayerCards.find((c) => c.id === selectedCardId);

  return (
    <div className="flex flex-col gap-5">
      {/* Marcador Superior */}
      <header className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-white p-4 shadow-2xs">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-[var(--foreground-muted)] uppercase">
            Ronda {round} de 11
          </span>
          <h2 className="text-base font-bold text-[var(--foreground)]">Duelo de Once Inicial</h2>
        </div>
        <div className="flex items-center gap-3 rounded-full bg-[var(--surface)] px-4 py-1.5 border border-[var(--border)]">
          <span className="font-bold text-xs text-[#e2001a]">Tú: {playerScore}</span>
          <span className="text-xs text-[var(--foreground-muted)]">-</span>
          <span className="font-bold text-xs text-[var(--foreground)]">Rival: {aiScore}</span>
        </div>
      </header>

      {/* Pantalla de Resolución de Ronda */}
      {lastResolution ? (
        <section className="flex flex-col items-center rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xs">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
              lastResolution.winner === "host"
                ? "bg-emerald-100 text-emerald-800"
                : lastResolution.winner === "guest"
                ? "bg-red-100 text-red-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {lastResolution.winner === "host"
              ? "¡Gol para tu equipo!"
              : lastResolution.winner === "guest"
              ? "Gol del rival"
              : "Empate sin goles"}
          </span>

          <p className="mt-2 text-xs font-semibold text-[var(--foreground-muted)]">
            Duelo disputado en: {STAT_LABELS[lastResolution.contestedStat]}
          </p>

          <div className="my-5 flex flex-wrap items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#e2001a]">Tu Jugador</span>
              <HistoricalCard card={lastResolution.playerCard} size="sm" isOwned />
              <span className="font-sans font-black tabular-nums text-sm text-[var(--foreground)]">
                {getCardStatValue(lastResolution.playerCard, lastResolution.contestedStat)}
              </span>
            </div>

            <span className="text-base font-bold text-[var(--foreground-muted)]">VS</span>

            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[11px] font-bold text-[var(--foreground)]">Rival</span>
              <HistoricalCard card={lastResolution.aiCard} size="sm" isOwned />
              <span className="font-sans font-black tabular-nums text-sm text-[var(--foreground)]">
                {getCardStatValue(lastResolution.aiCard, lastResolution.contestedStat)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onNextRound}
            className="rounded-full bg-[#e2001a] px-6 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-[#b30015] transition-colors"
          >
            {round < 11 ? "Siguiente Ronda" : "Ver Marcador Final"}
          </button>
        </section>
      ) : (
        /* Pantalla de Selección Táctica Activa */
        <section className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-2xs">
          {/* Niebla de guerra o Instrucción de Turno */}
          {aiAttackPending ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-amber-900">
              <span className="block text-[11px] font-bold uppercase tracking-wider">
                ¡Ataque Rival en Marcha! (Niebla de Guerra)
              </span>
              <p className="mt-1 text-xs">
                El rival ataca con un{" "}
                <span className="font-black text-amber-950">{POS_LABELS[aiAttackPending.position]}</span> y ha
                retado con <span className="font-black text-amber-950">{STAT_LABELS[aiAttackPending.statKey]}</span>.
                Elige con qué jugador de tu once quieres responder.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-red-100 bg-red-50/50 p-3.5 text-[#e2001a]">
              <span className="block text-[11px] font-bold uppercase tracking-wider">Tu Turno de Atacar</span>
              <p className="mt-1 text-xs text-[var(--foreground)]">
                Selecciona una carta de tu once y escoge el atributo con el que retarás al rival.
              </p>
            </div>
          )}

          {/* Selector de Atributo (solo cuando el jugador ataca) */}
          {isPlayerTurn && selectedCard && (
            <div className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
              <span className="text-xs font-bold text-[var(--foreground)]">
                Elige atributo de combate para {selectedCard.knownAs}:
              </span>
              <div className="flex flex-wrap gap-2">
                {(["attack_power", "defense_power", "matches_played", "ovr"] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onPlayerAttack(selectedCard, key)}
                    className="rounded-full bg-[#e2001a] px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#b30015] transition-colors"
                  >
                    {STAT_LABELS[key]}: {getCardStatValue(selectedCard, key)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botón de Respuesta Defensiva (cuando el rival atacó) */}
          {aiAttackPending && selectedCard && (
            <button
              type="button"
              onClick={() => onPlayerDefend(selectedCard)}
              className="rounded-full bg-[#e2001a] py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-[#b30015] transition-colors"
            >
              Defender con {selectedCard.knownAs} ({getCardStatValue(selectedCard, aiAttackPending.statKey)})
            </button>
          )}

          {/* Cartas Disponibles en el Banquillo / Césped */}
          <div>
            <span className="block text-xs font-semibold text-[var(--foreground-muted)] mb-2">
              Tus cartas disponibles ({availablePlayerCards.length} restantes):
            </span>
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {availablePlayerCards.map((c) => (
                <HistoricalCard
                  key={c.id}
                  card={c}
                  size="sm"
                  isOwned
                  isSelected={selectedCardId === c.id}
                  onCardClick={(clicked) => setSelectedCardId(clicked.id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
