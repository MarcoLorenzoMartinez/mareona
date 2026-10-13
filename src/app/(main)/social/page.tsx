import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Social — Mareona",
  description: "Comunidad sportinguista, feed de debate y actualidad de la afición.",
};

export default function SocialPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">
          Comunidad Sportinguista
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Punto de encuentro para compartir opiniones, comentar los partidos y conectar con la afición.
        </p>
      </header>

      <section
        aria-label="Actividad de la comunidad"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <article className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-2xs">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Muro de Aficionados
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Publicaciones, comentarios y reacciones de los sportinguistas.
          </p>
          <div className="mt-4 rounded-md bg-[var(--surface)] p-3 text-xs text-[var(--muted-foreground)]">
            Fase 1 — En desarrollo
          </div>
        </article>

        <article className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-2xs">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Canales de Debate
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Hilos temáticos organizados por partido y actualidad de la plantilla.
          </p>
          <div className="mt-4 rounded-md bg-[var(--surface)] p-3 text-xs text-[var(--muted-foreground)]">
            Fase 1 — En desarrollo
          </div>
        </article>
      </section>
    </div>
  );
}
