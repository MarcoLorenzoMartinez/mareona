// Client: Barra superior de navegación de hilo con botón de regreso y mención de respuesta
"use client";

import { ArrowLeft } from "lucide-react";

interface ThreadHeaderBarProps {
  readonly onBack: () => void;
  readonly parentUsername?: string | null;
}

export function ThreadHeaderBar({ onBack, parentUsername }: ThreadHeaderBarProps) {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--border)] bg-white px-3 py-2">
      <button
        type="button"
        onClick={onBack}
        aria-label="Volver a la conversación anterior"
        className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-700 transition-colors duration-150 hover:bg-[var(--surface)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <div className="min-w-0">
        <h2 className="text-base font-bold text-neutral-900">Conversación</h2>
        {parentUsername && (
          <p className="truncate text-xs text-neutral-500">
            En respuesta a @{parentUsername}
          </p>
        )}
      </div>
    </div>
  );
}
