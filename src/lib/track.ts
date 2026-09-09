/**
 * Minimal privacy-first analytics.
 *
 * We only record *which* tool was used and that a result was produced —
 * never file contents, pasted text, or anything personal. Events are kept
 * in a small local counter (and logged in development) until the Cloudflare
 * backend (Phase 4) provides an ingestion endpoint; when
 * `VITE_TOOLBOX_API_URL` is set, events are posted there in batches.
 */

export type EventName = 'tool_opened' | 'tool_completed' | 'search_performed' | 'download_clicked' | 'copy_clicked';

const KEY = 'toolbox-events';

interface LocalEvent {
  name: EventName;
  slug?: string;
  ts: number;
}

function readStore(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, number>;
  } catch {
    return {};
  }
}

export function track(name: EventName, slug?: string): void {
  const key = slug ? `${name}:${slug}` : name;
  const store = readStore();
  store[key] = (store[key] || 0) + 1;
  store[`__events`] = (store[`__events`] || 0) + 1;
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info('[toolbox]', name, slug ?? '');
  }
  const api = import.meta.env.VITE_TOOLBOX_API_URL as string | undefined;
  if (api && typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const event: LocalEvent = { name, slug, ts: Date.now() };
    try {
      navigator.sendBeacon(`${api.replace(/\/$/, '')}/api/v1/events`, new Blob([JSON.stringify(event)], { type: 'application/json' }));
    } catch {
      /* never let analytics break a tool */
    }
  }
}
