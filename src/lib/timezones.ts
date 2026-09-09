/** World-clock city list and IANA zone helpers. Pure where possible. */

export const WORLD_CLOCK_CITIES: Array<{ city: string; zone: string }> = [
  { city: 'Lagos', zone: 'Africa/Lagos' },
  { city: 'Abuja', zone: 'Africa/Lagos' },
  { city: 'Accra', zone: 'Africa/Accra' },
  { city: 'Cairo', zone: 'Africa/Cairo' },
  { city: 'London', zone: 'Europe/London' },
  { city: 'Paris', zone: 'Europe/Paris' },
  { city: 'Dubai', zone: 'Asia/Dubai' },
  { city: 'Mumbai', zone: 'Asia/Kolkata' },
  { city: 'Singapore', zone: 'Asia/Singapore' },
  { city: 'Tokyo', zone: 'Asia/Tokyo' },
  { city: 'Sydney', zone: 'Australia/Sydney' },
  { city: 'Auckland', zone: 'Pacific/Auckland' },
  { city: 'New York', zone: 'America/New_York' },
  { city: 'Chicago', zone: 'America/Chicago' },
  { city: 'Los Angeles', zone: 'America/Los_Angeles' },
  { city: 'São Paulo', zone: 'America/Sao_Paulo' },
];

export function zoneList(): string[] {
  const sv = (Intl as unknown as { supportedValuesOf?: (key: 'timeZone') => string[] }).supportedValuesOf;
  if (typeof sv === 'function') {
    const zones = sv('timeZone');
    if (zones.length) return zones;
  }
  return [...new Set(WORLD_CLOCK_CITIES.map((c) => c.zone))];
}

/** Format a date in a zone with hour/minute and 12-hour clock. */
export function timeInZone(date: Date, zone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function dateInZone(date: Date, zone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: zone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

/** UTC offset label like "UTC+1" for a zone at a given moment. */
export function utcOffsetLabel(date: Date, zone: string): string {
  const dtf = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'shortOffset' });
  const parts = dtf.formatToParts(date);
  const off = parts.find((p) => p.type === 'timeZoneName')?.value;
  return off ? off.replace('GMT', 'UTC') : 'UTC';
}
