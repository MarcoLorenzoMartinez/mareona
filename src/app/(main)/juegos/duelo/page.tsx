import type { Metadata } from "next";
import { HISTORICAL_CARDS_SEED } from "@/lib/cards/seed-data.ts";
import { DuelMatchView } from "./duel-match-view";

export const metadata: Metadata = {
  title: "Duelo de Once Inicial — Mareona",
  description: "Enfrenta a tu mejor alineación histórica del Real Sporting en combates tácticos con niebla de guerra.",
};

export default function DueloPage() {
  return (
    <main className="container mx-auto px-4 py-6 max-w-4xl">
      <DuelMatchView allCards={HISTORICAL_CARDS_SEED} />
    </main>
  );
}
