// Client: Modal accesible de acta oficial con alineaciones, goles, árbitro y cuerpo técnico
"use client";

import { useEffect, useState } from "react";
import type { HistoricalMatch, HistoricalMatchDetail } from "@/lib/historical/types";
import { getHistoricalMatchDetail } from "@/lib/historical/match-detail-server";
import { getStadiumAsset } from "@/lib/sports-api/stadiums";
import { PlayerPhoto } from "@/components/media/player-photo";
import { MatchScoreboard } from "./match-scoreboard";
import { HistoricalMatchLineups } from "./match-detail-lineups";
import { HistoricalMatchEvents } from "./match-detail-events";

interface MatchDetailModalProps {
  readonly match: HistoricalMatch;
  readonly season?: string;
  readonly onClose: () => void;
}

function formatHistoricalDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("/");
  let d: Date;
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    d = new Date(year, month, day);
  } else {
    d = new Date(dateStr);
  }
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Accessible modal displaying full official match report.
 */
export function HistoricalMatchDetailModal({ match, season: propSeason, onClose }: MatchDetailModalProps) {
  const [detail, setDetail] = useState<HistoricalMatchDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const season = propSeason ?? match.id.split("-").slice(0, 2).join("-");

  const stadiumAsset = getStadiumAsset({
    teamName: match.homeTeam,
    isSporting: match.homeTeam === "Real Sporting",
    venueName: detail?.venue || match.venue,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    let isCancelled = false;
    async function loadDetail() {
      if (!match.bdfMatchId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const res = await getHistoricalMatchDetail(match.bdfMatchId, season, match.isHome);
      if (!isCancelled) {
        setDetail(res);
        setLoading(false);
      }
    }
    loadDetail();
    return () => {
      isCancelled = true;
    };
  }, [match.bdfMatchId, match.isHome, season]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl lg:max-w-5xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl border border-[var(--border)] shadow-2xl p-4 sm:p-6 text-[var(--foreground)]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar acta de partido"
          className="absolute top-3.5 right-3.5 flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] cursor-pointer"
        >
          ✕
        </button>

        {/* Header: Quiet editorial match context */}
        <div className="text-center px-6 sm:px-12 pt-1">
          <p className="text-xs text-neutral-500 font-medium">
            {match.round ? `${match.competition} (${match.round})` : match.competition}
          </p>
          <p className="text-xs text-neutral-400 mt-0.5 tabular-nums">
            {formatHistoricalDate(match.date)}
          </p>
        </div>

        {/* Scoreboard */}
        <MatchScoreboard match={match} stadiumAsset={stadiumAsset} />

        {/* Visual Events Timeline */}
        {detail && (
          <HistoricalMatchEvents
            goals={detail.goals}
            homeStarters={detail.homeStarters}
            awayStarters={detail.awayStarters}
            homeBench={detail.homeBench}
            awayBench={detail.awayBench}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
          />
        )}

        {/* Venue & Referee */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--foreground-muted)] py-2 border-b border-[var(--border)]">
          {(detail?.venue || match.venue) && (
            <div>Estadio: <span className="font-semibold text-[var(--foreground)]">{detail?.venue || match.venue}</span></div>
          )}
          {detail?.referee && (
            <div className="flex items-center gap-1.5 ml-auto">
              {detail.referee.photoUrl && (
                <PlayerPhoto
                  photoUrl={detail.referee.photoUrl}
                  playerName={detail.referee.name}
                  size="custom"
                  className="h-5 w-5 rounded-full border border-[var(--border)] object-cover object-top bg-neutral-100"
                />
              )}
              <span>Árbitro: <span className="font-semibold text-[var(--foreground)]">{detail.referee.name}</span></span>
            </div>
          )}
        </div>

        {/* Loading / Lineups Content */}
        {loading ? (
          <div className="py-12 text-center text-xs text-[var(--foreground-muted)]">Cargando acta oficial del encuentro...</div>
        ) : detail ? (
          <HistoricalMatchLineups
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            homeCrestUrl={match.homeCrestUrl}
            awayCrestUrl={match.awayCrestUrl}
            homeStarters={detail.homeStarters}
            awayStarters={detail.awayStarters}
            homeBench={detail.homeBench}
            awayBench={detail.awayBench}
            homeCoach={detail.homeCoach}
            awayCoach={detail.awayCoach}
          />
        ) : (
          <div className="py-8 text-center text-xs text-[var(--foreground-muted)]">
            No se dispone de las alineaciones digitalizadas para este partido histórico.
          </div>
        )}
      </div>
    </div>
  );
}
