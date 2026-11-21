import { Suspense } from "react";
import type { Metadata } from "next";
import { HistoricoNav } from "@/components/layout/historico-nav";

export const metadata: Metadata = {
  description: "Archivo histórico, efemérides y leyendas del Real Sporting de Gijón.",
};

export default function HistoricoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-6">
      <Suspense fallback={null}>
        <HistoricoNav />
      </Suspense>
      {children}
    </div>
  );
}
