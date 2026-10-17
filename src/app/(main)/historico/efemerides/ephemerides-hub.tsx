// Client: Orquesta la navegación interactiva de fechas, caché local y filtros de efemérides
"use client";

import { useState, useTransition, useMemo } from "react";
import type { DayEphemeridesResult } from "@/lib/historical/ephemerides-types";
import { fetchEphemeridesForDayAction } from "./ephemerides-action";
import { EphemeridesCalendar } from "./ephemerides-calendar";
import { EphemeridesDaySummary } from "./ephemerides-day-summary";
import { EphemeridesMilestonesList } from "./ephemerides-milestones-list";
import { EphemeridesMatchesList } from "./ephemerides-matches-list";

interface EphemeridesHubProps {
  readonly initialData: DayEphemeridesResult;
  readonly todayMonth: number;
  readonly todayDay: number;
}

const FILTER_ITEMS = [
  { key: "all", label: "Todo" },
  { key: "matches", label: "Solo Partidos" },
  { key: "milestones", label: "Solo Hitos" },
] as const;

/**
 * Interactive hub coordinating calendar selection, memory cache, category filtering,
 * and rendering of matches and historic milestones for any chosen day of the year.
 */
export function EphemeridesHub({
  initialData,
  todayMonth,
  todayDay,
}: EphemeridesHubProps) {
  const [currentMonth, setCurrentMonth] = useState<number>(initialData.month);
  const [currentDay, setCurrentDay] = useState<number>(initialData.day);
  const [activeFilter, setActiveFilter] = useState<"all" | "matches" | "milestones">("all");
  const [cache, setCache] = useState<Record<string, DayEphemeridesResult>>({
    [`${initialData.month}_${initialData.day}`]: initialData,
  });
  const [, startTransition] = useTransition();

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

  const activeData = useMemo(() => {
    return cache[`${currentMonth}_${currentDay}`] ?? initialData;
  }, [cache, currentMonth, currentDay, initialData]);

  const isToday = currentMonth === todayMonth && currentDay === todayDay;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Section: Compact Standard-Sized Calendar + Day Summary */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        <EphemeridesCalendar
          selectedMonth={currentMonth}
          selectedDay={currentDay}
          todayMonth={todayMonth}
          todayDay={todayDay}
          onSelectDate={handleDateChange}
        />

        <div className="flex flex-1 flex-col gap-3 w-full">
          {/* Filter Pills */}
          <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Mostrar contenido
            </span>
            <div className="inline-flex rounded-full bg-[var(--surface)] p-1 border border-[var(--border)]">
              {FILTER_ITEMS.map((item) => {
                const isActive = activeFilter === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveFilter(item.key)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-[var(--primary)] text-white font-bold"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <EphemeridesDaySummary
            dateLabel={activeData.dateLabel}
            balance={activeData.balance}
            milestonesCount={activeData.milestones.length}
            isToday={isToday}
          />
        </div>
      </div>

      {/* Milestones section */}
      {(activeFilter === "all" || activeFilter === "milestones") && (
        <EphemeridesMilestonesList milestones={activeData.milestones} />
      )}

      {/* Matches section */}
      {(activeFilter === "all" || activeFilter === "matches") && (
        <EphemeridesMatchesList matches={activeData.matches} />
      )}
    </div>
  );
}
