// Client: Orquesta la navegación interactiva de fechas, caché local y filtros de efemérides
"use client";

import { Suspense, useState, useTransition } from "react";
import { formatDayMonthLabel, type DayEphemeridesResult } from "@/lib/historical/ephemerides-types";
import { fetchEphemeridesForDayAction } from "./ephemerides-action";
import { EphemeridesCalendar } from "./ephemerides-calendar";
import { EphemeridesDaySummary } from "./ephemerides-day-summary";
import { EphemeridesMilestonesList } from "./ephemerides-milestones-list";
import { EphemeridesMatchesList } from "./ephemerides-matches-list";

interface EphemeridesHubProps {
  readonly initialData: DayEphemeridesResult;
  readonly todayMonth: number;
  readonly todayDay: number;
  readonly currentYear: number;
}

/**
 * Interactive hub coordinating calendar selection, memory cache,
 * and rendering of matches and historic milestones for any chosen day of the year.
 */
export function EphemeridesHub({
  initialData,
  todayMonth,
  todayDay,
  currentYear,
}: EphemeridesHubProps) {
  const [currentMonth, setCurrentMonth] = useState<number>(initialData.month);
  const [currentDay, setCurrentDay] = useState<number>(initialData.day);
  const [cache, setCache] = useState<Record<string, DayEphemeridesResult>>({
    [`${initialData.month}_${initialData.day}`]: initialData,
  });
  const [isPending, startTransition] = useTransition();

  const handleDateChange = (month: number, day: number) => {
    setCurrentMonth(month);
    setCurrentDay(day);
    const key = `${month}_${day}`;
    if (!cache[key]) {
      startTransition(async () => {
        const data = await fetchEphemeridesForDayAction(month, day);
        setCache((prev) => ({ ...prev, [key]: data }));
      });
    }
  };

  const activeKey = `${currentMonth}_${currentDay}`;
  const activeData = cache[activeKey] ?? null;
  const isLoading = isPending || activeData === null;
  const dateLabel = activeData ? activeData.dateLabel : formatDayMonthLabel(currentMonth, currentDay);
  const isToday = currentMonth === todayMonth && currentDay === todayDay;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Section: Standard Calendar + Harmonized Day Summary (Equal Height) */}
      <div className="flex flex-col lg:flex-row gap-5 lg:items-stretch">
        <EphemeridesCalendar
          selectedMonth={currentMonth}
          selectedDay={currentDay}
          todayMonth={todayMonth}
          todayDay={todayDay}
          currentYear={currentYear}
          onSelectDate={handleDateChange}
        />

        <EphemeridesDaySummary
          dateLabel={dateLabel}
          balance={activeData?.balance ?? null}
          isToday={isToday}
          isLoading={isLoading}
        />
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div aria-label="Cargando efemérides" className="flex flex-col gap-3">
          <div className="h-4 w-36 rounded-full bg-[var(--surface)] animate-pulse" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="h-28 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 animate-pulse" />
            <div className="h-28 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 animate-pulse" />
          </div>
        </div>
      )}

      {/* Milestones section */}
      {!isLoading && activeData && activeData.milestones.length > 0 && (
        <EphemeridesMilestonesList milestones={activeData.milestones} />
      )}

      {/* Matches section */}
      {!isLoading && activeData && (
        <Suspense fallback={null}>
          <EphemeridesMatchesList matches={activeData.matches} />
        </Suspense>
      )}
    </div>
  );
}
