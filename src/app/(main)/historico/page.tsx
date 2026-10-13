import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Histórico — Mareona",
  description: "Archivo histórico y efemérides del Real Sporting de Gijón.",
};

export default function HistoricoPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">
          Archivo Histórico
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Más de un siglo de historia sportinguista, leyendas, temporadas pasadas y efemérides.
        </p>
      </header>

      <section
        aria-label="Contenido histórico"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <article className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-2xs">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Efemérides de Hoy
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Hitos y partidos legendarios disputados un día como hoy en la historia rojiblanca.
          </p>
          <div className="mt-4 rounded-md bg-[var(--surface)] p-3 text-xs text-[var(--muted-foreground)]">
            Fase 1 — Datos en preparación
          </div>
        </article>

        <article className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-2xs">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Temporadas Pasadas
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Resultados, plantillas y clasificaciones de campañas históricas.
          </p>
          <div className="mt-4 rounded-md bg-[var(--surface)] p-3 text-xs text-[var(--muted-foreground)]">
            Fase 1 — Datos en preparación
          </div>
        </article>
      </section>
    </div>
  );
}
