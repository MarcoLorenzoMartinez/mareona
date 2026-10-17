import type { Metadata } from "next";
import { getEphemeridesForDay } from "@/lib/historical/ephemerides-service";
import { EphemeridesHub } from "./ephemerides-hub";

export const metadata: Metadata = {
  title: "Efemérides Sportinguistas — Histórico — Mareona",
  description:
    "Partidos oficiales, hitos, aniversarios y momentos icónicos vividos un día como hoy en la historia del Real Sporting.",
};

export default async function HistoricoEfemeridesPage() {
  "use cache";
  const now = new Date();
  const todayMonth = now.getMonth() + 1;
  const todayDay = now.getDate();

  const initialData = getEphemeridesForDay(todayMonth, todayDay);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">
          Efemérides Sportinguistas
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Partidos disputados, aniversarios de oro y efemérides de leyendas en cada día del calendario rojiblanco.
        </p>
      </header>

      <EphemeridesHub
        initialData={initialData}
        todayMonth={todayMonth}
        todayDay={todayDay}
      />
    </div>
  );
}
