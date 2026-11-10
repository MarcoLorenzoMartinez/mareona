// Client: Root error boundary for fatal layout crashes
"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

/**
 * Root fallback boundary rendering minimal HTML document when RootLayout fails.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global critical error:", error);
  }, [error]);

  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-center font-sans text-neutral-900">
        <div className="w-full max-w-md space-y-4">
          <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-700">
            Error Crítico
          </span>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900">
            Fallo crítico del sistema
          </h1>
          <p className="text-xs leading-relaxed text-neutral-600">
            No se ha podido inicializar la estructura principal de la aplicación.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={reset}
              className="rounded-full bg-[#e2001a] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-90"
            >
              Reintentar
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
