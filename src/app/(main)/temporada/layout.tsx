import { Suspense } from "react";
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
      <Suspense
        fallback={
          <nav
            aria-label="Secciones de la temporada"
            className="w-full border-b border-[var(--border)] bg-white h-11"
          />
        }
      >
        <SeasonNav />
      </Suspense>
      {children}
    </div>
  );
}
