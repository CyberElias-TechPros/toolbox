import { useState } from 'react';
import { Card, SuccessNote } from '../../components/ui/primitives';
import { Field, Input, Select } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { discount, isPercentOf } from '../../lib/units';
import { formatNumber } from '../../lib/utils';
import { track } from '../../lib/track';

type Mode = 'forward' | 'reverse';

export default function Discount() {
  const [mode, setMode] = useState<Mode>('forward');
  const [price, setPrice] = useState('120');
  const [pct, setPct] = useState('15');
  const [final, setFinal] = useState('100');

  const nPrice = parseFloat(price);
  const nPct = parseFloat(pct);
  const nFinal = parseFloat(final);

  let headline: string | null = null;
  let detail: string | null = null;
  let copyable: string | null = null;

  if (mode === 'forward') {
    if (Number.isFinite(nPrice) && Number.isFinite(nPct) && nPrice >= 0 && nPct >= 0 && nPct <= 100) {
      const { final: finalPrice, saved } = discount(nPrice, nPct);
      headline = `${formatNumber(finalPrice, 2)}`;
      detail = `You save ${formatNumber(saved, 2)} — that’s ${nPrice} minus ${nPct}% (${formatNumber(saved, 2)}).`;
      copyable = `${formatNumber(finalPrice, 2)} (saved ${formatNumber(saved, 2)})`;
    } else {
      detail = 'Enter a price ≥ 0 and a discount between 0–100%.';
    }
  } else {
    if (Number.isFinite(nPrice) && Number.isFinite(nFinal) && nPrice > 0 && nFinal >= 0) {
      const implied = isPercentOf(nPrice - nFinal, nPrice);
      if (implied == null) detail = 'Original price must be greater than zero.';
      else {
        headline = `${formatNumber(implied, 2)}%`;
        detail = `Going from ${formatNumber(nPrice, 2)} to ${formatNumber(nFinal, 2)} is a discount of ${formatNumber(implied, 2)}% (${formatNumber(nPrice - nFinal, 2)} off).`;
        copyable = `${formatNumber(implied, 2)}% off`;
      }
    } else {
      detail = 'Enter the original price and the sale price (both numbers).';
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-5 sm:p-6">
        <Field label="Mode" className="mb-4">
          <Select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value as Mode);
              track('tool_completed', 'discount-calculator');
            }}
            aria-label="Discount mode"
          >
            <option value="forward">Price + % → final price</option>
            <option value="reverse">Two prices → discount %</option>
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={mode === 'forward' ? 'Original price' : 'Original price'}>
            <Input type="number" step="any" min={0} value={price} onChange={(e) => setPrice(e.target.value)} aria-label="Original price" />
          </Field>
          {mode === 'forward' ? (
            <Field label="Discount %">
              <Input type="number" step="any" min={0} max={100} value={pct} onChange={(e) => setPct(e.target.value)} aria-label="Discount percent" />
            </Field>
          ) : (
            <Field label="Sale price">
              <Input type="number" step="any" min={0} value={final} onChange={(e) => setFinal(e.target.value)} aria-label="Sale price" />
            </Field>
          )}
        </div>
      </Card>

      <Card className="flex flex-col p-5 sm:p-6">
        <h2 className="text-sm font-semibold">{mode === 'forward' ? 'You pay' : 'Discount'}</h2>
        <div className="mt-3 flex-1">
          {detail ? (
            <SuccessNote className="!my-0">
              {headline ? <p className="text-3xl font-bold tabular-nums">{headline}</p> : null}
              <p className="mt-2 text-sm opacity-90">{detail}</p>
              {copyable ? (
                <span className="mt-3 block">
                  <CopyButton text={copyable} label="Copy result" />
                </span>
              ) : null}
            </SuccessNote>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
