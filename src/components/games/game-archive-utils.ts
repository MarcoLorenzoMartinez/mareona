// Pure helper for building monthly calendar grid cells in GameArchiveModal
import type { ArchiveCalendarCell } from "./game-archive-grid";
import type { ChallengeDayStatus } from "./game-archive-modal";

interface BuildArchiveCellsParams {
  readonly viewYear: number;
  readonly viewMonth: number;
  readonly todayDate: string;
  readonly epochDate: string;
  readonly getStatusForDate: (dateStr: string) => ChallengeDayStatus;
}

export function buildArchiveCalendarCells({
  viewYear,
  viewMonth,
  todayDate,
  epochDate,
  getStatusForDate,
}: BuildArchiveCellsParams): (ArchiveCalendarCell | null)[] {
  const firstDayOfMonth = new Date(Date.UTC(viewYear, viewMonth, 1));
  const dayOfWeek = (firstDayOfMonth.getUTCDay() + 6) % 7;
  const totalDays = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();

  const result: (ArchiveCalendarCell | null)[] = [];
  for (let i = 0; i < dayOfWeek; i++) {
    result.push(null);
  }

  for (let day = 1; day <= totalDays; day++) {
    const monthPadded = String(viewMonth + 1).padStart(2, "0");
    const dayPadded = String(day).padStart(2, "0");
    const dateStr = `${viewYear}-${monthPadded}-${dayPadded}`;
    const isFuture = dateStr > todayDate;
    const isPastEpoch = dateStr < epochDate;

    let status: ChallengeDayStatus = "UNPLAYED";
    if (!isFuture && !isPastEpoch) {
      status = getStatusForDate(dateStr);
    }

    result.push({
      day,
      dateStr,
      status,
      isFuture,
      isPastEpoch,
    });
  }

  return result;
}
