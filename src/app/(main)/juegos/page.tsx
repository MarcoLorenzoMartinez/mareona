import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Juegos — Mareona",
  description: "Cromos históricos, La Porra de El Molinón y pasatiempos sportinguistas.",
};

export default function JuegosPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">Juegos y Pasatiempos</h1>

      <section
        aria-label="Zona de juegos"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {/* Colección de Cromos Históricos */}
        <article className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs hover:border-[#e2001a]/50 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#e2001a] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                Álbum
              </span>
              <span className="text-[11px] font-medium text-[var(--foreground-muted)]">
                Colección
              </span>
            </div>
            <h2 className="mt-3 text-base font-bold text-[var(--foreground)]">
              Cromos Históricos
            </h2>
            <p className="mt-1.5 text-xs text-[var(--foreground-muted)]">
              Colecciona a los futbolistas de todas las épocas, abre sobres de 5 cartas y completa las décadas rojiblancas.
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
        <article className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs hover:border-[#e2001a]/50 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#e2001a] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                Diario
              </span>
              <span className="text-[11px] font-medium text-[var(--foreground-muted)]">
                Pasatiempos
              </span>
            </div>
            <h2 className="mt-3 text-base font-bold text-[var(--foreground)]">
              Wordle Sportinguista
            </h2>
            <p className="mt-1.5 text-xs text-[var(--foreground-muted)]">
              Adivina la palabra del Real Sporting de hoy en 6 intentos. Nueva palabra cada día a las 00:00 y archivo de retos anteriores.
            </p>
          </div>
          <Link
            href="/juegos/wordle"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-[#e2001a] px-4 py-2 text-xs font-bold text-white hover:bg-[#b30015] transition-colors"
          >
            Jugar al Wordle
          </Link>
        </article>

        {/* La Pregunta del Día */}
        <article className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs hover:border-[#e2001a]/50 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#e2001a] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                Diario
              </span>
              <span className="text-[11px] font-medium text-[var(--foreground-muted)]">
                Trivia
              </span>
            </div>
            <h2 className="mt-3 text-base font-bold text-[var(--foreground)]">
              La Pregunta del Día
            </h2>
            <p className="mt-1.5 text-xs text-[var(--foreground-muted)]">
              Un reto diario sobre la historia rojiblanca. Demuestra cuánto sabes sobre jugadores, hitos y datos del Sporting.
            </p>
          </div>
          <Link
            href="/juegos/pregunta-del-dia"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-[#e2001a] px-4 py-2 text-xs font-bold text-white hover:bg-[#b30015] transition-colors"
          >
            Responder Reto de Hoy
          </Link>
        </article>
        {/* ¿Mayor o Menor? */}
        <article className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs hover:border-[#e2001a]/50 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#e2001a] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                Desafío
              </span>
              <span className="text-[11px] font-medium text-[var(--foreground-muted)]">
                Pasatiempos
              </span>
            </div>
            <h2 className="mt-3 text-base font-bold text-[var(--foreground)]">
              ¿Mayor o Menor?
            </h2>
            <p className="mt-1.5 text-xs text-[var(--foreground-muted)]">
              Pon a prueba tus conocimientos comparando futbolistas del Sporting por partidos jugados, goles oficiales y minutos.
            </p>
          </div>
          <Link
            href="/juegos/mayor-menor"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-[#e2001a] px-4 py-2 text-xs font-bold text-white hover:bg-[#b30015] transition-colors"
          >
            Jugar a Mayor o Menor
          </Link>
        </article>
      </section>
    </div>
  );
}
