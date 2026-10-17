// Client: Calendario compacto para seleccionar cualquier día del año
"use client";

interface EphemeridesCalendarProps {
  readonly selectedMonth: number;
  readonly selectedDay: number;
  readonly todayMonth: number;
  readonly todayDay: number;
  readonly onSelectDate: (month: number, day: number) => void;
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
] as const;

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"] as const;

/**
 * Compact, standard web-sized calendar box (max 310px) with white background
 * and active date marked in corporate red circle.
 */
export function EphemeridesCalendar({
  selectedMonth,
  selectedDay,
  todayMonth,
  todayDay,
  onSelectDate,
}: EphemeridesCalendarProps) {
  const daysInMonth = new Date(2024, selectedMonth, 0).getDate();
  const firstDayWeekIndex = new Date(2024, selectedMonth - 1, 1).getDay();
  // Monday is 0, Sunday is 6
  const startOffset = (firstDayWeekIndex + 6) % 7;

  const handlePrevMonth = () => {
    const nextM = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const maxDays = new Date(2024, nextM, 0).getDate();
    onSelectDate(nextM, Math.min(selectedDay, maxDays));
  };

  const handleNextMonth = () => {
    const nextM = selectedMonth === 12 ? 1 : selectedMonth + 1;
    const maxDays = new Date(2024, nextM, 0).getDate();
    onSelectDate(nextM, Math.min(selectedDay, maxDays));
  };

  return (
    <section
      aria-label="Calendario de efemérides"
      className="w-full max-w-[310px] mx-auto lg:mx-0 shrink-0 rounded-xl border border-[var(--border)] bg-white p-3.5 shadow-2xs"
    >
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border)]">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] text-xs font-bold text-[var(--foreground)] hover:bg-[var(--surface)] active:scale-95 transition-transform"
          aria-label="Mes anterior"
        >
          ‹
        </button>

        <span className="text-center text-sm font-bold text-[var(--foreground)]">
          {MONTH_NAMES[selectedMonth - 1]}
        </span>

        <button
          type="button"
          onClick={handleNextMonth}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] text-xs font-bold text-[var(--foreground)] hover:bg-[var(--surface)] active:scale-95 transition-transform"
          aria-label="Mes siguiente"
        >
          ›
        </button>
      </div>

      {/* Weekdays Header */}
      <div className="grid grid-cols-7 text-center pt-2 pb-1">
        {WEEKDAYS.map((w, idx) => (
          <span
            key={w}
            className={`text-[11px] font-bold ${
              idx >= 5 ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
            }`}
          >
            {w}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`offset-${i}`} className="h-8 w-8" />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const isSelected = selectedDay === day;
          const isToday = selectedMonth === todayMonth && day === todayDay;

          return (
            <div key={day} className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => onSelectDate(selectedMonth, day)}
                aria-pressed={isSelected}
                aria-label={`${day} de ${MONTH_NAMES[selectedMonth - 1]}`}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-sans tabular-nums transition-all active:scale-95 ${
                  isSelected
                    ? "bg-[var(--primary)] text-white font-extrabold shadow-2xs"
                    : isToday
                    ? "border border-[var(--primary)] text-[var(--primary)] font-bold hover:bg-[var(--primary)]/10"
                    : "text-[var(--foreground)] hover:bg-[var(--surface)] font-medium"
                }`}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
