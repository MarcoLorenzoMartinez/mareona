import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Juegos — Mareona",
  description: "Cromos históricos, La Porra de El Molinón, trivias y pasatiempos sportinguistas.",
};

export default function JuegosPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">
          Juegos y Pasatiempos
        </h1>
        <p className="text-sm text-[var(--foreground-muted)]">
          Compite pronosticando resultados, colecciona cromos históricos de El Molinón y pon a prueba tus conocimientos.
        </p>
      </header>

      <section
        aria-label="Zona de juegos"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {/* Colección de Cromos Históricos */}
        <article className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs hover:border-[#e2001a]/50 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#e2001a] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                Nuevo
              </span>
              <span className="text-[11px] font-medium text-[var(--foreground-muted)]">
                24 leyendas
              </span>
            </div>
            <h2 className="mt-3 text-base font-bold text-[var(--foreground)]">
              Cromos Históricos
            </h2>
            <p className="mt-1.5 text-xs text-[var(--foreground-muted)]">
              Colecciona a los futbolistas de todas las épocas, abre sobres diarios y prepara tu alineación para el duelo de leyendas.
            </p>
          </div>
          <Link
            href="/juegos/album"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-[#e2001a] px-4 py-2 text-xs font-bold text-white hover:bg-[#b30015] transition-colors"
          >
            Abrir mi Álbum
          </Link>
        </article>

        {/* La Porra de El Molinón */}
        <article className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-2xs">
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              La Porra de El Molinón
            </h2>
            <p className="mt-2 text-xs text-[var(--foreground-muted)]">
              Pronostica el marcador exacto de cada jornada y escala en el ranking general.
            </p>
          </div>
          <div className="mt-4 rounded-md bg-[var(--surface)] p-2.5 text-center text-xs font-medium text-[var(--foreground-muted)]">
            Fase 1 — En desarrollo
          </div>
        </article>

        {/* Wordle Sportinguista */}
        <article className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-2xs">
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              Wordle Sportinguista
            </h2>
            <p className="mt-2 text-xs text-[var(--foreground-muted)]">
              Adivina la palabra secreta de temática rojiblanca en 6 intentos sin límite de tiempo.
            </p>
          </div>
          <div className="mt-4 rounded-md bg-[var(--surface)] p-2.5 text-center text-xs font-medium text-[var(--foreground-muted)]">
            Fase 1 — En desarrollo
          </div>
        </article>

        {/* Trivia Semanal */}
        <article className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-2xs">
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              Trivia Semanal
            </h2>
            <p className="mt-2 text-xs text-[var(--foreground-muted)]">
              Preguntas y respuestas históricas sobre el Real Sporting de Gijón.
            </p>
          </div>
          <div className="mt-4 rounded-md bg-[var(--surface)] p-2.5 text-center text-xs font-medium text-[var(--foreground-muted)]">
            Fase 1 — En desarrollo
          </div>
        </article>
      </section>
    </div>
  );
}
