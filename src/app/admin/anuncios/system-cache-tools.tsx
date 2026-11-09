"use client"; // Client: Petición interactiva para invalidar la caché de partidos y clasificaciones

import { useTransition } from "react";
import { purgeSportsCacheAction } from "@/lib/admin/system-actions";
import { toast } from "@/lib/ui/toast";

/**
 * Administrative panel tool to force-purge and revalidate cached football data.
 */
export function SystemCacheTools() {
  const [isPending, startTransition] = useTransition();

  function handlePurge() {
    startTransition(async () => {
      const res = await purgeSportsCacheAction();
      if (res.success) {
        toast.success("Caché deportiva purgada y revalidada con éxito");
      } else {
        toast.error("Error al purgar la caché", { description: res.error });
      }
    });
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xs">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-bold text-[var(--foreground)]">
            Caché de Partidos y Clasificaciones
          </h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)] max-w-xl">
            Invalida de inmediato la caché en servidor de las páginas de temporada, historial y partidos en directo. Útil si las APIs de FotMob o ESPN han desfasado un marcador o una jornada.
          </p>
        </div>

        <button
          type="button"
          disabled={isPending}
          onClick={handlePurge}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white px-5 py-2 text-xs font-bold text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] disabled:opacity-50"
        >
          {isPending ? "Purgando..." : "↻ Purgar y Recargar Datos"}
        </button>
      </div>
    </section>
  );
}
