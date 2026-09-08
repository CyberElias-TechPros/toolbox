/** Constrained random number generation. Pure and tested. */

export interface RandomOptions {
  min: number;
  max: number;
  count: number;
  unique: boolean;
  decimals: number; // 0 = integers
}

function roundTo(n: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

/** Generate `count` numbers within [min, max] (inclusive), optional uniqueness. */
export function generateNumbers(opts: RandomOptions): { ok: true; values: number[] } | { ok: false; error: string } {
  const { min, max, count } = opts;
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { ok: false, error: 'Enter valid minimum and maximum numbers.' };
  if (min > max) return { ok: false, error: 'The minimum must be less than or equal to the maximum.' };
  const c = Math.max(1, Math.min(1000, Math.floor(count)));

  const decimals = Math.max(0, Math.min(6, Math.floor(opts.decimals)));
  const unit = 10 ** -decimals;
  const lo = Math.ceil(min / unit);
  const hi = Math.floor(max / unit);
  const range = hi - lo + 1;
  if (range < 1) return { ok: false, error: 'No whole (or decimal) values exist in that range for the chosen precision.' };
  if (opts.unique && c > range) {
    return { ok: false, error: `You can get at most ${range} unique value${range > 1 ? 's' : ''} in that range with this precision.` };
  }

  const out: number[] = [];
  const seen = new Set<number>();
  let guard = 0;
  while (out.length < c) {
    // rejection sampling for uniformity
    const v = lo + Math.floor(Math.random() * range);
    if (opts.unique) {
      if (seen.has(v)) {
        if (++guard > 50_000) break; // safety (shouldn't happen given range check)
        continue;
      }
      seen.add(v);
    }
    out.push(v * unit);
  }
  return { ok: true, values: out.map((v) => roundTo(v, decimals)) };
}
