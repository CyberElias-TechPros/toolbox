/** 5-field cron parsing, human description and next-occurrence finding.
 * Pure and tested. Fields: minute hour day-of-month month day-of-week. */

export type CronParse =
  | { ok: true; minutes: Set<number>; hours: Set<number>; doms: Set<number>; months: Set<number>; dows: Set<number>; domStar: boolean; dowStar: boolean }
  | { ok: false; error: string };

type FieldParse = { ok: true; values: Set<number>; star: boolean } | { ok: false; error: string };

function parseField(spec: string, min: number, max: number, what: string): FieldParse {
  const values = new Set<number>();
  let star = false;
  for (const part of spec.split(',')) {
    const m = part.trim().match(/^(?:(\*|\d+(?:-\d+)?)(?:\/(\d+))?)$/);
    if (!m) return { ok: false, error: `Invalid ${what} part "${part}".` };
    const range = m[1];
    const step = m[2] ? parseInt(m[2], 10) : 1;
    if (step < 1) return { ok: false, error: `Invalid step in ${what} part "${part}".` };
    let lo: number;
    let hi: number;
    if (range === '*') {
      lo = min;
      hi = max;
      if (!m[2]) star = true;
    } else if (range.includes('-')) {
      const [a, b] = range.split('-').map((x) => parseInt(x, 10));
      if (a > b) return { ok: false, error: `Invalid range "${range}" in ${what}.` };
      lo = a;
      hi = b;
    } else {
      lo = parseInt(range, 10);
      hi = m[2] ? max : lo;
    }
    if (lo < min || hi > max) return { ok: false, error: `${what} value out of range (${min}–${max}): "${part}".` };
    for (let v = lo; v <= hi; v += step) values.add(v);
  }
  return { ok: true, values, star };
}

export function parseCron(expr: string): CronParse {
  const fields = expr.trim().split(/\s+/);
  if (fields.length !== 5) return { ok: false, error: 'Expected 5 fields: minute hour day-of-month month day-of-week.' };
  const [mRes, hRes, dRes, moRes, wRes] = [
    parseField(fields[0], 0, 59, 'minute'),
    parseField(fields[1], 0, 23, 'hour'),
    parseField(fields[2], 1, 31, 'day-of-month'),
    parseField(fields[3], 1, 12, 'month'),
    parseField(fields[4], 0, 7, 'day-of-week'),
  ];
  if (!mRes.ok) return { ok: false, error: mRes.error };
  if (!hRes.ok) return { ok: false, error: hRes.error };
  if (!dRes.ok) return { ok: false, error: dRes.error };
  if (!moRes.ok) return { ok: false, error: moRes.error };
  if (!wRes.ok) return { ok: false, error: wRes.error };
  const dows = new Set<number>();
  wRes.values.forEach((v) => dows.add(v % 7));
  return {
    ok: true,
    minutes: mRes.values,
    hours: hRes.values,
    doms: dRes.values,
    months: moRes.values,
    dows,
    domStar: dRes.star,
    dowStar: wRes.star,
  };
}

const DOW_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const fmtTime = (h: number, m: number): string =>
  `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;

function simple(set: Set<number>, name: (v: number) => string): string | null {
  if (set.size === 0) return null;
  const sorted = [...set].sort((a, b) => a - b);
  if (sorted.length === 1) return name(sorted[0]);
  if (sorted.length === 2) return `${name(sorted[0])} and ${name(sorted[1])}`;
  return sorted.map(name).join(', ');
}

/** Rough-but-honest human description of a cron expression. */
export function cronDescribe(expr: string): string {
  const p = parseCron(expr);
  if (!p.ok) return 'Invalid expression.';
  const specs = expr.trim().split(/\s+/);
  const minStep = /^\*\/(\d+)$/.exec(specs[0]);
  const hourStep = /^\*\/(\d+)$/.exec(specs[1]);

  if (p.minutes.size === 60 && p.hours.size === 24 && p.doms.size === 31 && p.months.size === 12 && p.dows.size === 7) {
    return 'Every minute.';
  }
  const parts: string[] = [];
  if (minStep) parts.push(`every ${minStep[1]} minutes`);
  else if (hourStep) parts.push(`every ${hourStep[1]} hours`);
  else if (p.minutes.size === 60) parts.push('every hour');
  else if (p.hours.size === 1 && p.minutes.size === 1) parts.push(`at ${fmtTime([...p.hours][0], [...p.minutes][0])}`);
  else if (p.hours.size === 24) parts.push(`at ${simple(p.minutes, (m) => `minute ${m}`) ?? 'various minutes'}, every day`);
  else parts.push(`during ${simple(p.hours, (h) => `${h}:00 hour`)} at ${simple(p.minutes, (m) => `minute ${m}`)}`);

  const when: string[] = [];
  if (!p.domStar) {
    const t = simple(p.doms, (d) => `day ${d}`);
    if (t) when.push(`on ${t}`);
  }
  if (!p.dowStar) {
    const days = [...p.dows].sort((a, b) => a - b);
    let t: string;
    if (days.length === 5 && days.every((d) => d >= 1 && d <= 5)) t = 'weekdays';
    else if (days.length === 2 && days.includes(0) && days.includes(6)) t = 'weekends';
    else t = simple(p.dows, (d) => DOW_NAMES[d]) ?? 'various days';
    when.push(`on ${t}`);
  }
  if (!p.domStar && !p.dowStar) when.push('(either the day-of-month or day-of-week may match)');
  const m = simple(p.months, (mo) => MONTH_NAMES[mo - 1]);
  if (m) when.push(`in ${m}`);

  return parts.join(' ') + (when.length ? ' ' + when.join(', ') : ' every day') + '.';
}

/** Next N occurrences (local time) strictly after `from`. */
export function cronNext(expr: string, from: Date, count = 5): { ok: true; dates: Date[] } | { ok: false; error: string } {
  const p = parseCron(expr);
  if (!p.ok) return { ok: false, error: p.error };
  const dates: Date[] = [];
  const cursor = new Date(from.getTime());
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);
  const limit = cursor.getTime() + 366 * 86400000;
  while (cursor.getTime() < limit && dates.length < count) {
    if (
      p.months.has(cursor.getMonth() + 1) &&
      p.hours.has(cursor.getHours()) &&
      p.minutes.has(cursor.getMinutes())
    ) {
      const domOk = p.doms.has(cursor.getDate());
      const dowOk = p.dows.has(cursor.getDay());
      // Standard cron rule: if both dom and dow are restricted, either may match;
      // otherwise the restricted one must match.
      const dayOk =
        p.domStar && p.dowStar ? true : p.domStar ? dowOk : p.dowStar ? domOk : domOk || dowOk;
      if (dayOk) dates.push(new Date(cursor.getTime()));
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  return { ok: true, dates };
}
