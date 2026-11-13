import type { Metadata } from "next";
import { GamesGrid } from "./games-grid";

export const metadata: Metadata = {
  title: "Juegos",
  description: "Pasatiempos y retos diarios del Real Sporting de Gijón.",
};

export default function JuegosPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">Juegos y Pasatiempos</h1>
      <GamesGrid />
    </div>
  );
}
