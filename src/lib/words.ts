/** English number-to-words (integers), with an optional currency layer. Pure and tested. */

const ONES = [
  '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const SCALES = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion'];

export const MAX_WORDS = 10 ** 15 - 1; // 999 quadrillion 999 trillion …

/** Convert a 1–999 chunk to words. */
function chunk(n: number): string {
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h) parts.push(`${ONES[h]} hundred`);
  if (rest) {
    if (rest < 20) parts.push(ONES[rest]);
    else {
      const t = TENS[Math.floor(rest / 10)];
      const o = rest % 10;
      parts.push(o ? `${t}-${ONES[o]}` : t);
    }
  }
  if (parts.length > 1) parts.splice(1, 0, 'and');
  return parts.join(' ');
}

/** Integer → English words (0 … 10^15-1, negatives allowed). */
export function numberToWords(n: number): string {
  if (!Number.isInteger(n)) throw new Error('Only whole numbers are supported.');
  if (Math.abs(n) > MAX_WORDS) throw new Error('That number is too large (max 999,999,999,999,999).');
  if (n === 0) return 'zero';
  if (n < 0) return `minus ${numberToWords(-n)}`;

  const groups: number[] = [];
  let x = n;
  while (x > 0) {
    groups.push(x % 1000);
    x = Math.floor(x / 1000);
  }
  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (!g) continue;
    const word = chunk(g);
    parts.push(i > 0 ? `${word} ${SCALES[i]}` : word);
  }
  return parts.join(', ');
}

export type CurrencyCode = 'NGN' | 'USD' | 'EUR' | 'GBP';

export const CURRENCY_NAMES: Record<CurrencyCode, { singular: string; plural: string; symbol: string }> = {
  NGN: { singular: 'Nigerian Naira', plural: 'Nigerian Naira', symbol: '₦' },
  USD: { singular: 'US Dollar', plural: 'US Dollars', symbol: '$' },
  EUR: { singular: 'Euro', plural: 'Euros', symbol: '€' },
  GBP: { singular: 'Pound Sterling', plural: 'Pounds Sterling', symbol: '£' },
};

/** e.g. 150000 + NGN → "One hundred and fifty thousand Nigerian Naira" */
export function numberToMoney(n: number, currency: CurrencyCode): string {
  const name = n === 1 ? CURRENCY_NAMES[currency].singular : CURRENCY_NAMES[currency].plural;
  const words = numberToWords(n);
  const cap = words.charAt(0).toUpperCase() + words.slice(1);
  return `${cap} ${name}`;
}
