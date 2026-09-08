import { useEffect, useRef, useState } from 'react';
import { Button, Card } from '../../components/ui/primitives';

function fmt(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const t = Math.floor(ms % 1000);
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  const tt = String(t).padStart(3, '0');
  return h > 0 ? `${h}:${mm}:${ss}.${tt}` : `${mm}:${ss}.${tt}`;
}

export default function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const baseRef = useRef(0); // accumulated ms when paused
  const startRef = useRef(0); // Date.now() at start

  useEffect(() => {
    if (!running) return;
    startRef.current = Date.now();
    const t = window.setInterval(() => setElapsed(baseRef.current + (Date.now() - startRef.current)), 33);
    return () => window.clearInterval(t);
  }, [running]);

  const toggle = () => {
    if (running) {
      baseRef.current = elapsed;
      setRunning(false);
    } else {
      setRunning(true);
    }
  };

  const reset = () => {
    setRunning(false);
    baseRef.current = 0;
    setElapsed(0);
    setLaps([]);
  };

  const lap = () => setLaps((prev) => [elapsed, ...prev]);

  return (
    <Card className="mx-auto max-w-xl p-6 text-center sm:p-8">
      <p
        aria-live="polite"
        className="font-mono text-5xl font-bold tabular-nums tracking-tight sm:text-6xl"
      >
        {fmt(elapsed)}
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={toggle} className="min-w-[8rem]">
          {running ? '⏸ Pause' : elapsed > 0 ? '▶ Resume' : '▶ Start'}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={lap}
          disabled={!running && elapsed === 0}
        >
          🏁 Lap
        </Button>
        <Button variant="secondary" size="lg" onClick={reset} disabled={elapsed === 0 && laps.length === 0}>
          ↺ Reset
        </Button>
      </div>

      {laps.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Laps</h2>
          <ul className="mt-2 max-h-64 overflow-auto text-left">
            {[...laps].map((v, i) => {
              const idx = laps.length - i;
              const split = v - (laps[i + 1] ?? 0);
              return (
                <li
                  key={i}
                  className="flex items-center justify-between border-b border-zinc-100 py-2 font-mono text-sm tabular-nums last:border-0 dark:border-zinc-800/60"
                >
                  <span className="text-zinc-400">Lap {idx}</span>
                  <span>+{fmt(split)}</span>
                  <span>{fmt(v)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
