// Client: Lee estado de cliente (localStorage) de pronósticos y sobres disponibles
"use client";

import Link from "next/link";
import { MiniPack } from "@/components/cards/mini-pack";
import { getDictionary } from "@/i18n";
import { useDailyActions, type PorraOpening } from "./use-daily-actions";

interface DailyActionsCardProps {
  readonly porra: (PorraOpening & { readonly opponentName: string; readonly kickoffLabel: string }) | null;
}

interface GameButtonProps {
  readonly href: string;
  readonly label: string;
  readonly isDone: boolean;
}

/**
 * Clean tactile button for daily challenges.
 * Shows an inline checkmark when today's puzzle is completed, without garish badges or AI fluff.
 */
function GameButton({ href, label, isDone }: GameButtonProps) {
  return (
    <Link
      href={href}
      aria-label={isDone ? `${label} (completado hoy)` : label}
      className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-center text-xs font-bold transition-colors duration-150 active:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
        isDone
          ? "border-neutral-200/80 bg-neutral-50 text-[var(--foreground)] hover:border-neutral-300"
          : "border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
      }`}
    >
      <span>{label}</span>
      {isDone && (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5 text-emerald-600 shrink-0"
          aria-hidden="true"
        >
          <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
        </svg>
      )}
    </Link>
  );
}

/**
 * Daily entry points: the pack to open (only while unclaimed), the open Porra
 * (only while unvoted) and the daily minigames with discreet completion feedback.
 */
export function DailyActionsCard({ porra }: DailyActionsCardProps) {
  const dict = getDictionary().home.today;
  const actions = useDailyActions(porra);

  return (
    <section
      aria-label={dict.title}
      className="flex flex-col rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs select-none"
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <h2 className="text-base font-bold text-[var(--foreground)]">{dict.title}</h2>
        <Link
          href="/juegos"
          className="shrink-0 rounded-xs text-xs font-semibold text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)]"
        >
          {dict.viewAll} &rarr;
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {actions?.packReady && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-[var(--surface)] p-3">
            <div className="flex min-w-0 items-center gap-3">
              <MiniPack tier="aficionado" size="md" />
              <span className="truncate text-sm font-bold text-[var(--foreground)]">
                {dict.pack.title}
              </span>
            </div>
            <Link
              href="/juegos/album?tab=packs"
              className="shrink-0 rounded-full bg-[var(--primary)] px-3.5 py-1.5 text-xs font-bold text-white transition-colors duration-150 hover:bg-[var(--primary-strong)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
            >
              {dict.pack.action}
            </Link>
          </div>
        )}

        {actions?.porraPending && porra && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-[var(--surface)] px-3 py-2.5">
            <div className="min-w-0">
              <span className="block text-sm font-bold text-[var(--foreground)]">
                {dict.porra.title}
              </span>
              <span className="block truncate text-xs text-[var(--foreground-muted)]">
                {porra.opponentName} · {porra.kickoffLabel}
              </span>
            </div>
            <Link
              href="/juegos/porra"
              className="shrink-0 rounded-full border border-[var(--primary)] px-3.5 py-1.5 text-xs font-bold text-[var(--primary)] transition-colors duration-150 hover:bg-[var(--primary)] hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
            >
              {dict.porra.action}
            </Link>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <GameButton
            href="/juegos/wordle"
            label="Wordle"
            isDone={actions?.wordleDone ?? false}
          />
          <GameButton
            href="/juegos/pregunta-del-dia"
            label="Trivia"
            isDone={actions?.triviaDone ?? false}
          />
          <GameButton
            href="/juegos/quien-es"
            label="¿Quién es?"
            isDone={actions?.whoAreYaDone ?? false}
          />
        </div>
      </div>
    </section>
  );
}
