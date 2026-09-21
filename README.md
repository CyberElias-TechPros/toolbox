# Toolbox — Small tools. Big possibilities.

**138 free browser tools across eight categories. No accounts. No file uploads.**

A private workspace for converting documents, editing PDFs and images, working with spreadsheets,
transforming text and code, and everyday calculations. Version 0.2 adds **64 tools** to the existing 74,
plus a new responsive visual identity with self-hosted typography, dimensional interactive artwork,
dark mode, motion with reduced-motion support, saved favorites, and improved search.

## Start locally

Requires **Node.js 22.12+** (Node 22 LTS recommended).

```bash
npm ci
npm run dev             # Vite, port 5173, bound to all interfaces for remote previews
npm run typecheck       # Strict TypeScript
npm run check:registry  # Unique slugs, valid categories, metadata and related links
npm test                # 227 unit tests
npm run build           # Generate sitemap, typecheck, production build
npm run preview         # Serve the production build
```

## Word documents → one PDF

Open **Combine Word to PDF** (`/tools/combine-word-to-pdf`):

1. Add two or more `.docx` documents (drag-and-drop or browse).
2. Arrange them with the up/down controls; remove any unwanted files.
3. Choose an output name, then select **Combine & create PDF**.
4. Inspect the local PDF preview, navigate its pages, and download the result.

Also available:

- **Word to PDF** — a single DOCX document.
- **Mixed Files to PDF** — combine DOCX, PDF, PNG, JPEG and WebP in one ordered PDF.
- **Word to Text**, **Text to Word**, **Text to PDF**, **Markdown to PDF**.
- **PDF Text to Word** — extract selectable PDF text into an editable DOCX.

### Important format limitations

These tools deliberately avoid uploading documents to a conversion server:

- Word conversion uses `docx-preview` and browser rendering. Common formatting, tables and embedded
  images are supported, but fonts, complex layouts, fields, tracked changes, headers/footers and
  pagination can differ from Microsoft Word. Legacy `.doc` is **not supported**.
- Word, Markdown and text → PDF produce **image-based pages**, not selectable/searchable text.
  Existing PDF pages in a mixed merge retain their original content. Long rasterized content may
  break at visual page boundaries; always review the preview before sharing.
- PDF → text/Word extracts **selectable text only**. It does not preserve the original layout and
  does not perform OCR on scans.
- Spreadsheet tools support **XLSX**, not legacy XLS. Formula results are cached values, not
  recalculated. The first 100 rows are previewed; downloads contain all rows. CSV exports escape
  formula-like text to reduce spreadsheet formula injection.
- ZIP extraction does not support passwords/encryption. Archives are bounded to 1,000 entries and
  200 MB of declared expanded data. Normal file tasks accept up to 50 MB total; workbooks up to 20 MB.
- Watermark PDF supports Latin characters. Image-based document conversion supports browser-renderable
  Unicode fonts. JWT decoding does not verify signatures. Calculators provide estimates, not advice.

## The expanded collection

| Category               | Total | Highlights                                                                                                         |
| ---------------------- | ----: | ------------------------------------------------------------------------------------------------------------------ |
| PDF & Document         |    22 | Word conversion, ordered mixed-file merge, PDF preview, watermarks, numbering, metadata, resizing, text extraction |
| Image                  |    16 | Compression, format conversion, resize/crop, rotate/flip, grayscale, brightness, watermarks, collages              |
| Text                   |    23 | Counters, case conversion, diff, cleaning, extraction, find/replace, UTF-8 binary, HTML entities                   |
| Developer              |    28 | JSON/YAML/XML, JWT, SQL formatting, CSS/JS minification, HMAC, bases, regex, hashes, UUIDs                         |
| Calculator & Converter |    17 | Units, percentages, BMI, loans, compound/simple interest, tips, tax, dates, fractions, pace, fuel                  |
| Marketing & Social     |    10 | QR codes, UTM, metadata, social formatting, thumbnails, robots.txt, sitemaps                                       |
| Business               |    11 | Excel/CSV/JSON conversion, spreadsheet viewer, invoices, receipts, purchase orders, certificates                   |
| Utility                |    11 | ZIP creation/extraction, file checksums, passwords, clocks, timers, contrast                                       |

The registry is authoritative; see [the new-tool catalogue](docs/expansion.md) for all 64 additions.

## End-to-end tests

```bash
npx playwright install --with-deps chromium
npm run test:e2e
```

The **72-test browser suite** smoke-tests **all 138 routes** and exercises **every new tool** using generated real fixtures:
DOCX, PDF, XLSX, PNG and ZIP. Tests validate downloaded file signatures and contents, document page
counts, input ordering, worksheet selection, duplicate archive filenames, search, persistent favorites,
mobile bounds, dark mode, invalid-input recovery and the existing PDF-to-image MIME-picker regression.
No user files or external conversion services are used.

Optional CI overrides:

- `PLAYWRIGHT_BASE_URL` — target an already running deployment/production preview.
- `PLAYWRIGHT_CHROMIUM_PATH` — use an existing Chromium executable.

## Architecture

React 18 + TypeScript + React Router + Vite + Tailwind. All processing is client-side.

```
src/registry/index.ts       Original tool metadata + merged registry
src/registry/extra.ts       New tool specs, lazy engine loaders, generated metadata
src/registry/categories.ts  Eight category definitions
src/tools/extended/         Seven reusable, task-specific workbench engines
src/lib/                   Testable transformation/conversion logic
src/components/            Shared UI, search, document preview, layouts and error recovery
src/pages/                 Home, library, categories, tool routes and 404
src/lib/__tests__/          Unit tests
tests/workflows.spec.ts    Browser smoke and end-to-end workflow tests
```

Heavy libraries are lazy-loaded by tool/operation. The initial home/library route does not load Excel,
Word rendering, PDF conversion or minification engines. Fonts are self-hosted, with no Google Fonts
requests. The service worker caches app assets, never user inputs. Navigation is network-first with
an offline app-shell fallback; an individual tool is available offline only after its assets load.

Favorites store **tool slugs only** in localStorage. Tool inputs and output files stay in component
memory, not persistent storage. Optional existing telemetry records tool-level events, never content.

### Adding another tool

For a new operation using an existing workbench engine:

1. Implement and test the operation in its corresponding `src/lib/` module.
2. Add its UI options to the relevant `src/tools/extended/` engine if needed.
3. Add a spec in `src/registry/extra.ts` with honest format limitations.
4. Add an end-to-end fixture test and run the registry check.

For a standalone component, add an entry to `src/registry/index.ts` with its lazy import, category,
search tags/aliases, steps, features, FAQ and related slugs. Navigation, search, related tools,
category counts and sitemap follow automatically.

## Deployment

Static hosting is sufficient; no backend, credentials or environment variables are required.
Vercel uses the included SPA rewrite configuration: build `npm run build`, output `dist`.
Set `SITE_URL=https://yourdomain.com` for production sitemap generation and update `public/robots.txt`.
The example domain remains a placeholder until a real deployment domain is configured.

`npm audit` is clean at this release. The toolchain is on patched Vite/Vitest/Router versions;
ExcelJS's UUID dependency is overridden to the compatible patched CommonJS release.
