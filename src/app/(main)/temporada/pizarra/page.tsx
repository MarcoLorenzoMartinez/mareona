import { cacheLife } from "next/cache";
import type { Metadata } from "next";
import { fetchSportingSquad, fetchNextFixture } from "@/lib/sports-api/client";
import { buildUnifiedRoster } from "@/lib/lineup-builder/roster-builder";
import { LineupBuilderClient } from "./lineup-builder-client";

export const metadata: Metadata = {
  title: "Mi Once",
  description:
    "Diseña tu alineación ideal del Real Sporting con jugadores del primer equipo, filial y cantera. Mueve posiciones y descárgala para compartir en redes.",
};

export default async function PizarraPage() {
  "use cache";
  cacheLife("minutes");
  const [firstTeamSquad, nextFixture] = await Promise.all([
    fetchSportingSquad(),
    fetchNextFixture(),
  ]);
  const unifiedRoster = buildUnifiedRoster(firstTeamSquad);

  const opponent = nextFixture
    ? nextFixture.homeTeam.isSporting
      ? nextFixture.awayTeam
      : nextFixture.homeTeam
    : null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">Mi Once — Pizarra Táctica del Real Sporting</h1>
      <LineupBuilderClient
        initialRoster={unifiedRoster}
        nextMatchId={nextFixture?.externalId ?? null}
        nextMatchOpponent={opponent?.name ?? null}
        nextMatchOpponentCrestUrl={opponent?.crestUrl ?? null}
      />
    </div>
  );
}
