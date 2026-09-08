# 🧰 ToolBox — Everyday Tools, All in One Place

**Free. Fast. Private. No unnecessary sign-ups.**

ToolBox is a single “everything utility platform”: fast browser tools for everyday users, developers,
students, creators and small businesses. Every tool in the current release runs **100% client-side** —
files are processed in the browser and never uploaded, so the core platform costs almost nothing to run
and works even on flaky connections.

> Compress an image → convert it → generate a QR code → create an invoice → download a PDF.
> All in one place, without an account.

---

## Quick start

```bash
npm install
npm run dev          # dev server at http://localhost:5173
npm test             # 72 unit tests (vitest)
npm run typecheck    # strict TypeScript
npm run build        # sitemap → typecheck → production build (dist/)
npm run preview      # serve the production build
```

## What’s included (v0.1 — Phase 1 + 2 release)

**29 working tools across 8 categories**, all registry-driven:

| Category | Tools |
| --- | --- |
| 🖼️ Image | Compressor · Resizer · Converter · Cropper |
| 📄 PDF & Document | Merger · Splitter · Images → PDF |
| ✍️ Text | Word Counter · Text Cleaner · Case Converter · Text Diff · Lorem Ipsum |
| 💻 Developer | JSON Formatter/Validator · Base64 · URL Encoder · UUID Generator · Timestamp Converter · Color Converter |
| 🔢 Calculator & Converter | Percentage · Discount · File Size · Unit (length/weight/temp/time/speed) · Age |
| 📣 Marketing & Social | QR Generator (URL/text/Wi-Fi/email/phone) · UTM Builder · Meta Tag Generator |
| 💼 Business | Invoice Generator · Receipt Generator (print/save-as-PDF) |
| 🔧 Utility | Password Generator |

Platform features:

- **Universal search** with natural-language intent mapping (“make this image smaller” → Image Compressor)
- **Tool registry** as the single source of truth — category pages, search, navigation, related tools
  and the sitemap are all generated from one file
- **SEO landing pages per tool**: breadcrumbs, how-to, features, FAQ, related tools, privacy section,
  per-route title/meta/canonical/OG, build-time `sitemap.xml`
- **Dark/light mode**, fully responsive, keyboard-accessible controls
- **PWA**: web manifest + offline service worker (app shell cached)
- **Privacy-first analytics foundation**: only tool-level events (tool opened/completed, downloads),
  kept locally until a backend ingestion endpoint is configured (`VITE_TOOLBOX_API_URL`)

## Adding a tool (the whole platform is registry-driven)

1. Create the component, e.g. `src/tools/text/SortLines.tsx` (default export).
2. Add one entry to `src/registry/index.ts`:

   ```ts
   {
     slug: 'sort-lines',
     name: 'Line Sorter',
     category: 'text',
     tagline: '…', description: '…', icon: '↕️',
     clientOnly: true,
     tags: ['sort', 'lines', 'alphabetical'],
     aliases: ['sort lines a to z'],
     steps: ['…'], features: ['…'], faq: [{ q: '…', a: '…' }],
     related: ['text-cleaner'],
     component: lazy(() => import('../tools/text/SortLines')),
   },
   ```

That’s it — the tool appears in All Tools, its category page, search, related-tool suggestions,
the footer and the sitemap (regenerated on `npm run build`). Tools are lazy-loaded, so heavy
dependencies (pdf-lib, qrcode) only ship on the pages that need them.

## Architecture

```
                       TOOLBOX
                          │
        ┌─────────────────┴──────────────────┐
        │                                    │
   CLASS A — INSTANT TOOLS            (future) CLASS B — CLOUD TOOLS
        │                                    │
   Browser only — no server          Cloudflare Workers + D1 + R2
        │                                    │
        └──────────────┬─────────────────────┘
                       │
                   Vercel (frontend)
```

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + React Router
- **Processing**: browser engines only (Canvas for images, `pdf-lib` for PDFs, `qrcode` for QR,
  `crypto.subtle`/`randomUUID` for generators) — no upload, by design
- **Hosting**: Vercel (static SPA + `vercel.json` rewrites)
- **Future backend**: Cloudflare Workers/D1/R2 for saved projects, accounts, business workspace
  (see `docs/roadmap.md`)

### Key directories

```
src/
├── registry/        # categories + tool metadata (single source of truth)
├── lib/             # pure logic (text, color, units, dates, search, image…) + tests
├── components/      # layout, UI kit, tool page template, search
├── pages/           # home, all tools, category, tool route, 404
└── tools/           # the 29 tool components, grouped by category
scripts/             # build-time sitemap + registry integrity check
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server (HMR) |
| `npm test` | Vitest unit tests (pure logic: search, text, color, units, dates, QR/UTM/meta builders, page-range parsing, password generator) |
| `npm run typecheck` | Strict TS, no emit |
| `npm run build` | `scripts/generate-sitemap.ts` → `tsc` → `vite build` |
| `npm run check:registry` | Validates registry integrity (unique slugs, related links, SEO completeness) |

## Security & privacy notes

- All file processing is client-side; no tool uploads user data.
- Dangerous generated content (downloaded HTML from the invoice tool) is escaped.
- The service worker stores only app-shell assets — never user data.
- Analytics (Phase 4) will record tool-level events only, never content.
- Known attack surface to audit before scale: decompression bombs / oversized uploads are
  bounded by browser memory; SVG input is intentionally **not** accepted by the image tools.

## Deployment

### Vercel (frontend)

1. Push the repository.
2. In Vercel: import repo → framework **Vite** → build `npm run build` → output `dist`.
3. No environment variables are required for the client-side release.
   Optionally set `VITE_TOOLBOX_API_URL` once the Cloudflare API exists (enables event ingestion).
4. `vercel.json` already provides SPA rewrites. Set your real domain and update
   `SITE_URL` when building the sitemap (`SITE_URL=https://yourdomain.com npm run build`),
   and `public/robots.txt`.

### Cloudflare (future Phase 4 — accounts & saved projects)

See `docs/roadmap.md` for the planned Workers/D1/R2 surface. Nothing in the current release
requires Cloudflare credentials.

## Roadmap

See [docs/roadmap.md](docs/roadmap.md) — Phase 3 (expand to 40+ tools), Phase 4 (accounts,
saved projects on Cloudflare), Phase 5 (Pro/Business tiers).
