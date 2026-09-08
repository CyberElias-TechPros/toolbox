/** Unit conversion and calculator math. Pure and tested. */

export interface Unit {
  id: string;
  label: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

const DECI = 1000;
const BINARY = 1024;

export const FILE_SIZES: Unit[] = [
  { id: 'b', label: 'Bytes (B)', toBase: (v) => v, fromBase: (v) => v },
  { id: 'kb', label: 'Kilobytes (KB, 10³)', toBase: (v) => v * DECI, fromBase: (v) => v / DECI },
  { id: 'mb', label: 'Megabytes (MB, 10⁶)', toBase: (v) => v * DECI ** 2, fromBase: (v) => v / DECI ** 2 },
  { id: 'gb', label: 'Gigabytes (GB, 10⁹)', toBase: (v) => v * DECI ** 3, fromBase: (v) => v / DECI ** 3 },
  { id: 'tb', label: 'Terabytes (TB, 10¹²)', toBase: (v) => v * DECI ** 4, fromBase: (v) => v / DECI ** 4 },
  { id: 'kib', label: 'Kibibytes (KiB, 2¹⁰)', toBase: (v) => v * BINARY, fromBase: (v) => v / BINARY },
  { id: 'mib', label: 'Mebibytes (MiB, 2²⁰)', toBase: (v) => v * BINARY ** 2, fromBase: (v) => v / BINARY ** 2 },
  { id: 'gib', label: 'Gibibytes (GiB, 2³⁰)', toBase: (v) => v * BINARY ** 3, fromBase: (v) => v / BINARY ** 3 },
  { id: 'tib', label: 'Tebibytes (TiB, 2⁴⁰)', toBase: (v) => v * BINARY ** 4, fromBase: (v) => v / BINARY ** 4 },
];

export const LENGTH: Unit[] = [
  { id: 'mm', label: 'Millimeters (mm)', toBase: (v) => v / 10, fromBase: (v) => v * 10 },
  { id: 'cm', label: 'Centimeters (cm)', toBase: (v) => v, fromBase: (v) => v },
  { id: 'm', label: 'Meters (m)', toBase: (v) => v * 100, fromBase: (v) => v / 100 },
  { id: 'km', label: 'Kilometers (km)', toBase: (v) => v * 100_000, fromBase: (v) => v / 100_000 },
  { id: 'in', label: 'Inches (in)', toBase: (v) => v * 2.54, fromBase: (v) => v / 2.54 },
  { id: 'ft', label: 'Feet (ft)', toBase: (v) => v * 30.48, fromBase: (v) => v / 30.48 },
  { id: 'yd', label: 'Yards (yd)', toBase: (v) => v * 91.44, fromBase: (v) => v / 91.44 },
  { id: 'mi', label: 'Miles (mi)', toBase: (v) => v * 160_934.4, fromBase: (v) => v / 160_934.4 },
];

export const WEIGHT: Unit[] = [
  { id: 'mg', label: 'Milligrams (mg)', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
  { id: 'g', label: 'Grams (g)', toBase: (v) => v, fromBase: (v) => v },
  { id: 'kg', label: 'Kilograms (kg)', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  { id: 'oz', label: 'Ounces (oz)', toBase: (v) => v * 28.349523125, fromBase: (v) => v / 28.349523125 },
  { id: 'lb', label: 'Pounds (lb)', toBase: (v) => v * 453.59237, fromBase: (v) => v / 453.59237 },
];

export const TIME: Unit[] = [
  { id: 's', label: 'Seconds', toBase: (v) => v, fromBase: (v) => v },
  { id: 'min', label: 'Minutes', toBase: (v) => v * 60, fromBase: (v) => v / 60 },
  { id: 'h', label: 'Hours', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
  { id: 'd', label: 'Days', toBase: (v) => v * 86_400, fromBase: (v) => v / 86_400 },
  { id: 'wk', label: 'Weeks', toBase: (v) => v * 604_800, fromBase: (v) => v / 604_800 },
];

export const SPEED: Unit[] = [
  { id: 'kmh', label: 'Kilometers/hour (km/h)', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
  { id: 'mph', label: 'Miles/hour (mph)', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
  { id: 'ms', label: 'Meters/second (m/s)', toBase: (v) => v, fromBase: (v) => v },
];

export function temperatureC(f: 'c' | 'f' | 'k', value: number): number {
  if (f === 'c') return value;
  if (f === 'f') return ((value - 32) * 5) / 9;
  return value - 273.15;
}
export function temperatureFromC(celsius: number, f: 'c' | 'f' | 'k'): number {
  if (f === 'c') return celsius;
  if (f === 'f') return (celsius * 9) / 5 + 32;
  return celsius + 273.15;
}

export function findUnit(units: Unit[], id: string): Unit {
  const u = units.find((x) => x.id === id);
  if (!u) throw new Error(`Unknown unit: ${id}`);
  return u;
}

export function convertValue(units: Unit[], fromId: string, toId: string, value: number): number {
  return findUnit(units, toId).fromBase(findUnit(units, fromId).toBase(value));
}

/* ------------------------- Percentage math ------------------------- */

export function percentOf(percent: number, of: number): number {
  return (percent / 100) * of;
}

export function isPercentOf(part: number, whole: number): number | null {
  if (whole === 0) return null;
  return (part / whole) * 100;
}

export function percentChange(from: number, to: number): { change: number | null; direction: 'increase' | 'decrease' | 'same' } {
  if (from === 0) return { change: null, direction: 'same' };
  const change = ((to - from) / Math.abs(from)) * 100;
  return {
    change,
    direction: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'same',
  };
}

export function discount(price: number, percent: number): { final: number; saved: number } {
  const saved = (price * percent) / 100;
  return { final: price - saved, saved };
}
