import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comparador del Ascenso",
  description: "Compara el ritmo del Real Sporting con la media histórica de ascenso y campañas pasadas.",
};

export default function HistoricoComparadorPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">
          Comparador y Termómetro del Ascenso
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Ritmo de puntos frente a la media matemática histórica de Segunda División y comparador de jornadas.
        </p>
      </header>

      <section
        aria-label="Contenido en preparación"
        className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xs"
      >
        <div className="rounded-md bg-[var(--surface)] p-4 text-xs text-[var(--muted-foreground)]">
          Unidad 1 completada — Módulo del Termómetro del Ascenso y Máquina del Tiempo en desarrollo (Unidad 5).
        </div>
      </section>
    </div>
  );
}
