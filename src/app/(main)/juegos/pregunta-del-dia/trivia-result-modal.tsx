// Client: Clean stats and game-over modal aligned with Mareona's design system
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { TriviaDailyChallenge, TriviaPlayerAttempt, TriviaStats } from "@/lib/trivia/types";
import { PlayerPhoto } from "@/components/media/player-photo";
import { areOfficialAssetsEnabled } from "@/lib/legal/official-assets";
import { useModalA11y } from "@/lib/ui/use-modal-a11y";
import { getDictionary } from "@/i18n";

interface TriviaResultModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly stats: TriviaStats;
  readonly challenge: TriviaDailyChallenge;
  readonly attempt: TriviaPlayerAttempt | null;
  readonly onOpenArchive?: () => void;
}

export function TriviaResultModal({
  isOpen,
  onClose,
  stats,
  challenge,
  attempt,
  onOpenArchive,
}: TriviaResultModalProps) {
  const dict = getDictionary();
  const { handleBackdropClick } = useModalA11y({ isOpen, onClose });

  if (!isOpen) return null;

  const winPercentage = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  const isAnswered = attempt !== null;
  const isCorrect = isAnswered && attempt.isCorrect;
  const photoUrl = challenge.question.photoUrl;
  const isLocalImage = Boolean(photoUrl && photoUrl.startsWith("/"));
  const showLocalImage = isLocalImage && areOfficialAssetsEnabled();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="trivia-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-2xs animate-in fade-in duration-150"
      onClick={handleBackdropClick}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-sm flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera limpia y neutral */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <h2 id="trivia-modal-title" className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            {dict.games.trivia.resultModal.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] -mr-2"
            aria-label={dict.games.trivia.resultModal.closeAria}
          >
            ✕
          </button>
        </div>

        {/* Revelación con tarjeta ambiental verde o roja para foto y descripción */}
        {isAnswered && (
          <div
            className={`mt-4 flex flex-col items-center rounded-2xl border p-4 text-center transition-all ${
              isCorrect ? "border-emerald-300 bg-emerald-50 text-emerald-950" : "border-rose-300 bg-rose-50 text-rose-950"
            }`}
          >
            {photoUrl && (
              <div className="relative mb-3 overflow-hidden rounded-xl shadow-xs">
                {showLocalImage ? (
                  <div className="relative h-28 w-44 overflow-hidden rounded-xl">
                    <Image src={photoUrl} alt={challenge.question.canonicalAnswer} fill sizes="180px" className="object-cover" />
                  </div>
                ) : (
                  <div className="h-28 w-28 overflow-hidden rounded-xl">
                    <PlayerPhoto photoUrl={photoUrl} playerName={challenge.question.canonicalAnswer} size="custom" className="h-full w-full object-cover object-top" />
                  </div>
                )}
              </div>
            )}
            <h3 className="text-2xl font-black tracking-tight text-neutral-900">{challenge.question.canonicalAnswer}</h3>
            <p className="mt-2 text-xs font-normal leading-relaxed text-neutral-700 px-1">{challenge.question.explanation}</p>
          </div>
        )}

        {/* Resumen métrico 4 columnas */}
        <div className="mt-5 grid grid-cols-4 items-center border-y border-neutral-100 py-3.5 text-center">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{dict.games.trivia.resultModal.played}</span>
            <span className="mt-1 text-2xl font-black tabular-nums text-neutral-900">{stats.played}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{dict.games.trivia.resultModal.winRate}</span>
            <span className="mt-1 text-2xl font-black tabular-nums text-neutral-900">{winPercentage}%</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{dict.games.trivia.resultModal.currentStreak}</span>
            <span className="mt-1 text-2xl font-black tabular-nums text-[#e2001a]">{stats.currentStreak}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{dict.games.trivia.resultModal.maxStreak}</span>
            <span className="mt-1 text-2xl font-black tabular-nums text-neutral-900">{stats.maxStreak}</span>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="mt-6 flex items-center gap-2.5">
          <Link
            href="/juegos"
            className="flex-1 rounded-xl border border-neutral-200 bg-white py-2.5 text-center text-xs font-bold text-neutral-700 hover:bg-neutral-50 active:scale-98 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            {dict.games.trivia.resultModal.backToGames}
          </Link>
          {onOpenArchive ? (
            <button
              type="button"
              onClick={() => { onClose(); onOpenArchive(); }}
              className="flex-1 rounded-xl bg-[#e2001a] py-2.5 text-center text-xs font-bold text-white shadow-xs hover:bg-[#b30015] active:scale-98 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              {dict.games.trivia.resultModal.playArchive}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-[#e2001a] py-2.5 text-center text-xs font-bold text-white shadow-xs hover:bg-[#b30015] active:scale-98 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              {dict.games.trivia.resultModal.acceptButton}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
