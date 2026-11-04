import type { Metadata } from "next";
import { fetchSportingSquad } from "@/lib/sports-api/client";
import { buildUnifiedRoster } from "@/lib/lineup-builder/roster-builder";
import { LineupBuilderClient } from "./lineup-builder-client";

export const metadata: Metadata = {
  title: "Mi Once",
  description:
    "Diseña tu alineación ideal del Real Sporting con jugadores del primer equipo, filial y cantera. Mueve posiciones y descárgala para compartir en redes.",
};

export default async function PizarraPage() {
  "use cache";
  const firstTeamSquad = await fetchSportingSquad();
  const unifiedRoster = buildUnifiedRoster(firstTeamSquad);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">Mi Once — Pizarra Táctica del Real Sporting</h1>
      <LineupBuilderClient initialRoster={unifiedRoster} />
    </div>
  );
}
