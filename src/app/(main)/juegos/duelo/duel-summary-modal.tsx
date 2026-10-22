"use client"; // Client: Modal accesible de resumen de final de partido

import Link from "next/link";

interface DuelSummaryModalProps {
  readonly isOpen: boolean;
  readonly playerScore: number;
  readonly aiScore: number;
  readonly onRematch: () => void;
}

export function DuelSummaryModal({
  isOpen,
  playerScore,
  aiScore,
  onRematch,
}: DuelSummaryModalProps) {
  if (!isOpen) return null;

  const isWin = playerScore > aiScore;
  const isTie = playerScore === aiScore;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="duel-result-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
    >
      <div className="flex w-full max-w-md flex-col items-center rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xl text-center">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
            isWin
              ? "bg-emerald-100 text-emerald-800"
              : isTie
              ? "bg-amber-100 text-amber-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {isWin ? "¡Victoria Rojiblanca!" : isTie ? "Empate en El Molinón" : "Derrota Ajustada"}
        </span>

        <h2 id="duel-result-title" className="mt-3 text-2xl font-black text-[var(--foreground)]">
          {isWin ? "Has conquistado el partido" : isTie ? "Duelo de máxima igualdad" : "Buen intento táctico"}
        </h2>

        {/* Marcador final estilo videomarcador */}
        <div className="my-6 flex items-center justify-center gap-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-8 py-4">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-[var(--foreground-muted)]">Tu Once</span>
            <span className="font-sans font-black tabular-nums text-4xl text-[#e2001a]">
              {playerScore}
            </span>
          </div>
          <span className="text-xl font-bold text-[var(--foreground-muted)]">-</span>
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-[var(--foreground-muted)]">Rival Histórico</span>
            <span className="font-sans font-black tabular-nums text-4xl text-[var(--foreground)]">
              {aiScore}
            </span>
          </div>
        </div>

        <p className="text-xs text-[var(--foreground-muted)]">
          {isWin
            ? "+50 puntos ganados para el ranking general y experiencia para desbloquear sobres."
            : "+20 puntos por completar el duelo de 11 rondas."}
        </p>

        <div className="mt-6 flex w-full flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={onRematch}
            className="flex-1 rounded-full bg-[#e2001a] py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-[#b30015] transition-colors"
          >
            Jugar Revancha
          </button>
          <Link
            href="/juegos"
            className="flex-1 rounded-full border border-[var(--border)] bg-white py-2.5 text-xs font-bold text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors text-center"
          >
            Volver a Juegos
          </Link>
        </div>
      </div>
    </div>
  );
}
