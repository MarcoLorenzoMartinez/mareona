import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Muro de Leyendas y El Molinón — Histórico — Mareona",
  description: "Récords históricos, leyendas rojiblancas y la memoria de El Molinón.",
};

export default function HistoricoLegadoPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">
          Legado y El Molinón
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Máximos goleadores, futbolistas con más partidos, grandes mitos y el templo del sportinguismo.
        </p>
      </header>

      <section
        aria-label="Contenido en preparación"
        className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xs"
      >
        <div className="rounded-md bg-[var(--surface)] p-4 text-xs text-[var(--muted-foreground)]">
          Unidad 1 completada — Muro de Leyendas y archivo de El Molinón en desarrollo (Unidad 8).
        </div>
      </section>
    </div>
  );
}
