// Client: Formulario interno para seleccionar destino y redactar mensaje al compartir alineación
"use client";

import type { SharedLineupData } from "@/lib/lineup-builder/shared-lineup-codec";

export type ShareDestination = "social" | "match";

interface ShareLineupFormProps {
  readonly destination: ShareDestination;
  readonly onDestinationChange: (dest: ShareDestination) => void;
  readonly userComment: string;
  readonly onCommentChange: (comment: string) => void;
  readonly maxCommentLength: number;
  readonly remainingChars: number;
  readonly lineup: SharedLineupData;
  readonly nextMatchId?: string | null;
  readonly nextMatchOpponent?: string | null;
  readonly isSubmitting: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (e: React.FormEvent) => void;
}

export function ShareLineupForm({
  destination,
  onDestinationChange,
  userComment,
  onCommentChange,
  maxCommentLength,
  remainingChars,
  lineup,
  nextMatchId,
  nextMatchOpponent,
  isSubmitting,
  onClose,
  onSubmit,
}: ShareLineupFormProps) {
  return (
    <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
      {/* Selector de destino tipo píldora */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-neutral-600">Publicar en:</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onDestinationChange("social")}
            className={`flex-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
              destination === "social"
                ? "bg-[#e2001a] text-white shadow-xs"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
          >
            Tertulia Rojiblanca
          </button>
          {nextMatchId && (
            <button
              type="button"
              onClick={() => onDestinationChange("match")}
              className={`flex-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                destination === "match"
                  ? "bg-[#e2001a] text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              Grada vs {nextMatchOpponent ?? "Rival"}
            </button>
          )}
        </div>
      </div>

      {/* Comentario opcional del aficionado */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="share-comment" className="text-xs font-semibold text-neutral-600">
            Mensaje (opcional):
          </label>
          <span
            className={`text-[11px] tabular-nums ${
              remainingChars < 20 ? "text-[#e2001a] font-bold" : "text-neutral-400"
            }`}
          >
            {remainingChars} car.
          </span>
        </div>
        <textarea
          id="share-comment"
          rows={3}
          maxLength={maxCommentLength}
          value={userComment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="¿Qué te parece mi once? ¿Harías algún cambio?"
          className="w-full rounded-xl border border-neutral-300 p-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-[#e2001a] focus:outline-none focus:ring-1 focus:ring-[#e2001a]"
        />
      </div>

      {/* Resumen táctico */}
      <div className="flex items-center justify-between rounded-xl bg-neutral-50 px-3.5 py-2 border border-neutral-200 text-xs">
        <span className="font-semibold text-neutral-700">Esquema táctico:</span>
        <span className="rounded-full bg-neutral-200 px-2 py-0.5 font-bold text-neutral-900 tabular-nums">
          {lineup.formationKey}
        </span>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="rounded-full border border-neutral-300 px-4 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-[#e2001a] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#b30015] disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Publicando..." : "Publicar Alineación"}
        </button>
      </div>
    </form>
  );
}
