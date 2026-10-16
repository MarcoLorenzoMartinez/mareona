// Client: Modal accesible de acta oficial con alineaciones, goles, árbitro y cuerpo técnico
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { HistoricalMatch, HistoricalMatchDetail } from "@/lib/historical/types";
import { getHistoricalMatchDetail } from "@/lib/historical/match-detail-server";
import { getStadiumAsset } from "@/lib/sports-api/stadiums";
import { TeamCrest } from "@/components/media/team-crest";
import { PlayerPhoto } from "@/components/media/player-photo";
import { HistoricalMatchLineups } from "./match-detail-lineups";
import { HistoricalMatchEvents } from "./match-detail-events";

interface MatchDetailModalProps {
  readonly match: HistoricalMatch;
  readonly season?: string;
  readonly onClose: () => void;
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
  }, [match.bdfMatchId, season]);

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
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Header: Competition & Round */}
        <div className="text-center pr-8 pl-8">
          <span className="inline-block rounded-full bg-[var(--surface)] border border-[var(--border)] px-3 py-0.5 text-xs font-semibold text-[var(--foreground-muted)]">
            {match.competition} · {match.round}
          </span>
          <div className="text-xs text-[var(--foreground-muted)] mt-1 tabular-nums">{match.date}</div>
        </div>

        {/* Scoreboard */}
        <div id="match-modal-title" className="relative overflow-hidden grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 my-4 py-4 bg-[var(--surface)] rounded-xl border border-[var(--border)] px-3 sm:px-6">
          {stadiumAsset && (
            <div className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden" aria-hidden="true">
              <Image src={stadiumAsset.imagePath} alt="" fill sizes="(max-width: 768px) 100vw, 900px" className="object-cover opacity-15" />
            </div>
          )}

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-end gap-2 text-right">
            <span className={`text-sm sm:text-base ${match.homeTeam === "Real Sporting" ? "font-bold text-[var(--primary)]" : "font-bold text-[var(--foreground)]"}`}>
              {match.homeTeam}
            </span>
            <TeamCrest crestUrl={match.homeCrestUrl} teamName={match.homeTeam} size="md" isSporting={match.homeTeam === "Real Sporting"} />
          </div>

          <div className="relative z-10 px-3 py-1 bg-white rounded-lg border border-[var(--border)] text-base sm:text-xl font-black tabular-nums shadow-2xs">
            {match.homeScore} - {match.awayScore}
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row-reverse items-center justify-end gap-2 text-left">
            <span className={`text-sm sm:text-base ${match.awayTeam === "Real Sporting" ? "font-bold text-[var(--primary)]" : "font-bold text-[var(--foreground)]"}`}>
              {match.awayTeam}
            </span>
            <TeamCrest crestUrl={match.awayCrestUrl} teamName={match.awayTeam} size="md" isSporting={match.awayTeam === "Real Sporting"} />
          </div>
        </div>

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
                  size="sm"
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
