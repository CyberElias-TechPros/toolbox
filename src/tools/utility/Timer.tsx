import { useEffect, useRef, useState } from 'react';
import { Button, Card, SuccessNote } from '../../components/ui/primitives';
import { Field, Input } from '../../components/ui/fields';

function beep() {
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    [0, 0.5, 1].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.value = 0.12;
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.35);
    });
    window.setTimeout(() => ctx.close().catch(() => undefined), 3000);
  } catch {
    /* audio blocked — silent finish is fine */
  }
}

function fmt(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export default function Timer() {
  const [h, setH] = useState('0');
  const [m, setM] = useState('05');
  const [s, setS] = useState('00');
  const [remaining, setRemaining] = useState<number | null>(null); // null = idle
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const endRef = useRef(0);

  const duration = (parseInt(h, 10) || 0) * 3600 + (parseInt(m, 10) || 0) * 60 + (parseInt(s, 10) || 0);
  const validDuration = duration > 0 && duration < 86_400 * 10;

  useEffect(() => {
    if (!running) return;
    endRef.current = Date.now() + (remaining ?? 0) * 1000;
    const t = window.setInterval(() => {
      const left = Math.max(0, Math.round((endRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        setRunning(false);
        setFinished(true);
        beep();
      }
    }, 250);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const start = () => {
    if (!validDuration) return;
    setFinished(false);
    setRemaining(duration);
    setRunning(true);
  };

  const pause = () => setRunning(false);

  const reset = () => {
    setRunning(false);
    setRemaining(null);
    setFinished(false);
  };

  const idle = remaining === null;

  return (
    <Card className="mx-auto max-w-xl p-6 text-center sm:p-8">
      <p aria-live="polite" className="font-mono text-6xl font-bold tabular-nums tracking-tight sm:text-7xl">
        {idle ? '00:00' : fmt(remaining)}
      </p>

      {finished ? (
        <div className="mt-6">
          <SuccessNote>⏰ Time’s up!</SuccessNote>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap items-end justify-center gap-3">
        {!idle ? (
          <>
            <Button size="lg" onClick={running ? pause : () => setRunning(true)} className="min-w-[8rem]">
              {running ? '⏸ Pause' : '▶ Resume'}
            </Button>
            <Button variant="secondary" size="lg" onClick={reset}>
              ↺ Reset
            </Button>
          </>
        ) : (
          <div className="flex items-end gap-3">
            <Field label="Hours">
              <Input type="number" min={0} max={99} value={h} onChange={(e) => setH(e.target.value)} aria-label="Hours" className="w-20 text-center" />
            </Field>
            <Field label="Minutes">
              <Input type="number" min={0} max={59} value={m} onChange={(e) => setM(e.target.value)} aria-label="Minutes" className="w-20 text-center" />
            </Field>
            <Field label="Seconds">
              <Input type="number" min={0} max={59} value={s} onChange={(e) => setS(e.target.value)} aria-label="Seconds" className="w-20 text-center" />
            </Field>
            <Button size="lg" onClick={start} disabled={!validDuration} className="mb-0.5">
              ▶ Start
            </Button>
          </div>
        )}
      </div>

      {!idle ? (
        <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
          The countdown keeps running accurately even if you switch tabs.
        </p>
      ) : null}
    </Card>
  );
}
