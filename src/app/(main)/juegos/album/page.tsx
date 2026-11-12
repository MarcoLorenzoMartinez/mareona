import { Suspense } from "react";
import type { Metadata } from "next";
import { getSyncedCardsCatalog } from "@/lib/cards/card-catalog-sync";
import { createClient } from "@/lib/supabase/server";
import { AlbumClientView } from "./album-client-view";

export const metadata: Metadata = {
  title: "Memoria Rojiblanca",
  description: "Colección de cartas y leyendas del Real Sporting desde 1905 hasta hoy.",
};

async function AlbumContent() {
  const supabase = await createClient();
  const allCards = await getSyncedCardsCatalog(supabase);
  return <AlbumClientView allCards={allCards} />;
}

export default function AlbumPage() {
  return (
    <main className="container mx-auto px-4 py-6 max-w-6xl">
      <Suspense
        fallback={
          <div className="py-20 text-center text-xs text-neutral-400">
            Cargando colección de cromos...
          </div>
        }
      >
        <AlbumContent />
      </Suspense>
    </main>
  );
}
