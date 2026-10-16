import type { Metadata } from "next";
import { SeasonNav } from "@/components/layout/season-nav";

export const metadata: Metadata = {
  title: "Temporada — Mareona",
  description: "Partidos, clasificación y actualidad del Real Sporting de Gijón.",
};

export default function TemporadaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-6">
      <SeasonNav />
      {children}
    </div>
  );
}
