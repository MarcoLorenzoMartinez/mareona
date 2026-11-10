// Client: Error boundary accesible con captura de excepciones y botón de reintento
"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

/**
 * Standard Next.js error boundary boundary catching unhandled client and server errors.
 * Renders corporate red/white fallback UI with retry capability.
 */
export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log exception context for production diagnostics
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full max-w-md space-y-5">
        <span className="inline-block rounded-full bg-red-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-red-700">
          Incidencia Técnica
        </span>

        <h1 className="text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
          Algo no ha salido como esperábamos
        </h1>

        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
          Se ha producido una incidencia inesperada al procesar la solicitud.
          Puedes intentar recargar la vista o volver al terreno de juego principal.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={reset}
            className="min-h-10 rounded-full bg-[var(--primary)] px-5 py-2 text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          >
            Reintentar la acción
          </button>
          <Link
            href="/"
            className="min-h-10 rounded-full border border-[var(--border)] bg-white px-5 py-2 text-xs font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
