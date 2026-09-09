import { describe, expect, it } from 'vitest';
import { cronDescribe, cronNext, parseCron } from '../cron';

describe('parseCron', () => {
  it('parses wildcards and lists', () => {
    const p = parseCron('0 9 * * 1-5');
    expect(p.ok).toBe(true);
    if (!p.ok) return;
    expect(p.minutes.has(0)).toBe(true);
    expect(p.hours.has(9)).toBe(true);
    expect(p.dows.has(1)).toBe(true);
    expect(p.dows.has(5)).toBe(true);
    expect(p.dows.has(0)).toBe(false);
  });

  it('supports steps and commas', () => {
    const p = parseCron('*/15 8,14 * * *');
    expect(p.ok).toBe(true);
    if (!p.ok) return;
    expect([...p.minutes].sort((a, b) => a - b)).toEqual([0, 15, 30, 45]);
    expect([...p.hours].sort((a, b) => a - b)).toEqual([8, 14]);
  });

  it('rejects bad field counts and out-of-range values', () => {
    expect(parseCron('* * * *').ok).toBe(false);
    expect(parseCron('60 * * * *').ok).toBe(false);
    expect(parseCron('* 24 * * *').ok).toBe(false);
  });

  it('treats 7 as Sunday', () => {
    const p = parseCron('0 0 * * 7');
    expect(p.ok).toBe(true);
    if (!p.ok) return;
    expect(p.dows.has(0)).toBe(true);
  });
});

describe('cronNext', () => {
  it('finds the next weekday 09:00 runs', () => {
    const res = cronNext('0 9 * * 1-5', new Date('2026-01-01T12:00:00'), 5);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.dates.map((d) => d.toISOString().slice(0, 16))).toEqual([
      '2026-01-02T09:00',
      '2026-01-05T09:00',
      '2026-01-06T09:00',
      '2026-01-07T09:00',
      '2026-01-08T09:00',
    ]);
  });

  it('handles */15 stepping', () => {
    const res = cronNext('*/15 * * * *', new Date('2026-01-01T10:01:00'), 4);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.dates.map((d) => d.toISOString().slice(11, 16))).toEqual(['10:15', '10:30', '10:45', '11:00']);
  });

  it('never returns times before `from`', () => {
    const res = cronNext('* * * * *', new Date('2026-01-01T10:00:00'), 3);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    for (const d of res.dates) expect(d.getTime()).toBeGreaterThan(new Date('2026-01-01T10:00:00').getTime());
  });
});

describe('cronDescribe', () => {
  it('describes common schedules', () => {
    expect(cronDescribe('0 9 * * 1-5')).toContain('9:00 AM');
    expect(cronDescribe('0 9 * * 1-5')).toContain('weekdays');
    expect(cronDescribe('*/5 * * * *')).toContain('every 5 minutes');
    expect(cronDescribe('0 */6 * * *')).toContain('every 6 hours');
    expect(cronDescribe('* * * * *')).toBe('Every minute.');
    expect(cronDescribe('nope')).toBe('Invalid expression.');
  });
});
