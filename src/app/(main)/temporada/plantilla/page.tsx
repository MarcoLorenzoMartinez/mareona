import type { Metadata } from "next";
import { fetchSportingSquad } from "@/lib/sports-api/client";
import { groupSquadByPosition, getSeasonLabel } from "@/lib/sports-api/types";
import { getDictionary } from "@/i18n";
import { SquadGroup } from "./squad-group";

export function generateMetadata(): Metadata {
  const dict = getDictionary();
  return {
    title: `${dict.season.squad.title} — Mareona`,
    description: dict.season.description,
  };
}

export default async function PlantillaPage() {
  "use cache";
  const dict = getDictionary();
  const t = dict.season.squad;
  const seasonLabel = getSeasonLabel();
  const players = await fetchSportingSquad();
  const grouped = groupSquadByPosition(players);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="sr-only">
        {t.title} — {dict.season.competitionName} {seasonLabel}
      </h1>

      {players.length > 0 ? (
        <>
          <SquadGroup
            title={t.groups.goalkeepers}
            players={grouped.goalkeepers}
          />
          <SquadGroup
            title={t.groups.defenders}
            players={grouped.defenders}
          />
          <SquadGroup
            title={t.groups.midfielders}
            players={grouped.midfielders}
          />
          <SquadGroup
            title={t.groups.forwards}
            players={grouped.forwards}
          />
        </>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-12 text-center shadow-2xs">
          <p className="text-sm text-[var(--foreground-muted)]">
            {t.noSquad}
          </p>
        </div>
      )}
    </div>
  );
}
