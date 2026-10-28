import type { Metadata } from "next";
import { HISTORICAL_CARDS_SEED } from "@/lib/cards/seed-data";
import { AlbumClientView } from "./album-client-view";

export const metadata: Metadata = {
  title: "Memoria Rojiblanca",
  description: "Colección de cartas y leyendas del Real Sporting de Gijón desde 1905 hasta hoy.",
};

export default function AlbumPage() {
  return (
    <main className="container mx-auto px-4 py-6 max-w-6xl">
      <AlbumClientView allCards={HISTORICAL_CARDS_SEED} />
    </main>
  );
}
