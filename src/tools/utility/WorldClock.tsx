import { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/ui/primitives';
import { WORLD_CLOCK_CITIES, dateInZone, timeInZone, utcOffsetLabel } from '../../lib/timezones';

function tick(): Date {
  return new Date();
}

export default function WorldClock() {
  const [now, setNow] = useState(tick);
  const localZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(tick()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const isToday = (zone: string) => {
    const a = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
    const b = new Intl.DateTimeFormat('en-CA', { timeZone: localZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
    if (a === b) return '';
    const day = new Intl.DateTimeFormat('en-GB', { timeZone: zone, weekday: 'short' }).format(now);
    return a > b ? `${day} +1d` : `${day} −1d`;
  };

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center justify-between gap-2 p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Your time · {localZone}</p>
          <p className="font-mono text-2xl font-bold tabular-nums">{timeInZone(now, localZone)}</p>
        </div>
        <p className="font-mono text-sm text-zinc-500">{dateInZone(now, localZone)} · {utcOffsetLabel(now, localZone)}</p>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {WORLD_CLOCK_CITIES.map(({ city, zone }) => (
          <Card key={`${city}-${zone}`} className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-semibold">{city}</p>
              <p className="text-xs text-zinc-500">{zone}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-xl font-bold tabular-nums">{timeInZone(now, zone)}</p>
              <p className="font-mono text-xs text-zinc-500">
                {utcOffsetLabel(now, zone)}
                {isToday(zone) ? ` · ${isToday(zone)}` : ''}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
