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

function CheckIcon() {
  return (
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
  );
}

/**
 * Clean tactile button for daily challenges.
 * Shows an inline checkmark when today's puzzle is completed.
 */
function GameButton({ href, label, isDone }: GameButtonProps) {
  return (
    <Link
      href={href}
      aria-label={isDone ? `${label} (completado hoy)` : label}
      className={`flex min-h-12 items-center justify-center gap-1.5 rounded-lg border px-2 py-3 text-center text-xs font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
        isDone
          ? "border-neutral-200/80 bg-neutral-50 text-[var(--foreground)] hover:border-neutral-300"
          : "border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:shadow-2xs active:scale-[0.98]"
      }`}
    >
      <span>{label}</span>
      {isDone && <CheckIcon />}
    </Link>
  );
}

/**
 * Daily entry points: unclaimed card pack, upcoming Porra, and 3 daily games.
 * Designed with slim white recuadros without AI gray-box bloat.
 */
export function DailyActionsCard({ porra }: DailyActionsCardProps) {
  const dict = getDictionary().home.today;
  const actions = useDailyActions(porra);

  return (
    <section
      aria-label={dict.title}
      className="flex flex-col rounded-xl border border-[var(--border)] bg-white px-4 py-3.5 sm:px-5 sm:py-4 shadow-2xs select-none"
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
        <h2 className="text-base font-bold text-[var(--foreground)]">{dict.title}</h2>
        <Link
          href="/juegos"
          className="shrink-0 rounded-xs text-xs font-semibold text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)]"
        >
          {dict.viewAll} &rarr;
        </Link>
      </div>

      <div className="mt-3.5 flex flex-col gap-3">
        {/* Sobre diario: barra compacta interactiva */}
        {actions?.packReady && (
          <Link
            href="/juegos/album?tab=packs"
            className="group flex min-h-11 items-center justify-between gap-2.5 rounded-lg border border-[var(--border)] bg-white px-3 py-2 transition-all duration-150 hover:border-[var(--primary)] hover:shadow-2xs active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            <div className="flex min-w-0 items-center gap-2">
              <MiniPack tier="aficionado" size="sm" />
              <span className="truncate text-xs font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                {dict.pack.title}
              </span>
            </div>
            <span className="shrink-0 rounded-full bg-[var(--primary)] px-2.5 py-0.5 text-xs font-bold text-white transition-colors group-hover:bg-[var(--primary-strong)]">
              {dict.pack.action}
            </span>
          </Link>
        )}

        {/* La Porra: recuadro blanco interactivo y estilizado */}
        {porra && (actions?.porraPending || actions?.porraVoted) && (
          <Link
            href="/juegos/porra"
            className={`group flex min-h-11 items-center justify-between gap-2.5 rounded-lg border px-3 py-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
              actions.porraVoted
                ? "border-neutral-200/80 bg-neutral-50/70 text-[var(--foreground)] hover:border-neutral-300"
                : "border-[var(--border)] bg-white hover:border-[var(--primary)] hover:shadow-2xs active:scale-[0.99]"
            }`}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-xs font-bold text-[var(--foreground)] shrink-0">
                {dict.porra.title}
              </span>
              <span className="truncate text-xs text-[var(--foreground-muted)]">
                vs {porra.opponentName}
              </span>
            </div>

            {actions.porraVoted ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 shrink-0">
                <span>Pronosticado</span>
                <CheckIcon />
              </span>
            ) : (
              <span className="shrink-0 rounded-full border border-[var(--primary)] px-2.5 py-0.5 text-xs font-bold text-[var(--primary)] transition-colors group-hover:bg-[var(--primary)] group-hover:text-white">
                {dict.porra.action}
              </span>
            )}
          </Link>
        )}

        {/* Fila compacta de los 3 minijuegos diarios */}
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
