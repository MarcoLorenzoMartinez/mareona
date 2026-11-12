import type { Metadata } from "next";
import { getSyncedCardsCatalog } from "@/lib/cards/card-catalog-sync";
import { createClient } from "@/lib/supabase/server";
import { AlbumClientView } from "./album-client-view";

export const metadata: Metadata = {
  title: "Memoria Rojiblanca",
  description: "Colección de cartas y leyendas del Real Sporting desde 1905 hasta hoy.",
};

export default async function AlbumPage() {
  const supabase = await createClient();
  const allCards = await getSyncedCardsCatalog(supabase);

  return (
    <main className="container mx-auto px-4 py-6 max-w-6xl">
      <AlbumClientView allCards={allCards} />
    </main>
  );
}
