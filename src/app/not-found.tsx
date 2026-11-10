import Link from "next/link";

/**
 * Custom 404 Not Found page adhering to Mareona red/white visual identity.
 * Replaces default Next.js 404 with sporting-themed feedback and navigation recovery.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full max-w-md space-y-5">
        <span className="inline-block rounded-full bg-[var(--surface)] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
          404 • Fuera de Juego
        </span>

        <h1 className="text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
          Página no encontrada
        </h1>

        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
          La jugada no ha prosperado o el enlace ha cambiado de posición en el campo.
          Regresa a la portada para seguir la actualidad sportinguista.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="min-h-10 rounded-full bg-[var(--primary)] px-5 py-2 text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          >
            Volver a la portada
          </Link>
          <Link
            href="/temporada"
            className="min-h-10 rounded-full border border-[var(--border)] bg-white px-5 py-2 text-xs font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            Ver calendario y partidos
          </Link>
        </div>
      </div>
    </div>
  );
}
