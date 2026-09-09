/** Date/age math, pure and tested. */

export interface Age {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalHours: number;
}

function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate();
}

/** Exact calendar difference from `start` to `end` (end must be >= start). */
export function ageBetween(start: Date, end: Date): Age {
  let y = end.getFullYear() - start.getFullYear();
  let m = end.getMonth() - start.getMonth();
  let d = end.getDate() - start.getDate();
  if (d < 0) {
    m -= 1;
    d += daysInMonth(end.getFullYear(), end.getMonth() - 1);
  }
  if (m < 0) {
    y -= 1;
    m += 12;
  }
  // Calendar-day difference via UTC day boundaries — immune to DST offsets.
  const startDay = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  const totalDays = Math.round((endDay - startDay) / 86_400_000);
  return {
    years: y,
    months: m,
    days: d,
    totalDays,
    totalWeeks: Math.floor(totalDays / 7),
    totalHours: Math.floor(totalDays * 24),
  };
}

/** Days until the next occurrence of the given birth date (excluding today+0 edge cases). */
export function daysUntilBirthday(birth: Date, today: Date): number {
  const thisYear = new Date(today.getFullYear(), birth.getMonth(), birth.getDate(), 12);
  // Feb 29 in a non-leap year falls back to Feb 28.
  if (thisYear.getMonth() !== birth.getMonth() || thisYear.getDate() !== birth.getDate()) {
    return Math.max(0, Math.round((new Date(today.getFullYear(), 1, 28, 12).getTime() - noonMs(today)) / 86_400_000));
  }
  if (thisYear.getTime() < noonMs(today)) {
    return Math.round((new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate(), 12).getTime() - noonMs(today)) / 86_400_000);
  }
  return Math.round((thisYear.getTime() - noonMs(today)) / 86_400_000);
}

function noonMs(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12).getTime();
}
