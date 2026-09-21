export interface CalcField {
  key: string;
  label: string;
  value: string;
  type?: 'date' | 'text';
}
export const CALCULATOR_FIELDS: Record<string, CalcField[]> = {
  'bmi-calculator': [
    { key: 'weight', label: 'Weight (kg)', value: '70' },
    { key: 'height', label: 'Height (cm)', value: '175' },
  ],
  'loan-calculator': [
    { key: 'amount', label: 'Loan amount', value: '20000' },
    { key: 'rate', label: 'Annual interest (%)', value: '6' },
    { key: 'years', label: 'Term (years)', value: '5' },
  ],
  'compound-interest': [
    { key: 'amount', label: 'Starting balance', value: '10000' },
    { key: 'rate', label: 'Annual interest (%)', value: '5' },
    { key: 'years', label: 'Time (years)', value: '10' },
    { key: 'monthly', label: 'Monthly contribution', value: '100' },
  ],
  'simple-interest': [
    { key: 'amount', label: 'Principal', value: '10000' },
    { key: 'rate', label: 'Annual interest (%)', value: '5' },
    { key: 'years', label: 'Time (years)', value: '3' },
  ],
  'tip-calculator': [
    { key: 'amount', label: 'Bill amount', value: '80' },
    { key: 'rate', label: 'Tip (%)', value: '15' },
    { key: 'people', label: 'People splitting the bill', value: '2' },
  ],
  'sales-tax-calculator': [
    { key: 'amount', label: 'Price before tax', value: '100' },
    { key: 'rate', label: 'Sales tax (%)', value: '8' },
  ],
  'date-difference': [
    { key: 'start', label: 'Start date', value: '2026-01-01', type: 'date' },
    { key: 'end', label: 'End date', value: '2026-12-31', type: 'date' },
  ],
  'aspect-ratio-calculator': [
    { key: 'width', label: 'Original width (px)', value: '1920' },
    { key: 'height', label: 'Original height (px)', value: '1080' },
    { key: 'target', label: 'New width (px)', value: '1280' },
  ],
  'average-calculator': [
    {
      key: 'numbers',
      label: 'Numbers (separated by commas or spaces)',
      value: '10, 20, 30, 40, 50',
      type: 'text',
    },
  ],
  'fraction-calculator': [
    { key: 'a', label: 'First numerator', value: '1' },
    { key: 'b', label: 'First denominator', value: '2' },
    { key: 'c', label: 'Second numerator', value: '1' },
    { key: 'd', label: 'Second denominator', value: '3' },
  ],
  'pace-calculator': [
    { key: 'distance', label: 'Distance (km)', value: '5' },
    { key: 'minutes', label: 'Time (minutes)', value: '25' },
  ],
  'fuel-cost-calculator': [
    { key: 'distance', label: 'Distance (km)', value: '300' },
    { key: 'consumption', label: 'Consumption (L / 100 km)', value: '7' },
    { key: 'price', label: 'Price per liter', value: '1.80' },
  ],
};
export type CalcResults = Record<string, string | number>;
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
export function calculate(slug: string, v: Record<string, string>): CalcResults {
  const n = (k: string, min = 0) => {
    if (!v[k]?.trim()) throw Error('Fill in all fields to see your result.');
    const x = Number(v[k]);
    if (!Number.isFinite(x) || x < min || x > 1e12)
      throw Error(`Enter a valid ${k} between ${min} and 1 trillion.`);
    return x;
  };
  const positive = (k: string) => {
    const x = n(k);
    if (!x) throw Error(`${k} must be greater than zero.`);
    return x;
  };
  const integer = (k: string, min = 0) => {
    const x = n(k, min);
    if (!Number.isSafeInteger(x)) throw Error(`${k} must be a whole number.`);
    return x;
  };
  const fmt = (x: number) => {
    if (!Number.isFinite(x)) throw Error('The result is too large. Use smaller values.');
    return Number(x.toFixed(2)).toLocaleString('en-US', { maximumFractionDigits: 2 });
  };
  switch (slug) {
    case 'bmi-calculator': {
      const bmi = positive('weight') / (positive('height') / 100) ** 2;
      return {
        'Your BMI': fmt(bmi),
        'Adult screening range':
          bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy range' : bmi < 30 ? 'Overweight' : 'Obesity range',
      };
    }
    case 'loan-calculator': {
      const p = positive('amount'),
        r = n('rate') / 1200,
        m = positive('years') * 12;
      if (!Number.isInteger(m) || m > 1200) throw Error('Choose a term in whole months, up to 100 years.');
      const payment = r === 0 ? p / m : (p * r) / (1 - (1 + r) ** -m);
      return {
        'Monthly payment': fmt(payment),
        'Total interest': fmt(payment * m - p),
        'Total paid': fmt(payment * m),
      };
    }
    case 'compound-interest': {
      const p = n('amount'),
        r = n('rate') / 1200,
        m = n('years') * 12,
        c = n('monthly');
      if (!Number.isInteger(m) || m > 1200) throw Error('Use whole months, up to 100 years.');
      const total = r ? p * (1 + r) ** m + (c * ((1 + r) ** m - 1)) / r : p + c * m;
      return {
        'Future balance': fmt(total),
        Contributions: fmt(p + c * m),
        'Interest earned': fmt(total - p - c * m),
      };
    }
    case 'simple-interest': {
      const p = n('amount'),
        interest = ((p * n('rate')) / 100) * n('years');
      return { Interest: fmt(interest), 'Total balance': fmt(p + interest) };
    }
    case 'tip-calculator': {
      const p = n('amount'),
        tip = (p * n('rate')) / 100,
        people = integer('people', 1);
      return { 'Tip amount': fmt(tip), 'Total bill': fmt(p + tip), 'Per person': fmt((p + tip) / people) };
    }
    case 'sales-tax-calculator': {
      const p = n('amount'),
        tax = (p * n('rate')) / 100;
      return { 'Tax amount': fmt(tax), 'Total including tax': fmt(p + tax) };
    }
    case 'date-difference': {
      const start = Date.parse(v.start + 'T00:00:00Z'),
        end = Date.parse(v.end + 'T00:00:00Z');
      if (!Number.isFinite(start) || !Number.isFinite(end)) throw Error('Choose two valid dates.');
      const days = Math.round(Math.abs(end - start) / 86400000);
      return {
        'Days apart': days,
        'Weeks and days': `${Math.floor(days / 7)} weeks, ${days % 7} days`,
        Hours: days * 24,
      };
    }
    case 'aspect-ratio-calculator': {
      const w = integer('width', 1),
        h = integer('height', 1),
        t = integer('target', 1),
        g = gcd(w, h);
      return {
        'Aspect ratio': `${w / g}:${h / g}`,
        'New dimensions': `${t} × ${Math.round((t * h) / w)} px`,
        'New height': fmt((t * h) / w),
      };
    }
    case 'average-calculator': {
      const nums = v.numbers
        .trim()
        .split(/[\s,]+/)
        .map(Number);
      if (!v.numbers.trim() || nums.some((x) => !Number.isFinite(x)))
        throw Error('Use numbers separated by spaces or commas.');
      nums.sort((a, b) => a - b);
      const count = nums.length,
        sum = nums.reduce((a, b) => a + b, 0),
        median = count % 2 ? nums[(count - 1) / 2] : (nums[count / 2 - 1] + nums[count / 2]) / 2;
      return {
        Mean: fmt(sum / count),
        Median: fmt(median),
        Range: fmt(nums[count - 1] - nums[0]),
        Sum: fmt(sum),
        Count: count,
      };
    }
    case 'fraction-calculator': {
      const a = integer('a', -1e12),
        b = integer('b', 1),
        c = integer('c', -1e12),
        d = integer('d', 1),
        num = a * d + c * b,
        den = b * d;
      if (!Number.isSafeInteger(num) || !Number.isSafeInteger(den))
        throw Error('Use smaller fractions for exact integer results.');
      const g = gcd(num, den);
      return { 'Simplified sum': `${num / g}/${den / g}`, Decimal: fmt(num / den) };
    }
    case 'pace-calculator': {
      const d = positive('distance'),
        time = positive('minutes'),
        seconds = Math.round((time / d) * 60);
      return {
        'Pace per km': `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} min/km`,
        'Average speed': `${fmt((d / time) * 60)} km/h`,
      };
    }
    case 'fuel-cost-calculator': {
      const liters = (n('distance') * n('consumption')) / 100;
      return { 'Fuel needed': `${fmt(liters)} L`, 'Estimated cost': fmt(liters * n('price')) };
    }
    default:
      throw Error('Unknown calculator.');
  }
}
