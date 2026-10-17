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
      <EphemeridesHub
        initialData={initialData}
        todayMonth={todayMonth}
        todayDay={todayDay}
      />
    </div>
  );
}
