import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import type { Metadata } from "next";
import { fetchMatchDetail } from "@/lib/sports-api/client";
import { getDictionary } from "@/i18n";
import { MatchHeader } from "./match-header";
import { MatchTabs } from "./match-tabs";

interface MatchDetailPageProps {
  readonly params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: MatchDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const match = await fetchMatchDetail(id);
  const dict = getDictionary();

  if (!match) {
    return {
      title: `${dict.season.matchDetail.title} — Mareona`,
    };
  }

  return {
    title: `${match.homeTeam.name} vs ${match.awayTeam.name} — Mareona`,
    description: `${match.competition} · ${dict.season.match.matchday} ${match.matchday ?? "—"}`,
  };
}

function MatchDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse" aria-busy="true">
      <div className="h-5 w-32 rounded-md bg-neutral-200" />
      <div className="h-52 rounded-xl border border-[var(--border)] bg-white p-6 shadow-2xs" />
      <div className="mx-auto h-10 w-80 rounded-full bg-neutral-200" />
      <div className="h-64 rounded-xl border border-[var(--border)] bg-white p-6 shadow-2xs" />
    </div>
  );
}

async function MatchDetailContent({ params }: MatchDetailPageProps) {
  const { id } = await params;
  await connection();

  const dict = getDictionary();
  const match = await fetchMatchDetail(id);

  if (!match) {
    return (
      <div className="flex flex-col gap-6">
        <Link
          href="/temporada/partidos"
          className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-bold text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] rounded-md"
        >
          ← {dict.season.matchDetail.backToMatches}
        </Link>
        <div className="rounded-xl border border-[var(--border)] bg-white p-12 text-center shadow-2xs">
          <p className="text-sm text-[var(--foreground-muted)]">
            {dict.season.matchDetail.notFound}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Navegación de retorno">
        <Link
          href="/temporada/partidos"
          className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-bold text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] rounded-md"
        >
          ← {dict.season.matchDetail.backToMatches}
        </Link>
      </nav>

      <MatchHeader match={match} />
      <MatchTabs match={match} />
    </div>
  );
}

export default function MatchDetailPage({ params }: MatchDetailPageProps) {
  return (
    <Suspense fallback={<MatchDetailSkeleton />}>
      <MatchDetailContent params={params} />
    </Suspense>
  );
}
