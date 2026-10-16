import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Efemérides Sportinguistas — Histórico — Mareona",
  description: "Partidos oficiales, hitos y aniversarios vividos un día como hoy en la historia del Sporting.",
};

export default function HistoricoEfemeridesPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">
          Efemérides Sportinguistas
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Un día como hoy en la historia rojiblanca y efemérides interactivas.
        </p>
      </header>

      <section
        aria-label="Contenido en preparación"
        className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xs"
      >
        <div className="rounded-md bg-[var(--surface)] p-4 text-xs text-[var(--muted-foreground)]">
          Unidad 1 completada — Efemérides de hoy y buscador &ldquo;¿Qué pasó el día que naciste?&rdquo; en desarrollo (Unidad 6).
        </div>
      </section>
    </div>
  );
}
