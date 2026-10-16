import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Historial Cara a Cara (H2H) — Histórico — Mareona",
  description: "Buscador y balance histórico del Real Sporting frente a todos sus rivales oficiales.",
};

export default function HistoricoRivalesPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">
          Historial Cara a Cara
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Balance histórico, victorias y goles contra todos los rivales a los que se ha enfrentado el Sporting.
        </p>
      </header>

      <section
        aria-label="Contenido en preparación"
        className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xs"
      >
        <div className="rounded-md bg-[var(--surface)] p-4 text-xs text-[var(--muted-foreground)]">
          Unidad 1 completada — Buscador unificado H2H y ficha de rivales en desarrollo (Unidad 7).
        </div>
      </section>
    </div>
  );
}
