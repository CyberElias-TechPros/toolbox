import { useSyncExternalStore } from 'react';
const KEY = 'toolbox-favorites';
let saved = '';
let snapshot: string[] = [];
const listeners = new Set<() => void>();
function get() {
  let value = '[]';
  try {
    value = localStorage.getItem(KEY) || '[]';
  } catch {
    /* unavailable storage */
  }
  if (saved !== value) {
    saved = value;
    try {
      const parsed = JSON.parse(value);
      snapshot = Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
    } catch {
      snapshot = [];
    }
  }
  return snapshot;
}
function subscribe(fn: () => void) {
  listeners.add(fn);
  window.addEventListener('storage', fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener('storage', fn);
  };
}
export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, get);
  function toggle(slug: string) {
    const next = favorites.includes(slug) ? favorites.filter((s) => s !== slug) : [...favorites, slug];
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      return;
    }
    listeners.forEach((fn) => fn());
  }
  return { favorites, toggle };
}
