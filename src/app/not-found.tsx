import Link from "next/link";

/**
 * 404 Not Found page adhering to Mareona's clean, minimalist product design.
 * Direct and sober communication without artificial sports metaphors.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full max-w-sm space-y-4">
        <span className="font-sans text-5xl font-black tabular-nums tracking-tight text-neutral-300">
          404
        </span>

        <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
          Página no encontrada
        </h1>

        <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
          El enlace que buscas no existe o ha cambiado de dirección.
        </p>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--primary)] px-6 py-2 text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
