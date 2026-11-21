// Client: Root error boundary for fatal layout crashes
"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/telemetry/client-error-reporter";
import "./globals.css";

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
    reportClientError(error);
  }, [error]);

  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-center font-sans text-neutral-900">
        <div className="w-full max-w-md space-y-4">
          <h1 className="text-2xl font-black tracking-tight text-neutral-900">
            Algo no ha salido bien
          </h1>
          <p className="text-sm leading-relaxed text-neutral-600">
            Se ha producido un problema al inicializar la aplicación.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-10 items-center justify-center rounded-md bg-[#e2001a] px-5 text-sm font-bold text-white shadow-xs transition-opacity hover:opacity-90"
            >
              Reintentar
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
