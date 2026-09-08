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

## Phase 3 — Expand to 40–60 tools (next)

High-impact additions, in rough priority order:

- Image: Metadata Cleaner, Image to Base64 / Base64 to Image, Color Picker, Favicon Generator,
  Passport/ID Photo sheet, Blur
- PDF: Page Organizer (drag-reorder), Rotator, Page Deleter, PDF → Image, Metadata cleaner,
  Document Scanner (image → PDF enhancement)
- Text: Sort Lines, Text-to-List, HTML → Text / Text → HTML, Markdown Formatter, Character Counter
- Developer: JSON → CSV / CSV → JSON, JSON → TypeScript, Hash (SHA-256 via SubtleCrypto),
  Regex Tester, Query String Parser, Cron Helper, HTTP Status Reference, MIME Lookup,
  User-Agent Parser
- Converters: Length/Weight/Area/Volume, Data size long-tail SEO pages
- Marketing: Social Media Text Formatter, Hashtag Generator, Open Graph Image Generator,
  YouTube Thumbnail Maker, Social Image Resizer, Robots.txt Generator, Sitemap Generator
- Business: Quotation, Purchase Order, Delivery Note, Certificate Generator
- Utility: Random Number/Name Generators, Stopwatch, Timer, Number to Words, World Clock,
  Time Zone Converter, Contrast Checker

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
