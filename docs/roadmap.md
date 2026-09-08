# Roadmap

## ✅ Phase 1 — Foundation (done, v0.1)

- React + TypeScript + Vite + Tailwind app, routing, design system, dark/light mode
- Tool registry (single source of truth) + registry integrity check
- Universal search with natural-language intent mapping
- Category pages, All Tools page, per-tool SEO landing pages, sitemap, robots
- PWA manifest + offline service worker
- Privacy-first analytics foundation
- Responsive, keyboard-accessible UI

## ✅ Phase 2 — First tool set (done, v0.1)

29 launch tools:

- **Image**: Compressor, Resizer, Converter, Cropper
- **PDF**: Merger, Splitter, Images → PDF
- **Text**: Word Counter, Text Cleaner, Case Converter, Text Diff, Lorem Ipsum
- **Developer**: JSON Formatter/Validator, Base64, URL Encoder, UUID, Timestamp, Color Converter
- **Calculator/Converter**: Percentage, Discount, File Size, Unit, Age
- **Marketing**: QR Generator, UTM Builder, Meta Tag Generator
- **Business**: Invoice Generator, Receipt Generator
- **Utility**: Password Generator

## Phase 3 — Expand to 40–60 tools (✅ COMPLETE — 74 tools shipped, target exceeded)

v0.2 (18 tools): Hash Generator, Regex Tester, Query String Parser, JSON ↔ CSV, PDF Page
Deleter, PDF Rotator, Image Metadata Cleaner, Image → Base64, Base64 → Image, Social Text
Formatter, Hashtag Generator, Quotation Generator, Number to Words, Stopwatch, Countdown
Timer, Random Number Generator, Contrast Checker.

v0.3 (27 tools): Line Sorter, Text to List, HTML → Text, Text → HTML, Markdown Formatter,
Character Counter, JSON → TypeScript, Cron Helper, HTTP Status Reference, MIME Lookup,
User-Agent Parser, Color Picker, Favicon Generator, Image Blur, Passport/ID Photo, PDF Page
Organizer, PDF → Image, OG Image Generator, YouTube Thumbnail Maker, Social Image Resizer,
robots.txt Generator, Sitemap Generator, Purchase Order, Delivery Note, Certificate
Generator, World Clock, Time Zone Converter.

Deliberately not built (with reasons):

- **Document Scanner (image → PDF enhancement)** — corner-detection/auto-enhancement is a
  heavy CV feature; a thin wrapper around CSS filters would be fake. Revisit if real demand.
- **Data-size long-tail SEO pages** — excluded by design: every indexed page must provide
  genuine value; hundreds of thin “X bytes = Y KB” pages would be mass thin SEO.
- **PDF Page Organizer drag-reorder** — arrow-button reorder ships (works on touch);
  drag-and-drop is a UX refinement, not a missing capability.

Still open (small):

- PDF metadata cleaner (strip title/producer etc. from PDFs)
- Area + Volume categories in the Unit Converter
- Random name/word picker (pick N from a pasted list — complements Random Number Generator)

Each tool is one registry entry + one component (see README “Adding a tool”).

## Phase 4 — Full-stack features (Cloudflare)

1. **Accounts (optional)** — email + magic link; never required for Class A tools.
   Conversion moment: after creating an invoice/QR → “Want to save this? Create a free account.”
2. **Saved projects** — invoices, QR codes, documents in D1; R2 for shared files; signed URLs.
3. **Account dashboard** — recent tools, saved projects, usage.
4. **Business workspace** — profile, customers, products, templates, invoice history, simple
   analytics. This is where the product becomes a business platform.
5. **Queues** for email (invoice delivery) and heavy async jobs; **Cron** for cleanup/reports.
6. **Admin** — tool usage, error rates, feature flags (KV), audit logs.

## Phase 5 — Monetization

- **Free**: all Class A tools, basic downloads.
- **Pro**: cloud storage, saved projects, advanced templates, batch processing, custom branding.
- **Business**: team accounts, shared templates, permissions, customer management, reports.
- Ad slots only on free-tool pages, never inside the tool experience.

## Long-term positioning

Not “a website with calculators” — a **digital utility operating system for everyday work**:
compress → convert → QR → social image → invoice → PDF → share, without leaving the platform.
