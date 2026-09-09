import { describe, expect, it } from 'vitest';
import { ageBetween, daysUntilBirthday } from '../dates';

const d = (s: string) => new Date(`${s}T12:00:00`);

describe('ageBetween', () => {
  it('exact one year (spanning a leap day = 366 days)', () => {
    const a = ageBetween(d('2000-01-01'), d('2001-01-01'));
    expect(a).toMatchObject({ years: 1, months: 0, days: 0, totalDays: 366 });
  });

  it('handles month borrow', () => {
    const a = ageBetween(d('2000-03-15'), d('2001-03-14'));
    expect(a).toMatchObject({ years: 0, months: 11, days: 27 });
  });

  it('handles leap day', () => {
    const a = ageBetween(d('2000-02-28'), d('2000-03-01'));
    expect(a).toMatchObject({ years: 0, months: 0, days: 2 });
  });

  it('multi-year with remainder', () => {
    const a = ageBetween(d('1990-07-05'), d('2026-09-08'));
    expect(a.years).toBe(36);
    expect(a.months).toBe(2);
    expect(a.days).toBe(3);
  });
});

describe('daysUntilBirthday', () => {
  it('counts to the next birthday', () => {
    expect(daysUntilBirthday(d('1990-12-25'), d('2026-09-08'))).toBe(108);
  });

  it('today is a birthday', () => {
    expect(daysUntilBirthday(d('1990-09-08'), d('2026-09-08'))).toBe(0);
  });

  it('leap-day birthday falls back in non-leap years', () => {
    expect(Number.isFinite(daysUntilBirthday(d('2000-02-29'), d('2026-01-01')))).toBe(true);
  });
});
