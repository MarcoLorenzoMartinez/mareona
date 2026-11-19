// Client: Tira compacta de acceso rápido para móvil, lee estado de localStorage
"use client";

import Link from "next/link";
import { MiniPack } from "@/components/cards/mini-pack";
import { useDailyActions, type PorraOpening } from "./use-daily-actions";

interface DailyGlanceStripProps {
  readonly porra: (PorraOpening & { readonly opponentName: string; readonly kickoffLabel: string }) | null;
}

/**
 * Mobile-only glance card placed between the Hero and Standings.
 * Compact white recuadros without gray backgrounds.
 */
export function DailyGlanceStrip({ porra }: DailyGlanceStripProps) {
  const actions = useDailyActions(porra);

  return (
    <section
      aria-label="Juegos del día"
      className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-white p-3 shadow-2xs lg:hidden select-none"
    >
      {/* Fila 1: Sobre diario */}
      {actions?.packReady && (
        <Link
          href="/juegos/album?tab=packs"
          className="group flex min-h-10 items-center justify-between gap-2.5 rounded-lg border border-[var(--border)] bg-white px-2.5 py-1.5 transition-colors active:scale-[0.99]"
        >
          <div className="flex items-center gap-2 min-w-0">
            <MiniPack tier="aficionado" size="sm" />
            <span className="text-xs font-bold text-[var(--foreground)] truncate">
              Sobre diario disponible
            </span>
          </div>
          <span className="shrink-0 rounded-full bg-[var(--primary)] px-2.5 py-0.5 text-xs font-bold text-white">
            Abrir
          </span>
        </Link>
      )}

      {/* Fila 2: La Porra si está activa */}
      {porra && (actions?.porraPending || actions?.porraVoted) && (
        <Link
          href="/juegos/porra"
          className={`flex min-h-10 items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 transition-colors active:scale-[0.99] ${
            actions.porraVoted
              ? "border-neutral-200/80 bg-neutral-50/70 text-[var(--foreground)]"
              : "border-[var(--border)] bg-white"
          }`}
        >
          <div className="min-w-0">
            <span className="block text-xs font-bold text-[var(--foreground)] truncate">
              La Porra vs {porra.opponentName}
            </span>
          </div>
          {actions.porraVoted ? (
            <span className="shrink-0 text-xs font-bold text-emerald-600">
              ✓ Listo
            </span>
          ) : (
            <span className="shrink-0 rounded-full border border-[var(--primary)] px-2 py-0.5 text-xs font-bold text-[var(--primary)]">
              Pronosticar
            </span>
          )}
        </Link>
      )}

      {/* Fila 3: Grid de los tres retos diarios */}
      <div className="grid grid-cols-3 gap-1.5">
        <Link
          href="/juegos/wordle"
          aria-label={actions?.wordleDone ? "Wordle (completado)" : "Wordle"}
          className={`flex min-h-9 items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-bold transition-colors ${
            actions?.wordleDone
              ? "border-neutral-200/80 bg-neutral-50 text-[var(--foreground)]"
              : "border-[var(--border)] bg-white text-[var(--foreground)] active:bg-neutral-50"
          }`}
        >
          <span>Wordle</span>
          {actions?.wordleDone && (
            <span className="text-[11px] font-bold text-emerald-600" aria-hidden="true">
              ✓
            </span>
          )}
        </Link>

        <Link
          href="/juegos/pregunta-del-dia"
          aria-label={actions?.triviaDone ? "Trivia (completado)" : "Trivia"}
          className={`flex min-h-9 items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-bold transition-colors ${
            actions?.triviaDone
              ? "border-neutral-200/80 bg-neutral-50 text-[var(--foreground)]"
              : "border-[var(--border)] bg-white text-[var(--foreground)] active:bg-neutral-50"
          }`}
        >
          <span>Trivia</span>
          {actions?.triviaDone && (
            <span className="text-[11px] font-bold text-emerald-600" aria-hidden="true">
              ✓
            </span>
          )}
        </Link>

        <Link
          href="/juegos/quien-es"
          aria-label={actions?.whoAreYaDone ? "¿Quién es? (completado)" : "¿Quién es?"}
          className={`flex min-h-9 items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-bold transition-colors ${
            actions?.whoAreYaDone
              ? "border-neutral-200/80 bg-neutral-50 text-[var(--foreground)]"
              : "border-[var(--border)] bg-white text-[var(--foreground)] active:bg-neutral-50"
          }`}
        >
          <span>¿Quién es?</span>
          {actions?.whoAreYaDone && (
            <span className="text-[11px] font-bold text-emerald-600" aria-hidden="true">
              ✓
            </span>
          )}
        </Link>
      </div>
    </section>
  );
}
