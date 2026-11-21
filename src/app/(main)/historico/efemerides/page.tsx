import { cacheLife } from "next/cache";
import type { Metadata } from "next";
import { getEphemeridesForDay } from "@/lib/historical/ephemerides-service";
import { getTodayMadridIsoDate } from "@/lib/games/daily-date";
import { EphemeridesHub } from "./ephemerides-hub";

export const metadata: Metadata = {
  title: "Efemérides Sportinguistas",
  description:
    "Partidos oficiales, hitos, aniversarios y momentos icónicos vividos un día como hoy en la historia del Real Sporting.",
};

export default async function HistoricoEfemeridesPage() {
  "use cache";
  cacheLife("minutes");
  const [currentYear, todayMonth, todayDay] = getTodayMadridIsoDate().split("-").map(Number);

  const initialData = getEphemeridesForDay(todayMonth, todayDay);

  return (
    <div className="flex flex-col gap-6">
      <EphemeridesHub
        initialData={initialData}
        todayMonth={todayMonth}
        todayDay={todayDay}
        currentYear={currentYear}
      />
    </div>
  );
}
