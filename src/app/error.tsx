// Client: Error boundary accesible con captura de excepciones y botón de reintento
"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

/**
 * Next.js error boundary catching unhandled client and server exceptions.
 * Renders a clean, high-contrast Sporting fallback state without decorative fluff.
 */
export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-black tracking-tight text-[var(--foreground)] sm:text-3xl">
          Algo no ha salido bien
        </h1>

        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
          Se ha producido un error inesperado al procesar la información.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--primary)] px-5 text-sm font-bold text-white shadow-xs transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--border)] bg-white px-5 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
