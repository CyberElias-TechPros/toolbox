import { useState } from 'react';
import { Card, ErrorNote, SuccessNote } from '../../components/ui/primitives';
import { Field, Input, Select } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { CURRENCY_NAMES, MAX_WORDS, numberToMoney, numberToWords, type CurrencyCode } from '../../lib/words';
import { formatNumber } from '../../lib/utils';
import { track } from '../../lib/track';

export default function NumberToWords() {
  const [raw, setRaw] = useState('150000');
  const [mode, setMode] = useState<'words' | 'money'>('words');
  const [currency, setCurrency] = useState<CurrencyCode>('NGN');

  const n = raw.trim() === '' ? NaN : Number(raw);
  const valid = Number.isInteger(n) && Math.abs(n) <= MAX_WORDS;

  let result: string | null = null;
  let error: string | null = null;
  if (raw.trim() !== '' && !valid) {
    error = !Number.isFinite(n)
      ? 'Enter a number, e.g. 150000.'
      : !Number.isInteger(n)
        ? 'Whole numbers only — no decimals.'
        : 'That number is too large (max 999,999,999,999,999).';
  }
  if (valid) {
    result = mode === 'words' ? numberToWords(n) : numberToMoney(n, currency);
  }

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Number" className="sm:col-span-2">
            <Input
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="150000"
              className="font-mono"
              aria-label="Number"
            />
          </Field>
          <Field label="Output">
            <Select value={mode} onChange={(e) => setMode(e.target.value as 'words' | 'money')} aria-label="Output mode">
              <option value="words">Plain words</option>
              <option value="money">With currency</option>
            </Select>
          </Field>
        </div>
        {mode === 'money' ? (
          <div className="mt-4">
            <Field label="Currency">
              <Select value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)} aria-label="Currency" className="sm:w-64">
                <option value="NGN">₦ Nigerian Naira (NGN)</option>
                <option value="USD">$ US Dollar (USD)</option>
                <option value="EUR">€ Euro (EUR)</option>
                <option value="GBP">£ Pound Sterling (GBP)</option>
              </Select>
            </Field>
          </div>
        ) : null}
        {error ? (
          <div className="mt-4">
            <ErrorNote>{error}</ErrorNote>
          </div>
        ) : null}
      </Card>

      {result ? (
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">
              {formatNumber(n, 0)} {mode === 'money' ? `${CURRENCY_NAMES[currency].symbol} ${currency}` : 'in words'}
            </h2>
            <CopyButton
              text={result}
              label="Copy"
              onClick={() => track('tool_completed', 'number-to-words')}
            />
          </div>
          <SuccessNote className="mt-3">
            <p className="text-lg font-medium leading-relaxed">{result}</p>
          </SuccessNote>
          <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
            Capitalize it for checks and official documents if your bank or institution requires sentence case.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
