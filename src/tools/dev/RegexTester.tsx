import { useMemo, useState } from 'react';
import { Card, ErrorNote, Stat } from '../../components/ui/primitives';
import { Input, Textarea } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';

interface Match {
  text: string;
  index: number;
  groups: (string | undefined)[];
}

function runRegex(pattern: string, flags: string, source: string): { error: string | null; matches: Match[] } {
  if (!pattern) return { error: null, matches: [] };
  let re: RegExp;
  try {
    re = new RegExp(pattern, flags);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Invalid pattern.', matches: [] };
  }
  if (!(flags.includes('g') || flags.includes('y'))) {
    const m = re.exec(source);
    return { error: null, matches: m ? [{ text: m[0], index: m.index, groups: m.slice(1) }] : [] };
  }
  const matches: Match[] = [];
  let m: RegExpExecArray | null;
  let guard = 0;
  while ((m = re.exec(source)) !== null) {
    matches.push({ text: m[0], index: m.index, groups: m.slice(1) });
    if (m[0] === '') re.lastIndex++; // avoid infinite loop on zero-width matches
    if (++guard > 10_000) break;
  }
  return { error: null, matches };
}

/** Split source into segments for inline highlighting. */
function highlightSegments(source: string, matches: Match[]): Array<{ text: string; match: boolean }> {
  const segs: Array<{ text: string; match: boolean }> = [];
  let pos = 0;
  for (const m of matches) {
    if (m.index > pos) segs.push({ text: source.slice(pos, m.index), match: false });
    segs.push({ text: source.slice(m.index, m.index + m.text.length), match: true });
    pos = m.index + m.text.length;
  }
  if (pos < source.length) segs.push({ text: source.slice(pos), match: false });
  return segs;
}

const FLAG_DEFS: Array<[string, string]> = [
  ['g', 'global'],
  ['i', 'ignore case'],
  ['m', 'multiline'],
  ['s', 'dotall'],
  ['u', 'unicode'],
];

export default function RegexTester() {
  const [pattern, setPattern] = useState('\\b\\w+@\\w+\\.\\w+\\b');
  const [flags, setFlags] = useState('g');
  const [source, setSource] = useState('Contact us at hello@example.com or support@toolbox.io for help.');
  const [touched, setTouched] = useState(false);

  const { error, matches } = useMemo(
    () => runRegex(pattern, flags, source),
    [pattern, flags, source],
  );
  const segments = useMemo(() => (error ? [] : highlightSegments(source, matches)), [source, matches, error]);

  const toggleFlag = (f: string) => {
    setFlags((prev) => (prev.includes(f) ? prev.replace(f, '') : (prev + f).split('').sort().join('')));
    if (!touched) setTouched(true);
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[16rem] flex-1">
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="regex-pattern">
              Pattern
            </label>
            <Input
              id="regex-pattern"
              value={pattern}
              onChange={(e) => {
                setPattern(e.target.value);
                if (!touched) setTouched(true);
              }}
              placeholder="e.g. \b\d{4}-\d{4}\b"
              className="font-mono"
              aria-label="Regular expression pattern"
            />
          </div>
          <div>
            <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Flags</span>
            <div className="flex gap-1.5">
              {FLAG_DEFS.map(([f, label]) => (
                <button
                  key={f}
                  onClick={() => toggleFlag(f)}
                  aria-pressed={flags.includes(f)}
                  title={label}
                  className={
                    flags.includes(f)
                      ? 'h-10 w-10 rounded-xl bg-indigo-600 font-mono text-sm font-bold text-white'
                      : 'h-10 w-10 rounded-xl border border-zinc-300 bg-white font-mono text-sm text-zinc-500 hover:border-indigo-300 dark:border-zinc-700 dark:bg-zinc-900'
                  }
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-4">
            <ErrorNote>
              <span className="font-semibold">Invalid pattern:</span> {error}
            </ErrorNote>
          </div>
        ) : null}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <h2 className="mb-2 text-sm font-semibold">Test string</h2>
            <Textarea
              aria-label="Test string"
              className="min-h-[10rem]"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>
          <div>
            <h2 className="mb-2 text-sm font-semibold">Highlighted matches</h2>
            <div className="min-h-[10rem] whitespace-pre-wrap break-words rounded-xl border border-zinc-200 bg-zinc-50/60 p-3.5 font-mono text-[13px] leading-relaxed dark:border-zinc-800 dark:bg-zinc-950/40">
              {segments.length === 0 && !error ? (
                <span className="text-zinc-400">No matches — or type a test string.</span>
              ) : (
                segments.map((s, i) =>
                  s.match ? (
                    <mark key={i} className="rounded bg-amber-200 px-0.5 text-amber-950 dark:bg-amber-500/40 dark:text-amber-100">
                      {s.text}
                    </mark>
                  ) : (
                    <span key={i}>{s.text}</span>
                  ),
                )
              )}
            </div>
          </div>
        </div>
      </Card>

      {!error ? (
        <>
          <div className="grid grid-cols-3 gap-3 sm:max-w-sm">
            <Stat label="Matches" value={matches.length} accent />
            <Stat label="Pattern length" value={pattern.length} />
            <Stat label="Flags" value={flags || '—'} />
          </div>
          {matches.length > 0 ? (
            <Card className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">Matches & capture groups</h2>
                <CopyButton text={matches.map((m) => m.text).join('\n')} label="Copy matches" />
              </div>
              <ul className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
                {matches.slice(0, 50).map((m, i) => (
                  <li key={i} className="flex flex-wrap items-center gap-3 py-2.5 font-mono text-[13px]">
                    <span className="text-zinc-400">#{i + 1}</span>
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 dark:bg-amber-900/50 dark:text-amber-200">{m.text}</span>
                    <span className="text-zinc-400">@ {m.index}</span>
                    {m.groups.map((g, gi) => (
                      <span key={gi} className="text-indigo-600 dark:text-indigo-400">
                        ${gi + 1}: {g ?? '∅'}
                      </span>
                    ))}
                  </li>
                ))}
              </ul>
              {matches.length > 50 ? (
                <p className="mt-2 text-xs text-zinc-400">Showing the first 50 of {matches.length} matches.</p>
              ) : null}
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
