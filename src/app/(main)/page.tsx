import type { Metadata } from "next";
import Link from "next/link";
import { Users2, MessageSquare, Gamepad2 } from "lucide-react";
import { fetchStandings, fetchNextFixture } from "@/lib/sports-api/client";
import {
  getSeasonLabel,
  type DomainStandingRow,
  type DomainMatchSummary,
} from "@/lib/sports-api/types";
import { NextFixtureHero } from "./temporada/next-fixture-hero";
import { SeasonSummaryTable } from "./temporada/season-summary-table";

export const metadata: Metadata = {
  title: "Mareona — Real Sporting de Gijón",
  description: "Actualidad, partidos, clasificación y comunidad del Real Sporting de Gijón.",
};

const QUICK_ACTIONS = [
  {
    title: "Mi Once",
    description: "Diseña tu pizarra táctica",
    href: "/temporada/pizarra",
    icon: Users2,
  },
  {
    title: "Social",
    description: "Debates y tertulia sportinguista",
    href: "/social",
    icon: MessageSquare,
  },
  {
    title: "Juegos",
    description: "Porra y pasatiempos diarios",
    href: "/juegos",
    icon: Gamepad2,
  },
] as const;

export default async function HomePage() {
  "use cache";
  let standings: readonly DomainStandingRow[] = [];
  let match: DomainMatchSummary | null = null;

  try {
    const [standingsRes, matchRes] = await Promise.allSettled([
      fetchStandings(undefined, undefined, { includeSplits: false }),
      fetchNextFixture(),
    ]);

    if (standingsRes.status === "fulfilled" && standingsRes.value.length > 0) {
      standings = standingsRes.value;
    }

    if (matchRes.status === "fulfilled") {
      match = matchRes.value;
    }
  } catch {
    // Falls back to transparent empty state without fake data
  }

  const seasonLabel = getSeasonLabel();

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Tarjeta Hero del próximo partido con previa y cuenta atrás */}
      <NextFixtureHero match={match} />

      {/* 2. Accesos directos a secciones clave de actualidad */}
      <section aria-label="Accesos rápidos" className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-white p-4 shadow-2xs transition-colors hover:border-[#e2001a]/30 hover:bg-neutral-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 group-hover:bg-[#e2001a]/10 group-hover:text-[#e2001a] transition-colors">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-neutral-900 group-hover:text-[#e2001a] transition-colors">
                      {action.title}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {action.description}
                    </span>
                  </div>
                </div>
                <span className="text-neutral-400 group-hover:text-[#e2001a] text-sm font-semibold transition-colors">
                  &rarr;
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Resumen compacto de clasificación */}
      <SeasonSummaryTable standings={standings} seasonLabel={seasonLabel} />
    </div>
  );
}
