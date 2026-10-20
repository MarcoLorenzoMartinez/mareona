// Client: Tarjetas de estadísticas de aficionado y gamificación
"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";

export function ProfileStats() {
  const { profile } = useAuth();
  const points = profile?.points ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Puntos Conseguidos
        </span>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-[var(--primary)] font-sans tabular-nums">
            {points}
          </span>
          <span className="text-xs font-medium text-neutral-400">pts</span>
        </div>
        <p className="mt-1 text-[11px] text-neutral-500">
          Sumados por pronósticos acertados en la Porra
        </p>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Próxima Jornada
        </span>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-base font-bold text-neutral-900">
            Porra Activa
          </span>
        </div>
        <p className="mt-1 text-[11px] text-neutral-500">
          Envía tu pronóstico antes del pitido inicial
        </p>
        <Link
          href="/juegos"
          className="mt-3 inline-flex items-center text-xs font-bold text-[var(--primary)] hover:underline"
        >
          <span>Ir a Porra</span>
          <svg className="ml-1 h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-2xs">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Rango en Mareona
        </span>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-base font-bold text-neutral-900">
            {points >= 100 ? "Aficionado Veterano" : "Aficionado Canterano"}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-neutral-500">
          Comunidad oficial del Real Sporting
        </p>
      </div>
    </div>
  );
}
