import { useMemo, useState } from 'react';
import { Card, ErrorNote } from '../../components/ui/primitives';
import { CopyButton } from '../../components/ui/CopyButton';
import {
  contrastRatio,
  formatCmyk,
  formatHsl,
  formatHsv,
  formatRgb,
  hexToRgb,
  hslToRgb,
  normalizeHex,
  rgbToCmyk,
  rgbToHsl,
  rgbToHex,
  rgbToHsv,
} from '../../lib/color';

export default function ColorConverter() {
  const [inputText, setInputText] = useState('#4f46e5');

  const parsed = useMemo(() => {
    const t = inputText.trim();
    if (t.startsWith('#') || /^[0-9a-f]{6}$/i.test(t) || /^[0-9a-f]{3}$/i.test(t)) {
      const n = normalizeHex(t);
      return n ? { hex: n, error: null as string | null } : { hex: null, error: 'Enter a valid HEX color like #4f46e5 or #44f.' };
    }
    const rgb = t.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*[\d.]+\s*)?\)$/i);
    if (rgb) {
      const r = parseInt(rgb[1], 10);
      const g = parseInt(rgb[2], 10);
      const b = parseInt(rgb[3], 10);
      if (r > 255 || g > 255 || b > 255) return { hex: null, error: 'RGB values must be 0–255.' };
      return { hex: rgbToHex({ r, g, b }), error: null };
    }
    const hsl = t.match(/^hsla?\(\s*([\d.]+)\s*[,\s]\s*([\d.]+)%\s*[,\s]\s*([\d.]+)%\s*(?:[,\s/]\s*[\d.]+%?\s*)?\)$/i);
    if (hsl) {
      const rgb2 = hslToRgb({ h: parseFloat(hsl[1]), s: parseFloat(hsl[2]), l: parseFloat(hsl[3]) });
      return { hex: rgbToHex(rgb2), error: null };
    }
    return { hex: null, error: 'Enter a color as HEX (#4f46e5), RGB (rgb(79, 70, 229)) or HSL (hsl(246, 73%, 58%)).' };
  }, [inputText]);

  const rgb = parsed.hex ? hexToRgb(parsed.hex)! : null;

  const rows = useMemo(() => {
    if (!rgb) return [];
    return [
      { label: 'HEX', value: parsed.hex! },
      { label: 'RGB', value: formatRgb(rgb) },
      { label: 'HSL', value: formatHsl(rgbToHsl(rgb)) },
      { label: 'HSV', value: formatHsv(rgbToHsv(rgb)) },
      { label: 'CMYK', value: formatCmyk(rgbToCmyk(rgb)) },
    ];
  }, [rgb, parsed.hex]);

  const contrastWhite = parsed.hex ? contrastRatio(parsed.hex, '#ffffff') : null;
  const contrastBlack = parsed.hex ? contrastRatio(parsed.hex, '#000000') : null;

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div
            aria-hidden
            className="h-32 w-full shrink-0 rounded-2xl border border-zinc-200 shadow-inner sm:h-36 sm:w-40 dark:border-zinc-700"
            style={{ backgroundColor: parsed.hex ?? 'transparent' }}
          />
          <div className="min-w-0 flex-1">
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="color-input">
              Color
            </label>
            <div className="flex gap-2">
              <input
                id="color-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                aria-label="Color value"
                className="w-full max-w-xs rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 font-mono text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-950"
              />
              <input
                type="color"
                value={parsed.hex ?? '#000000'}
                aria-label="Pick a color"
                onChange={(e) => setInputText(e.target.value)}
                className="h-11 w-14 cursor-pointer rounded-xl border border-zinc-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
            {parsed.error ? (
              <div className="mt-3">
                <ErrorNote>{parsed.error}</ErrorNote>
              </div>
            ) : null}

            {rgb ? (
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {rows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50/60 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-950/40"
                  >
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{row.label}</div>
                      <div className="truncate font-mono text-sm">{row.value}</div>
                    </div>
                    <CopyButton text={row.value} label="Copy" copiedLabel="✓" />
                  </div>
                ))}
              </div>
            ) : null}

            {contrastWhite != null && contrastBlack != null ? (
              <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                Contrast with white: <strong>{contrastWhite.toFixed(2)}:1</strong> · with black:{' '}
                <strong>{contrastBlack.toFixed(2)}:1</strong>
                {contrastWhite < 4.5 && contrastBlack < 4.5 ? ' — low contrast for both; use as a background, not text.' : ''}
              </p>
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  );
}
