"use client";
// Client: Gestiona la lista interactiva de partidos y la apertura del modal con carga bajo demanda

import { useState } from "react";
import type { PlayerSeasonMatchLog } from "@/lib/sports-api/fotmob-player-profile-types";
import type { DomainPlayer, DomainPlayerMatchStats, DomainLineupPlayer } from "@/lib/sports-api/types";
import { PlayerMatchRow } from "./player-match-row";
import { PlayerMatchStatsModal } from "../../partidos/[id]/player-match-stats-modal";
import { getPlayerMatchStatsAction } from "./player-match-action";

interface PlayerMatchesHistoryProps {
  readonly matches: readonly PlayerSeasonMatchLog[];
  readonly player: DomainPlayer;
  readonly fotmobPlayerId: number;
}

export function PlayerMatchesHistory({
  matches,
  player,
  fotmobPlayerId,
}: PlayerMatchesHistoryProps) {
  const [selectedMatch, setSelectedMatch] = useState<PlayerSeasonMatchLog | null>(null);
  const [matchStats, setMatchStats] = useState<DomainPlayerMatchStats | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpenMatch = async (m: PlayerSeasonMatchLog) => {
    if (!m.playedInMatch) return;
    setSelectedMatch(m);
    setLoading(true);
    setMatchStats(null);

    try {
      const data = await getPlayerMatchStatsAction(m.matchId, fotmobPlayerId, player.displayName);
      setMatchStats(data);
    } catch {
      setMatchStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedMatch(null);
    setMatchStats(null);
    setLoading(false);
  };

  const lineupPlayer: DomainLineupPlayer = {
    id: player.id,
    name: player.displayName,
    shortName: player.shortName,
    jersey: player.shirtNumber,
    position: player.position,
    positionLabel: player.positionLabel,
    formationPlace: null,
    isStarter: selectedMatch ? selectedMatch.minutesPlayed >= 60 : true,
    photoUrl: player.photoUrl,
  };

  return (
    <div className="flex flex-col rounded-3xl border border-[var(--border)] bg-white p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
        <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900">
          Partidos de la Temporada
        </h2>
      </div>

      <div className="flex flex-col divide-y divide-neutral-100 pt-2 overflow-x-auto">
        {matches.map((m) => (
          <PlayerMatchRow key={m.matchId} match={m} onSelect={handleOpenMatch} />
        ))}
      </div>

      {/* Modal interactivo de estadísticas de partido */}
      {selectedMatch && (
        loading ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xl flex flex-col items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
              <p className="text-xs font-bold text-neutral-700">Cargando estadísticas del partido...</p>
            </div>
          </div>
        ) : (
          <PlayerMatchStatsModal
            player={lineupPlayer}
            stats={matchStats}
            team={{ name: "Real Sporting", isSporting: true, crestUrl: null }}
            teamColor="#e2001a"
            textColor="#ffffff"
            onClose={handleClose}
          />
        )
      )}
    </div>
  );
}
