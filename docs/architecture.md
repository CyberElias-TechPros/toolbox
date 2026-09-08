# Architecture

## Design principle: two classes of tools

The single most important architectural rule of ToolBox:

> **Do not turn the entire platform into a backend application.**

Tools are split into two classes:

- **Class A — Instant tools.** 100% client-side. No login, no backend, no database.
  Everything (image/PDF/text processing, calculators, generators) runs in the browser.
  This is the entire current release, and it is what keeps infrastructure cost near zero
  regardless of traffic.
- **Class B — Cloud tools** *(planned, Phase 4).* Anything that genuinely needs persistence,
  collaboration or server workflows: saved invoices, business profiles, link shortening,
  analytics. These run on Cloudflare and reuse the exact same registry/UI, so a tool can
  “graduate” from Class A to Class B without a redesign.

## Frontend (Vercel)

```
React 18 + TypeScript (strict)
Vite 5 (SPA, per-tool code splitting via React.lazy)
Tailwind CSS 3 (design system, dark mode via .class)
React Router 6 (/, /tools, /tools/:slug, /category/:id)
```

- **Registry-driven routing**: `/tools/:slug` resolves against `src/registry`, which also
  drives search, category pages, related tools, navigation and `sitemap.xml`.
- **Per-route SEO**: `usePageMeta` sets title/description/canonical/OG per tool; a build-time
  script emits a complete sitemap from the registry.
- **Code splitting**: the core bundle is ~78 KB gzipped. `pdf-lib` (~178 KB gz) and `qrcode`
  load only on the pages that use them.
- **Offline-first**: a service worker caches the app shell; client-side tools remain usable
  with no network once loaded.

## Client-side processing (the privacy engine)

| Capability | Browser engine used |
| --- | --- |
| Image decode/draw/encode | `createImageBitmap` + Canvas 2D + `canvas.toBlob` (JPEG/PNG/WebP) |
| PDF read/write | `pdf-lib` (merge, split, images→PDF) |
| QR codes | `qrcode` (PNG canvas + SVG string) |
| Randomness | `crypto.getRandomValues` / `crypto.randomUUID` |
| Colors, units, dates, text | Pure TypeScript modules in `src/lib` (unit-tested) |

Security posture:

- File types are filtered by extension at the drop zone; decoders reject corrupted files with
  actionable errors.
- SVG is intentionally not accepted by image tools (scripted-SVG risk).
- Very large inputs are bounded by browser memory; oversized files surface a warning, not a crash.
- Generated HTML (invoice export) escapes all user input.
- The service worker never reads or stores user content.

## Analytics foundation (privacy-preserving)

`src/lib/track.ts` records **tool-level events only** (`tool_opened`, `tool_completed`,
`search_performed`, `download_clicked`, `copy_clicked`) — never file contents or pasted text.
Until a backend exists, counters are stored locally; when `VITE_TOOLBOX_API_URL` is set,
events are beaconed to `POST /api/v1/events` (fire-and-forget, never allowed to break a tool).

## Future backend (Cloudflare) — target surface

```
Cloudflare Workers (API)
├── auth (email/magic-link), sessions
├── saved projects (invoices, QRs, documents)  → D1
├── business workspace (customers, products, templates) → D1
├── file storage for shared documents          → R2 (signed URLs)
├── config / feature flags / rate-limit state  → KV
└── email + heavy async jobs                   → Queues (+ Cron for scheduled tasks)
```

Durable Objects are reserved for genuinely stateful real-time features and are **not**
anticipated for the first cloud release.

## Why Vercel + Cloudflare (and nothing else)

- Static SPA + edge API is the cheapest possible shape for this product.
- Client-side tools mean Vercel serves bytes and Cloudflare scales only the small number of
  features that truly need a server.
- No VPS, no traditional Node server, no database outside D1 — fewer moving parts to operate.
