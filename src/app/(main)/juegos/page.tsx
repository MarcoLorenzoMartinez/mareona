import type { Metadata } from "next";
import { GamesGrid } from "./games-grid";
import { getDictionary } from "@/i18n";

const dict = getDictionary();

export const metadata: Metadata = {
  title: dict.games.hub.metadata.title,
  description: dict.games.hub.metadata.description,
};

export default function JuegosPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">{dict.games.hub.srTitle}</h1>
      <GamesGrid />
    </div>
  );
}
