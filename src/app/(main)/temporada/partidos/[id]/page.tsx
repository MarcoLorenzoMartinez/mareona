import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import type { Metadata } from "next";
import { fetchMatchDetail, fetchNextFixture } from "@/lib/sports-api/client";
import { getDictionary } from "@/i18n";
import { MatchDetailView } from "./match-detail-view";

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
      title: dict.season.matchDetail.title,
    };
  }

  return {
    title: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
    description: match.roundName
      ? `${match.competition} · ${match.roundName}`
      : match.matchday
      ? `${match.competition} · ${dict.season.match.matchday} ${match.matchday}`
      : match.competition,
  };
}

function MatchDetailSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse" aria-busy="true">
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
  const [match, nextFixture] = await Promise.all([
    fetchMatchDetail(id),
    fetchNextFixture(),
  ]);

  if (!match) {
    return (
      <div className="flex flex-col gap-3">
        <Link
          href="/temporada/partidos"
          className="inline-flex items-center gap-1.5 py-1 text-xs font-bold text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] rounded-md"
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
    <div className="flex flex-col gap-3">
      <nav aria-label="Navegación de retorno" className="-mt-1">
        <Link
          href="/temporada/partidos"
          className="inline-flex items-center gap-1.5 py-1 text-xs font-bold text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-strong)] rounded-md"
        >
          ← {dict.season.matchDetail.backToMatches}
        </Link>
      </nav>

      <MatchDetailView
        initialMatch={match}
        isNextFixture={nextFixture?.externalId === match.externalId}
      />
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
