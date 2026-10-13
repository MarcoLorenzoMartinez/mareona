import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Juegos — Mareona",
  description: "La Porra de El Molinón, trivias y pasatiempos sportinguistas.",
};

export default function JuegosPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">
          Juegos y Pasatiempos
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Compite pronosticando resultados, adivina la palabra del día y pon a prueba tus conocimientos.
        </p>
      </header>

      <section
        aria-label="Zona de juegos"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <article className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-2xs">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            La Porra de El Molinón
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Pronostica el marcador exacto de cada jornada y escala en el ranking general.
          </p>
          <div className="mt-4 rounded-md bg-[var(--surface)] p-3 text-xs text-[var(--muted-foreground)]">
            Fase 1 — En desarrollo
          </div>
        </article>

        <article className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-2xs">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Wordle Sportinguista
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Adivina la palabra secreta de temática rojiblanca en 6 intentos sin límite de tiempo.
          </p>
          <div className="mt-4 rounded-md bg-[var(--surface)] p-3 text-xs text-[var(--muted-foreground)]">
            Fase 1 — En desarrollo
          </div>
        </article>

        <article className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-2xs">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Trivia Semanal
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Preguntas y respuestas históricas sobre el Real Sporting de Gijón.
          </p>
          <div className="mt-4 rounded-md bg-[var(--surface)] p-3 text-xs text-[var(--muted-foreground)]">
            Fase 1 — En desarrollo
          </div>
        </article>
      </section>
    </div>
  );
}
