import { useMemo, useState } from 'react';
import { Card } from '../../components/ui/primitives';
import { Field, Input } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { formatCmyk, formatHsl, formatRgb, hexToRgb, normalizeHex, readableTextOn, rgbToCmyk, rgbToHsl, tintsAndShades } from '../../lib/color';
import { track } from '../../lib/track';

export default function ColorPicker() {
  const [hex, setHex] = useState('#4f46e5');
  const normalized = useMemo(() => normalizeHex(hex), [hex]);
  const rgb = useMemo(() => (normalized ? hexToRgb(normalized) : null), [normalized]);

  const formats = useMemo(() => {
    if (!rgb) return null;
    return {
      hex: normalized as string,
      rgb: formatRgb(rgb),
      hsl: formatHsl(rgbToHsl(rgb)),
      cmyk: formatCmyk(rgbToCmyk(rgb)),
    };
  }, [rgb, normalized]);

  const scale = useMemo(() => (normalized ? tintsAndShades(normalized, 5) : { tints: [], shades: [] }), [normalized]);
  const textOn = normalized ? readableTextOn(normalized) : 'black';

  const swatch = (value: string) => (
    <div key={value} className="group flex flex-col items-center gap-1">
      <button
        type="button"
        title={`Copy ${value}`}
        aria-label={`Copy ${value}`}
        onClick={() => {
          void navigator.clipboard?.writeText(value);
          track('copy_clicked', 'color-picker');
        }}
        className="h-12 w-full rounded-xl border border-zinc-200 transition-transform hover:scale-105 dark:border-zinc-700"
        style={{ backgroundColor: value }}
      />
      <span className="font-mono text-[10px] text-zinc-500">{value}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-end gap-4">
          <Field label="Pick a color">
            <input
              type="color"
              value={normalized ?? '#000000'}
              onChange={(e) => setHex(e.target.value)}
              aria-label="Color picker"
              className="h-11 w-20 cursor-pointer rounded-xl border border-zinc-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </Field>
          <Field label="Or type HEX">
            <Input
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="w-36 font-mono uppercase"
              aria-label="Hex value"
              placeholder="#4f46e5"
            />
          </Field>
          <div
            className="ml-auto flex h-14 w-28 items-center justify-center rounded-2xl border border-zinc-200 text-sm font-bold shadow-inner dark:border-zinc-700"
            style={{
              backgroundColor: normalized ?? 'transparent',
              color: textOn,
            }}
          >
            {textOn === 'white' ? 'White' : 'Black'} text
          </div>
        </div>
        {!normalized ? <p className="mt-3 text-sm text-rose-600">That doesn’t look like a hex color. Try #4f46e5 or #333.</p> : null}
      </Card>

      {formats ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {(['hex', 'rgb', 'hsl', 'cmyk'] as const).map((k) => (
              <Card key={k} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{k}</span>
                  <CopyButton text={formats[k]} label="Copy" size="sm" />
                </div>
                <p className="mt-1.5 break-all font-mono text-sm">{formats[k]}</p>
              </Card>
            ))}
          </div>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Tints (lighter)</h2>
            <div className="grid grid-cols-5 gap-2">{scale.tints.map(swatch)}</div>
            <h2 className="mb-3 mt-5 text-sm font-semibold">Shades (darker)</h2>
            <div className="grid grid-cols-5 gap-2">{scale.shades.map(swatch)}</div>
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">Click any swatch to copy its hex value.</p>
          </Card>
        </>
      ) : null}
    </div>
  );
}
