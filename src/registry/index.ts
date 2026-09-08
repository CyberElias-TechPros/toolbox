import { createElement, lazy } from 'react';
import type { Tool } from './types';

/**
 * THE TOOL REGISTRY
 *
 * Every tool on the platform is declared exactly once here. Category pages,
 * search, navigation, related tools and the sitemap are all generated from
 * this single source of truth — adding a tool means adding one entry.
 */

export const TOOLS: Tool[] = [
  /* ----------------------------- Image ----------------------------- */
  {
    slug: 'image-compressor',
    name: 'Image Compressor',
    category: 'image',
    tagline: 'Compress JPG, PNG and WebP images without uploading them.',
    description:
      'Shrink the file size of your photos and images with a quality slider. Compression happens entirely in your browser — your images are never uploaded to any server.',
    icon: '🗜️',
    clientOnly: true,
    featured: true,
    tags: ['compress', 'image', 'photo', 'jpg', 'png', 'webp', 'reduce size', 'shrink', 'optimize', 'smaller', 'quality'],
    aliases: ['compress image', 'make image smaller', 'shrink photo', 'reduce image size', 'optimize image', 'reduce photo size'],
    steps: [
      'Drop one or more images into the upload area (or browse for them).',
      'Pick an output format and a quality level.',
      'Press “Compress images”.',
      'Compare the original and compressed sizes, then download.',
    ],
    features: [
      'JPG, PNG and WebP output',
      'Adjustable quality (10–100%)',
      'Batch processing — many files at once',
      'Before/after size for every file',
      'Metadata is stripped automatically',
      '100% private: files never leave your device',
    ],
    faq: [
      {
        q: 'Are my images uploaded to a server?',
        a: 'No. Everything is processed locally with your browser’s canvas. Nothing is uploaded, so the tool works even with a poor connection.',
      },
      {
        q: 'Which format compresses best?',
        a: 'WebP and JPEG are lossy formats and usually produce the smallest files. PNG is lossless and best for screenshots and logos with flat colors.',
      },
      {
        q: 'Will compression reduce image quality?',
        a: 'Lossy compression trades a little visual quality for a much smaller file. Use the quality slider and the preview to find the best balance for your use.',
      },
    ],
    related: ['image-resizer', 'image-converter', 'image-cropper'],
    component: lazy(() => import('../tools/image/Compressor')),
  },
  {
    slug: 'image-resizer',
    name: 'Image Resizer',
    category: 'image',
    tagline: 'Resize images to exact pixels or a percentage.',
    description:
      'Scale images to exact width/height dimensions or a percentage, with an aspect-ratio lock so nothing gets stretched. Runs entirely in your browser.',
    icon: '📐',
    clientOnly: true,
    tags: ['resize', 'image', 'scale', 'dimensions', 'width', 'height', 'percentage', 'stretch', 'photo'],
    aliases: ['resize image', 'change image size', 'scale image', 'make image a specific size'],
    steps: [
      'Drop or browse for an image.',
      'Choose a mode: exact pixels or percentage.',
      'Enter dimensions — the other side stays locked to the aspect ratio.',
      'Resize and download the result.',
    ],
    features: [
      'Exact pixel dimensions',
      'Percentage scaling',
      'Aspect-ratio lock to prevent distortion',
      'High-quality resampling',
      'PNG, JPG and WebP output',
      'Works offline, files stay on your device',
    ],
    faq: [
      {
        q: 'Why is one dimension greyed out?',
        a: 'The aspect ratio is locked so your image keeps its shape. Unlock it if you want to resize width and height independently.',
      },
      {
        q: 'Can I make an image bigger?',
        a: 'Yes — upscaling is allowed, but note that no resizer can add detail that the original file does not contain.',
      },
    ],
    related: ['image-compressor', 'image-converter', 'image-cropper'],
    component: lazy(() => import('../tools/image/Resizer')),
  },
  {
    slug: 'image-converter',
    name: 'Image Converter',
    category: 'image',
    tagline: 'Convert between PNG, JPG and WebP in seconds.',
    description:
      'Change image file formats with one click. Convert between PNG, JPEG and WebP, with automatic transparency handling, entirely in your browser.',
    icon: '🔄',
    clientOnly: true,
    tags: ['convert', 'image', 'format', 'png', 'jpg', 'jpeg', 'webp', 'change format', 'to webp', 'to png'],
    aliases: ['convert image', 'change image format', 'png to jpg', 'jpg to png', 'convert to webp'],
    steps: [
      'Add one or more images.',
      'Choose the target format (and quality for lossy formats).',
      'Press “Convert”.',
      'Download the converted files.',
    ],
    features: [
      'PNG, JPEG and WebP',
      'Batch conversion',
      'Transparency preserved for PNG/WebP',
      'White background applied automatically for JPEG',
      'Per-file size comparison',
      'Private, browser-only processing',
    ],
    faq: [
      {
        q: 'Why did my transparent image get a white background?',
        a: 'JPEG does not support transparency, so a white background is filled in. Choose PNG or WebP to keep transparency.',
      },
      {
        q: 'Is WebP better than JPEG?',
        a: 'WebP usually gives smaller files at the same visual quality and supports transparency. JPEG has the widest compatibility.',
      },
    ],
    related: ['image-compressor', 'image-resizer', 'images-to-pdf'],
    component: lazy(() => import('../tools/image/Converter')),
  },
  {
    slug: 'image-cropper',
    name: 'Image Cropper',
    category: 'image',
    tagline: 'Crop images with free or fixed-ratio selection.',
    description:
      'Crop any image to a custom area or common ratios like square (1:1), 4:3 or 16:9. Drag to move and resize the crop box, then download the result.',
    icon: '✂️',
    clientOnly: true,
    tags: ['crop', 'image', 'ratio', 'square', '16:9', '4:3', '1:1', 'trim', 'cut', 'dimensions'],
    aliases: ['crop image', 'trim image', 'cut image', 'square crop', 'crop to ratio'],
    steps: [
      'Drop an image into the tool.',
      'Pick a ratio preset or free crop.',
      'Drag the box to reposition and the handles to resize.',
      'Press “Crop image” and download.',
    ],
    features: [
      'Free crop and fixed ratios (1:1, 4:3, 16:9, 3:2)',
      'Drag and resize crop box with mouse or touch',
      'Live preview of the cropped area',
      'PNG, JPG and WebP output',
      'No upload — runs entirely on your device',
    ],
    faq: [
      {
        q: 'Can I crop to exact pixel dimensions?',
        a: 'Pick the closest ratio preset, adjust the crop box, then fine-tune the final size in the Image Resizer if you need exact pixels.',
      },
      {
        q: 'Is my image uploaded to a server?',
        a: 'No. The crop is drawn and saved by your browser, so the original never leaves your device.',
      },
    ],
    related: ['image-resizer', 'image-compressor', 'image-converter'],
    component: lazy(() => import('../tools/image/Cropper')),
  },

  /* ------------------------------ PDF ------------------------------ */
  {
    slug: 'pdf-merger',
    name: 'PDF Merger',
    category: 'pdf',
    tagline: 'Combine multiple PDFs into one file.',
    description:
      'Merge two or more PDF documents into a single file. Reorder the documents as you like, then download the result — all in your browser.',
    icon: '📎',
    clientOnly: true,
    featured: true,
    tags: ['merge', 'pdf', 'combine', 'join', 'unite', 'documents', 'concatenate'],
    aliases: ['merge pdf', 'combine pdf', 'join pdf files', 'put pdfs together'],
    steps: [
      'Add two or more PDF files.',
      'Reorder them using the up/down buttons.',
      'Press “Merge PDFs”.',
      'Download the combined file.',
    ],
    features: [
      'Unlimited number of PDFs',
      'Reorder files before merging',
      'Per-file page counts',
      'Works with any standard PDF',
      'No upload: merging happens locally',
    ],
    faq: [
      {
        q: 'Does merging change the quality of my PDFs?',
        a: 'No. Page contents are copied from the source files as-is, so the output keeps the same quality.',
      },
      {
        q: 'Are my documents uploaded?',
        a: 'Never. The merge runs in your browser using pdf-lib, so your documents never leave your device.',
      },
    ],
    related: ['pdf-splitter', 'images-to-pdf', 'invoice-generator'],
    component: lazy(() => import('../tools/pdf/Merger')),
  },
  {
    slug: 'pdf-splitter',
    name: 'PDF Splitter',
    category: 'pdf',
    tagline: 'Extract pages from a PDF or split it page by page.',
    description:
      'Pull specific pages or ranges out of a PDF into a new file, or split a document into one file per page. Everything happens on your device.',
    icon: '✂️',
    clientOnly: true,
    tags: ['split', 'pdf', 'extract', 'pages', 'range', 'separate', 'delete pages', 'remove pages'],
    aliases: ['split pdf', 'extract pdf pages', 'remove pages from pdf', 'pdf page extractor'],
    steps: [
      'Add a PDF file.',
      'Enter the pages to keep (e.g. “1-3, 5”) — or pick “every page separately”.',
      'Press “Extract”.',
      'Download the new PDF (or each page).',
    ],
    features: [
      'Extract page ranges like “1-3, 5, 8-10”',
      'One-file-per-page mode',
      'Live page count of your document',
      'Preserves original page quality',
      '100% local — no uploads',
    ],
    faq: [
      {
        q: 'How do I delete specific pages?',
        a: 'The opposite of keeping pages: enter the pages you want to keep. To drop pages 2 and 5 from a 10-page document, keep “1, 3-4, 6-10”.',
      },
      {
        q: 'Does it work on scanned PDFs?',
        a: 'Yes. Scanned pages are image-based PDFs and are extracted exactly like any other page.',
      },
    ],
    related: ['pdf-merger', 'images-to-pdf'],
    component: lazy(() => import('../tools/pdf/Splitter')),
  },
  {
    slug: 'images-to-pdf',
    name: 'Images to PDF',
    category: 'pdf',
    tagline: 'Turn JPG, PNG and WebP images into a single PDF.',
    description:
      'Combine your photos and screenshots into one PDF document. Choose the page size and order your images — processed entirely in your browser.',
    icon: '🖼️',
    clientOnly: true,
    tags: ['images to pdf', 'convert', 'photos to pdf', 'picture to pdf', 'screenshot to pdf', 'create pdf'],
    aliases: ['images to pdf', 'convert images to pdf', 'photos to pdf', 'screenshot to pdf'],
    steps: [
      'Add one or more images (JPG, PNG or WebP).',
      'Order the pages as you like.',
      'Choose page size: fit to image, A4 or Letter.',
      'Press “Create PDF” and download.',
    ],
    features: [
      'JPG, PNG and WebP input',
      'A4, Letter or “fit to image” pages',
      'Drag-order pages with up/down controls',
      'Optional margin around images',
      'Runs locally, no uploads',
    ],
    faq: [
      {
        q: 'Can I mix different image sizes?',
        a: 'Yes — with “fit to image” each page matches its picture, while A4/Letter scales each image to fit the page.',
      },
      {
        q: 'Will my photos look blurry in the PDF?',
        a: 'No. Images are embedded at their full resolution, so print quality is preserved.',
      },
    ],
    related: ['pdf-merger', 'image-converter', 'pdf-splitter'],
    component: lazy(() => import('../tools/pdf/ImagesToPdf')),
  },

  /* ----------------------------- Text ------------------------------ */
  {
    slug: 'word-counter',
    name: 'Word Counter',
    category: 'text',
    tagline: 'Words, characters, sentences, paragraphs and reading time.',
    description:
      'Paste any text to instantly see word count, character count (with and without spaces), sentences, paragraphs and estimated reading time.',
    icon: '🔢',
    clientOnly: true,
    featured: true,
    tags: ['word counter', 'character counter', 'count words', 'reading time', 'characters', 'sentences', 'paragraphs', 'essay'],
    aliases: ['word counter', 'count words', 'character count', 'how long is my essay'],
    steps: ['Paste or type your text.', 'Watch the statistics update as you type.', 'Copy any number if you need it.'],
    features: [
      'Word and character counts (with/without spaces)',
      'Sentence and paragraph counts',
      'Estimated reading time',
      'Updates live while you type',
      'Your text never leaves the browser',
    ],
    faq: [
      {
        q: 'How is word count calculated?',
        a: 'Any run of characters separated by whitespace counts as one word, matching how word processors count.',
      },
      {
        q: 'How is reading time estimated?',
        a: 'At an average adult reading speed of 200 words per minute.',
      },
    ],
    related: ['text-cleaner', 'case-converter', 'lorem-ipsum'],
    component: lazy(() => import('../tools/text/WordCounter')),
  },
  {
    slug: 'text-cleaner',
    name: 'Text Cleaner',
    category: 'text',
    tagline: 'Remove extra spaces, blank lines and duplicates in one click.',
    description:
      'Fix messy copied text: collapse extra spaces, remove blank or duplicate lines, convert tabs, strip punctuation or sort lines. Pick only the fixes you need.',
    icon: '🧹',
    clientOnly: true,
    tags: ['clean text', 'remove spaces', 'duplicate lines', 'blank lines', 'trim', 'whitespace', 'sort lines', 'paste fix'],
    aliases: ['clean text', 'remove extra spaces', 'remove duplicate lines', 'fix copied text'],
    steps: [
      'Paste your messy text.',
      'Toggle the cleaning options you want.',
      'Press “Clean text”.',
      'Copy or download the cleaned result.',
    ],
    features: [
      'Collapse multiple spaces',
      'Remove blank lines',
      'Remove duplicate lines',
      'Tabs to spaces',
      'Sort lines A→Z, Z→A or numerically',
      'Remove punctuation or all line breaks',
    ],
    faq: [
      {
        q: 'Will cleaning remove my text from anywhere?',
        a: 'Nothing is stored. The text only exists in your browser tab for as long as the tab is open.',
      },
      {
        q: 'Can I undo a clean?',
        a: 'Your original input stays in the left pane, so you can tweak options and re-run the clean any number of times.',
      },
    ],
    related: ['word-counter', 'case-converter', 'text-diff'],
    component: lazy(() => import('../tools/text/TextCleaner')),
  },
  {
    slug: 'case-converter',
    name: 'Case Converter',
    category: 'text',
    tagline: 'UPPERCASE, lowercase, Title Case, camelCase, snake_case and more.',
    description:
      'Convert any text between uppercase, lowercase, title case, sentence case and programmer cases like camelCase, PascalCase, snake_case, kebab-case and CONSTANT_CASE.',
    icon: '🔠',
    clientOnly: true,
    tags: ['case converter', 'uppercase', 'lowercase', 'title case', 'sentence case', 'camelcase', 'pascalcase', 'snake case', 'kebab case', 'caps'],
    aliases: ['case converter', 'uppercase text', 'title case', 'convert to camelcase', 'snake case converter'],
    steps: ['Paste your text.', 'Click any case style to convert.', 'Copy or download the result.'],
    features: [
      '9 case styles at once',
      'Smart Title Case (ignores small words)',
      'camelCase / PascalCase for developers',
      'snake_case / kebab-case / CONSTANT_CASE',
      'One-click copy for each style',
    ],
    faq: [
      {
        q: 'How does Title Case handle small words?',
        a: 'Articles and prepositions like “the”, “and”, “of” stay lowercase in the middle of titles, following common style guides. The first and last words are always capitalized.',
      },
      {
        q: 'Can it detect words in camelCase input?',
        a: 'Yes — “helloWorldFoo” is split into “Hello World Foo” before conversion, so mixed-case input still converts cleanly.',
      },
    ],
    related: ['text-cleaner', 'word-counter', 'lorem-ipsum'],
    component: lazy(() => import('../tools/text/CaseConverter')),
  },
  {
    slug: 'text-diff',
    name: 'Text Diff',
    category: 'text',
    tagline: 'Compare two texts and see exactly what changed.',
    description:
      'Paste two versions of a text and get a word-level comparison: removed words are struck through in red, added words highlighted in green. Ideal for tracking edits.',
    icon: '🆚',
    clientOnly: true,
    tags: ['diff', 'compare text', 'text diff', 'changes', 'version compare', 'what changed', 'revision'],
    aliases: ['compare text', 'text diff', 'find changes in text', 'compare two texts'],
    steps: ['Paste the original text on the left.', 'Paste the revised text on the right.', 'Review the highlighted differences.'],
    features: [
      'Word-level diff with clear colors',
      'Added / removed word counts',
      'Live comparison as you type',
      'Copy or download the compared texts',
      'Runs locally — drafts stay private',
    ],
    faq: [
      {
        q: 'Does it compare line by line?',
        a: 'It compares word by word, which shows edits inside a line as well as whole-line changes.',
      },
      {
        q: 'Can I compare code or logs?',
        a: 'Yes — any text works. Word-level comparison makes it easy to spot edited lines and changed values.',
      },
    ],
    related: ['text-cleaner', 'case-converter', 'word-counter'],
    component: lazy(() => import('../tools/text/TextDiff')),
  },
  {
    slug: 'lorem-ipsum',
    name: 'Lorem Ipsum Generator',
    category: 'text',
    tagline: 'Placeholder text for designs, layouts and mockups.',
    description:
      'Generate classic Lorem Ipsum placeholder text by the word, sentence or paragraph — for mockups, wireframes and design layouts.',
    icon: '📝',
    clientOnly: true,
    tags: ['lorem ipsum', 'placeholder text', 'dummy text', 'filler text', 'mockup', 'wireframe', 'dummy content'],
    aliases: ['lorem ipsum', 'placeholder text', 'dummy text generator'],
    steps: ['Choose how much text you need (words, sentences or paragraphs).', 'Press “Generate”.', 'Copy the result into your design.'],
    features: [
      'Words, sentences or paragraphs',
      'Starts with the classic “Lorem ipsum dolor sit amet…”',
      'One-click copy',
      'Unlimited re-generation',
    ],
    faq: [
      {
        q: 'Why use Latin gibberish?',
        a: 'Real words distract readers from layout. Lorem Ipsum’s meaningless text keeps attention on design, typography and spacing.',
      },
      {
        q: 'Can I get different text each time?',
        a: 'Yes — every press of “Generate” shuffles the word bank into new sentences and paragraphs.',
      },
    ],
    related: ['word-counter', 'case-converter', 'meta-tag-generator'],
    component: lazy(() => import('../tools/text/LoremIpsum')),
  },

  /* -------------------------- Developer --------------------------- */
  {
    slug: 'json-formatter',
    name: 'JSON Formatter',
    category: 'developer',
    tagline: 'Format, minify and validate JSON with clear errors.',
    description:
      'Beautify JSON with pretty indentation, minify it to a single line, and validate it with precise error location when something is wrong.',
    icon: '{ }',
    clientOnly: true,
    featured: true,
    tags: ['json', 'formatter', 'beautify', 'minify', 'validate', 'pretty print', 'json editor', 'api', 'csv', 'json to csv'],
    aliases: ['format json', 'json formatter', 'validate json', 'minify json', 'beautify json', 'json to csv'],
    steps: ['Paste your JSON.', 'Choose Format or Minify.', 'Read the result — or the exact error location if the JSON is invalid.'],
    features: [
      'Pretty-print with 2 or 4 space indent',
      'Minify to a single line',
      'Validation with line & column errors',
      'Optional object key sorting',
      'Copy / download the output',
      'Pure client-side — your data stays private',
    ],
    faq: [
      {
        q: 'Why does my JSON fail to parse?',
        a: 'Common causes: trailing commas, unquoted keys, single quotes instead of double quotes, or a comment (JSON has no comments). The error message points to the exact position.',
      },
      {
        q: 'Is my JSON uploaded anywhere?',
        a: 'No. Parsing happens in your browser; nothing is sent to a server.',
      },
    ],
    related: ['base64', 'url-encoder', 'uuid-generator'],
    component: lazy(() => import('../tools/dev/JsonFormatter')),
  },
  {
    slug: 'base64',
    name: 'Base64 Encoder & Decoder',
    category: 'developer',
    tagline: 'Encode text to Base64 or decode it back.',
    description:
      'Convert plain text to Base64 and back. Unicode-safe, instant, and runs entirely in your browser.',
    icon: '🔣',
    clientOnly: true,
    tags: ['base64', 'encode', 'decode', 'text', 'data uri', 'btoa', 'atob', 'encoding'],
    aliases: ['base64 encode', 'base64 decode', 'encode base64', 'decode base64'],
    steps: ['Type or paste text in the input.', 'Watch the result update instantly.', 'Copy or download it.'],
    features: [
      'Encode and decode modes',
      'Full Unicode support',
      'Live conversion as you type',
      'Clear, helpful error messages',
      'Copy and download for both directions',
    ],
    faq: [
      {
        q: 'Is Base64 encryption?',
        a: 'No. Base64 is an encoding, not encryption — anyone can decode it back. Never use it to hide secrets.',
      },
      {
        q: 'Can it handle accented characters and emoji?',
        a: 'Yes. Text is encoded as UTF-8 bytes first, so any Unicode content round-trips correctly.',
      },
    ],
    related: ['url-encoder', 'json-formatter', 'uuid-generator'],
    component: lazy(() => import('../tools/dev/Base64')),
  },
  {
    slug: 'url-encoder',
    name: 'URL Encoder & Decoder',
    category: 'developer',
    tagline: 'Percent-encode or decode URLs and query components.',
    description:
      'Encode spaces and special characters into percent-encoding (like %20), or decode them back. Choose full-URL mode or query-component mode.',
    icon: '🔗',
    clientOnly: true,
    tags: ['url encoder', 'url decoder', 'percent encoding', 'percent-encode', 'query string', 'escape url', 'uri'],
    aliases: ['url encode', 'url decode', 'percent encode', 'percent decode'],
    steps: ['Paste your URL or query string.', 'Pick full-URL mode or component mode.', 'Encode or decode and copy the result.'],
    features: [
      'Encode and decode',
      'Full-URL mode keeps :// and ? intact',
      'Component mode for query values',
      'Instant results with copy button',
    ],
    faq: [
      {
        q: 'What’s the difference between the two modes?',
        a: 'Full-URL mode (encodeURI) leaves characters that are legal in a URL alone. Component mode (encodeURIComponent) encodes everything except A–Z, a–z, 0–9, - _ . ! ~ * \' ( ) — use it for individual query values.',
      },
      {
        q: 'What is “%20”?',
        a: 'It’s the percent-encoding of a space character. URL encoders turn unsafe characters into %XX sequences so they travel safely in links.',
      },
    ],
    related: ['base64', 'utm-builder', 'json-formatter'],
    component: lazy(() => import('../tools/dev/UrlEncoder')),
  },
  {
    slug: 'uuid-generator',
    name: 'UUID Generator',
    category: 'developer',
    tagline: 'Generate random UUIDs (version 4), one or many.',
    description:
      'Create cryptographically random UUIDs using your browser’s secure random API. Generate up to 100 at once, in upper or lowercase.',
    icon: '🆔',
    clientOnly: true,
    tags: ['uuid', 'guid', 'v4', 'identifier', 'unique id', 'random id', 'crypto', 'random'],
    aliases: ['uuid generator', 'generate uuid', 'guid generator', 'random unique id'],
    steps: ['Choose how many UUIDs to generate.', 'Press “Generate”.', 'Copy one, or copy all at once.'],
    features: [
      'Version 4 (random) UUIDs',
      'Up to 100 per batch',
      'Upper- or lowercase',
      'Copy individually or all at once',
      'Uses the browser’s cryptographic RNG',
    ],
    faq: [
      {
        q: 'Are these secure enough for API keys or tokens?',
        a: 'They are cryptographically random (122 bits of entropy), which is fine for identifiers. For secrets, prefer a longer random string or a dedicated secret generator.',
      },
      {
        q: 'What is a “version 4” UUID?',
        a: 'Version 4 UUIDs are random — 122 random bits, formatted as 8-4-4-4-12 hex groups. They’re the default for unique IDs.',
      },
    ],
    related: ['password-generator', 'base64', 'json-formatter'],
    component: lazy(() => import('../tools/dev/UuidGenerator')),
  },
  {
    slug: 'timestamp-converter',
    name: 'Timestamp Converter',
    category: 'developer',
    tagline: 'Convert Unix timestamps to dates and back.',
    description:
      'Translate Unix timestamps (seconds or milliseconds) into human-readable dates in your local time zone — and convert dates back to timestamps.',
    icon: '⏱️',
    clientOnly: true,
    tags: ['timestamp', 'unix', 'epoch', 'date', 'converter', 'seconds', 'milliseconds', 'linux', 'time'],
    aliases: ['timestamp converter', 'unix timestamp to date', 'date to unix timestamp', 'epoch converter'],
    steps: ['Watch the live clock for “now”.', 'Paste a timestamp to convert it to a date — or pick a date to get its timestamp.'],
    features: [
      'Seconds and milliseconds',
      'Live “current time” clock',
      'Both directions: timestamp → date and date → timestamp',
      'Shows local time and UTC',
    ],
    faq: [
      {
        q: 'Why does the same timestamp show different times online?',
        a: 'Unix time is absolute (seconds since 1970-01-01 UTC); the displayed clock depends on the viewer’s time zone. This tool shows your local time plus UTC.',
      },
      {
        q: 'What is a Unix timestamp?',
        a: 'The number of seconds (or milliseconds) that have passed since 1 January 1970, 00:00:00 UTC — the “epoch”.',
      },
    ],
    related: ['base64', 'uuid-generator', 'url-encoder'],
    component: lazy(() => import('../tools/dev/Timestamp')),
  },
  {
    slug: 'color-converter',
    name: 'Color Converter',
    category: 'developer',
    tagline: 'Convert colors between HEX, RGB, HSL and CMYK.',
    description:
      'Enter a color as HEX, RGB or HSL (or pick it with the color picker) and get every common color-space value, ready to copy for your CSS or design work.',
    icon: '🎨',
    clientOnly: true,
    tags: ['color converter', 'hex to rgb', 'rgb to hex', 'hsl', 'cmyk', 'color code', 'css color', 'picker'],
    aliases: ['color converter', 'hex to rgb', 'rgb to hex', 'hsl to rgb', 'color code converter'],
    steps: ['Type a HEX code or use the color picker.', 'Read the RGB, HSL, HSV and CMYK values.', 'Click any value to copy it.'],
    features: [
      'HEX, RGB, HSL, HSV and CMYK',
      'Native color picker',
      'Live preview swatch',
      'One-click copy for every value',
      'Works from any format you type',
    ],
    faq: [
      {
        q: 'Why does the CMYK value differ from my design app?',
        a: 'Professional apps use profile-based (ICC) conversion. This tool uses the standard uncalibrated formula, which is the usual approximation for screen-to-CMYK.',
      },
      {
        q: 'Which format should I use in CSS?',
        a: 'HEX and RGB are the most compatible; HSL is great for building palettes by nudging one value; CMYK is for print hand-off.',
      },
    ],
    related: ['timestamp-converter', 'meta-tag-generator', 'qr-generator'],
    component: lazy(() => import('../tools/dev/ColorConverter')),
  },

  /* -------------------------- Calculator -------------------------- */
  {
    slug: 'percentage-calculator',
    name: 'Percentage Calculator',
    category: 'calculator',
    tagline: 'Percentages in every direction: X% of Y, share, and change.',
    description:
      'Answer the three percentage questions people actually ask: what is X% of Y, X is what percent of Y, and what’s the percentage change from one value to another.',
    icon: '%',
    clientOnly: true,
    featured: true,
    tags: ['percentage', 'percent', 'calculator', 'of', 'increase', 'decrease', 'change', 'ratio', 'math'],
    aliases: ['percentage calculator', 'calculate percentage', 'percent of a number', 'percentage change', 'what is 20% of 50000'],
    steps: ['Pick the mode that matches your question.', 'Enter the numbers.', 'Read the result with a plain-language explanation.'],
    features: [
      '“What is X% of Y?”',
      '“X is what percent of Y?”',
      '“Percent change from X to Y” (increase/decrease)',
      'Step-by-step explanation for each result',
      'Instant, keyboard-friendly inputs',
    ],
    faq: [
      {
        q: 'How do I work out a 20% discount?',
        a: 'Use “What is X% of Y” to find the discount amount, then subtract it from the price. The Discount Calculator does both in one step.',
      },
      {
        q: 'Why does the result have many decimals?',
        a: 'Percentages like 1/3 often don’t end cleanly. We show up to 4 decimal places so you can round with confidence.',
      },
    ],
    related: ['discount-calculator', 'file-size-converter', 'invoice-generator'],
    component: lazy(() => import('../tools/calc/Percentage')),
  },
  {
    slug: 'discount-calculator',
    name: 'Discount Calculator',
    category: 'calculator',
    tagline: 'Final price and savings after any percentage discount.',
    description:
      'Enter a price and a discount percentage to see the final price and how much you save. Reverse mode finds the discount a sale price implies.',
    icon: '🏷️',
    clientOnly: true,
    tags: ['discount', 'calculator', 'sale', 'percent off', 'final price', 'savings', 'promo', 'coupon', 'deal'],
    aliases: ['discount calculator', 'percent off calculator', 'sale price calculator', 'how much is 30% off'],
    steps: ['Enter the original price.', 'Enter the discount percentage.', 'See the final price and the amount saved.'],
    features: [
      'Forward: price + % → final price & savings',
      'Reverse: two prices → implied discount %',
      'Clear before/after breakdown',
      'Works with any currency you type',
    ],
    faq: [
      {
        q: 'Can I calculate stacked discounts?',
        a: 'Calculate the first discount, take the “final price” as the new original price, and repeat for the second discount.',
      },
      {
        q: 'How do I find the discount % from two prices?',
        a: 'Switch to “Two prices → discount %”, enter the original and sale price, and read the implied discount.',
      },
    ],
    related: ['percentage-calculator', 'invoice-generator', 'receipt-generator'],
    component: lazy(() => import('../tools/calc/Discount')),
  },
  {
    slug: 'file-size-converter',
    name: 'File Size Converter',
    category: 'calculator',
    tagline: 'Convert bytes, KB, MB, GB, TB (and KiB, MiB, GiB).',
    description:
      'Instantly convert between decimal data sizes (KB, MB, GB, TB) and binary sizes (KiB, MiB, GiB, TiB) — the unit confusion that trips everyone up, solved.',
    icon: '💾',
    clientOnly: true,
    featured: true,
    tags: ['file size', 'converter', 'kb to mb', 'gb to mb', 'bytes', 'megabytes', 'gigabytes', 'kibibytes', 'mebibytes', 'data size'],
    aliases: ['file size converter', 'kb to mb', 'mb to gb', 'gb to mb', 'bytes to kb', '1 gb to mb', 'data size converter'],
    steps: ['Enter a value.', 'Pick the “from” and “to” units.', 'Read the exact result — plus a table of every unit.'],
    features: [
      'Decimal units: B, KB, MB, GB, TB',
      'Binary units: B, KiB, MiB, GiB, TiB',
      'Full comparison table at a glance',
      'Swap direction in one click',
      'Precise results, no rounding surprises',
    ],
    faq: [
      {
        q: 'Why does my “100 MB” download show as 95.4 MiB?',
        a: 'Marketing uses decimal units (1 MB = 1,000,000 bytes) while operating systems often display binary units (1 MiB = 1,048,576 bytes). The same file, two different rulers.',
      },
      {
        q: 'Which is bigger, 1 MB or 1 MiB?',
        a: '1 MiB (1,048,576 bytes) is bigger than 1 MB (1,000,000 bytes). That’s why an “80 MB” file can show as 76.3 MiB.',
      },
    ],
    related: ['unit-converter', 'percentage-calculator', 'image-compressor'],
    component: lazy(() => import('../tools/calc/FileSizeConverter')),
  },
  {
    slug: 'unit-converter',
    name: 'Unit Converter',
    category: 'calculator',
    tagline: 'Length, weight, temperature, time and speed.',
    description:
      'Convert between everyday measurement units: length (mm–mi), weight (mg–lb), temperature (°C/°F/K), time (seconds–weeks) and speed (km/h, mph, m/s).',
    icon: '⚖️',
    clientOnly: true,
    tags: ['unit converter', 'length', 'weight', 'temperature', 'time', 'speed', 'km to miles', 'celsius to fahrenheit', 'lbs to kg', 'measurement'],
    aliases: ['unit converter', 'km to miles', 'celsius to fahrenheit', 'pounds to kilograms', 'convert units'],
    steps: ['Pick a category (length, weight, …).', 'Enter a value and choose the units.', 'See the result plus conversions to every other unit.'],
    features: [
      '5 categories: length, weight, temperature, time, speed',
      'Metric and imperial units',
      'Full unit table for the chosen value',
      'One-click swap',
    ],
    faq: [
      {
        q: 'Is “1 mile = 1.609 km” exact?',
        a: 'Yes — 1 mile is exactly 1,609.344 meters by international definition, so conversions are exact, not approximate.',
      },
      {
        q: 'Are these conversions exact?',
        a: 'Yes — each unit is defined by an exact factor against a base unit (e.g. 1 in = exactly 2.54 cm), so results are exact, not rounded approximations.',
      },
    ],
    related: ['file-size-converter', 'percentage-calculator', 'age-calculator'],
    component: lazy(() => import('../tools/calc/UnitConverter')),
  },
  {
    slug: 'age-calculator',
    name: 'Age Calculator',
    category: 'calculator',
    tagline: 'Exact age in years, months, days — plus total days lived.',
    description:
      'Enter a date of birth to get an exact age in years, months and days, with total days, weeks and hours. Also works as a “days between two dates” calculator.',
    icon: '🎂',
    clientOnly: true,
    tags: ['age calculator', 'date of birth', 'how old', 'days between dates', 'date difference', 'birthday', 'exact age'],
    aliases: ['age calculator', 'how old am i', 'calculate age', 'days between two dates', 'date difference'],
    steps: ['Pick a date of birth (or two dates for “between dates” mode).', 'Read the exact age with a breakdown of days, weeks and months until the next birthday.'],
    features: [
      'Exact years, months, days',
      'Total days / weeks / hours lived',
      'Days until next birthday',
      'Two-date difference mode',
    ],
    faq: [
      {
        q: 'Does it handle leap years?',
        a: 'Yes. Dates are computed on the real calendar, so leap days and month lengths are always accounted for.',
      },
      {
        q: 'Does the time of day matter?',
        a: 'No — only the calendar date is used, so age is the same at any time on a given day.',
      },
    ],
    related: ['percentage-calculator', 'unit-converter', 'discount-calculator'],
    component: lazy(() => import('../tools/calc/AgeCalculator')),
  },

  /* -------------------------- Marketing --------------------------- */
  {
    slug: 'qr-generator',
    name: 'QR Code Generator',
    category: 'marketing',
    tagline: 'QR codes for URLs, text, Wi-Fi, email and phone.',
    description:
      'Generate high-quality QR codes for links, plain text, Wi-Fi networks, email and phone numbers. Download as PNG or SVG, in your brand color.',
    icon: '',
    clientOnly: true,
    featured: true,
    tags: ['qr code', 'qr generator', 'create qr', 'wifi qr', 'vcard qr', 'link qr', 'barcode', 'scan'],
    aliases: ['qr code generator', 'make a qr code', 'create qr code', 'wifi qr code', 'qr for link'],
    steps: ['Choose a type (URL, text, Wi-Fi, email, phone).', 'Fill in the details.', 'Adjust size and color, then download PNG or SVG.'],
    features: [
      'URL, text, Wi-Fi, email and phone types',
      'Adjustable size (up to 1024px) and brand color',
      'Tunable error correction',
      'PNG and SVG download',
      'Generated locally — the content is never sent anywhere',
    ],
    faq: [
      {
        q: 'Do QR codes expire?',
        a: 'A static QR code like this one never expires — it simply encodes the data you chose. It only “breaks” if the link behind it stops working.',
      },
      {
        q: 'How much data can a QR code hold?',
        a: 'Up to ~3 KB of text. If your content is too long, the generator will tell you and suggest trimming it.',
      },
    ],
    related: ['utm-builder', 'meta-tag-generator', 'color-converter'],
    component: lazy(() => import('../tools/marketing/QrGenerator')),
  },
  {
    slug: 'utm-builder',
    name: 'UTM Link Builder',
    category: 'marketing',
    tagline: 'Build tracked marketing links in seconds.',
    description:
      'Append utm_source, utm_medium, utm_campaign, utm_term and utm_content to any URL and copy a tracking-ready link for your analytics.',
    icon: '🎯',
    clientOnly: true,
    tags: ['utm', 'builder', 'tracking', 'campaign', 'source', 'medium', 'marketing link', 'google analytics', 'link tracking'],
    aliases: ['utm builder', 'utm link builder', 'create utm link', 'tracking link'],
    steps: ['Paste your destination URL.', 'Fill in the UTM parameters (source, medium, campaign…).', 'Copy the ready-to-paste tracking URL.'],
    features: [
      'All five standard UTM parameters',
      'Live link preview',
      'Only non-empty parameters are added',
      'One-click copy',
      'Handles URLs that already have query strings',
    ],
    faq: [
      {
        q: 'What should I put in source and medium?',
        a: 'Source = where the link lives (e.g. “instagram”), medium = the type of link (e.g. “social” or “email”). Campaign names the promotion, e.g. “spring-sale-2026”.',
      },
      {
        q: 'Will UTM parameters break my link?',
        a: 'No. They’re ordinary query-string parameters. The page still loads normally; your analytics just record the attribution data.',
      },
    ],
    related: ['qr-generator', 'meta-tag-generator', 'url-encoder'],
    component: lazy(() => import('../tools/marketing/UtmBuilder')),
  },
  {
    slug: 'meta-tag-generator',
    name: 'Meta Tag Generator',
    category: 'marketing',
    tagline: 'SEO meta, Open Graph and Twitter/X tags for your pages.',
    description:
      'Generate ready-to-paste <head> tags: title, description, canonical, Open Graph and Twitter/X card tags — everything search engines and social networks need.',
    icon: '',
    clientOnly: true,
    tags: ['meta tags', 'seo', 'open graph', 'og tags', 'twitter card', 'meta description', 'canonical', 'social preview', 'head tags'],
    aliases: ['meta tag generator', 'seo tags', 'open graph tags', 'twitter card generator'],
    steps: ['Enter page title, description and URL.', 'Optionally add image and site name.', 'Copy the generated <head> snippet.'],
    features: [
      '<title> and meta description',
      'Open Graph (Facebook, LinkedIn…)',
      'Twitter/X card tags',
      'Canonical URL',
      'Validation hints (ideal lengths)',
      'Copy the whole snippet in one click',
    ],
    faq: [
      {
        q: 'How long should my meta description be?',
        a: 'Aim for 150–160 characters. The tool shows live lengths so you can tune it.',
      },
      {
        q: 'Where do I paste the generated tags?',
        a: 'Inside the <head> section of your page’s HTML, usually right after the opening <head> tag.',
      },
    ],
    related: ['utm-builder', 'qr-generator', 'lorem-ipsum'],
    component: lazy(() => import('../tools/marketing/MetaTags')),
  },

  /* --------------------------- Business ---------------------------- */
  {
    slug: 'invoice-generator',
    name: 'Invoice Generator',
    category: 'business',
    tagline: 'Professional invoices, printable as PDF in minutes.',
    description:
      'Create a clean, professional invoice: your business details, customer, line items, tax and discount. Preview it live, then print or save it as PDF — free, forever.',
    icon: '🧾',
    clientOnly: true,
    featured: true,
    tags: ['invoice', 'generator', 'create invoice', 'bill', 'payment request', 'pdf invoice', 'business', 'money'],
    aliases: ['invoice generator', 'create invoice', 'make an invoice', 'invoice maker', 'bill generator'],
    steps: [
      'Fill in your business details and the customer’s.',
      'Add line items: description, quantity, price.',
      'Set tax, discount and currency.',
      'Print / Save as PDF, or download an HTML copy.',
    ],
    features: [
      'Live preview as you type',
      'Line items with quantity × price',
      'Subtotal, discount %, tax %, total',
      'Any currency symbol',
      'Print or save as PDF from the browser',
      'No account, no upload, no fee',
    ],
    faq: [
      {
        q: 'How do I get a PDF file?',
        a: 'Press “Print / Save as PDF” and choose “Save as PDF” in the browser’s print dialog. It looks exactly like the preview.',
      },
      {
        q: 'Is my invoice data stored anywhere?',
        a: 'No. The invoice is built entirely in your browser. When you close the tab, it’s gone.',
      },
    ],
    related: ['receipt-generator', 'discount-calculator', 'pdf-merger'],
    component: lazy(() => import('../tools/business/DocumentGenerator').then((m) => ({ default: m.InvoiceDoc }))),
  },
  {
    slug: 'receipt-generator',
    name: 'Receipt Generator',
    category: 'business',
    tagline: 'Simple payment receipts, ready to print or share.',
    description:
      'Generate a clean payment receipt for customers: business, customer, items, tax and total. Preview live, then print or save as PDF.',
    icon: '🧾',
    clientOnly: true,
    tags: ['receipt', 'generator', 'payment receipt', 'sale receipt', 'proof of payment', 'pdf receipt', 'business'],
    aliases: ['receipt generator', 'create receipt', 'payment receipt maker'],
    steps: [
      'Fill in your business details and the customer’s.',
      'Add the items or a single charge.',
      'Set tax, discount and currency.',
      'Print / Save as PDF, or download HTML.',
    ],
    features: [
      '“PAID” styled receipt layout',
      'Live preview',
      'Line items, tax, discount, total',
      'Any currency symbol',
      'Print or save as PDF',
      '100% private, browser-only',
    ],
    faq: [
      {
        q: 'What’s the difference between an invoice and a receipt?',
        a: 'An invoice requests payment (“pay me by X date”), a receipt confirms it (“you paid this on X date”). Both are built here from the same engine.',
      },
      {
        q: 'Should I give a receipt for cash payments?',
        a: 'Yes — a simple receipt protects both you and the customer by confirming the amount and date. Print one, or email the downloaded HTML.',
      },
    ],
    related: ['invoice-generator', 'discount-calculator'],
    component: lazy(() => import('../tools/business/DocumentGenerator').then((m) => ({ default: m.ReceiptDoc }))),
  },

  /* ---------------------------- Utility ---------------------------- */
  {
    slug: 'password-generator',
    name: 'Password Generator',
    category: 'utility',
    tagline: 'Strong random passwords, generated on your device.',
    description:
      'Create secure, random passwords of any length with the character sets you want — digits, symbols, no confusing characters. Never sent to any server.',
    icon: '🔐',
    clientOnly: true,
    tags: ['password', 'generator', 'strong password', 'secure', 'random password', 'passphrase', 'credentials', 'random'],
    aliases: ['password generator', 'strong password generator', 'make a password', 'random password'],
    steps: ['Pick a length and character sets.', 'Press “Generate”.', 'Copy it — and store it in a password manager.'],
    features: [
      'Length from 8 to 64 characters',
      'Upper, lower, digits and symbols toggles',
      '“Avoid ambiguous characters” option (l, 1, O, 0…)',
      'Strength estimate with entropy bits',
      'Generated locally with crypto randomness — never transmitted',
    ],
    faq: [
      {
        q: 'Is it safe to generate a password here?',
        a: 'Yes. Generation uses your browser’s cryptographic random number generator and nothing is sent over the network.',
      },
      {
        q: 'How long should a password be?',
        a: '16+ characters is a strong target for important accounts. Length beats complexity for memorized passwords — but for generated ones, use all character sets.',
      },
    ],
    related: ['uuid-generator', 'base64', 'json-formatter'],
    component: lazy(() => import('../tools/utility/PasswordGenerator')),
  },

  /* ---------------------- Phase 3 — Developer ----------------------- */
  {
    slug: 'hash-generator',
    name: 'Hash Generator',
    category: 'developer',
    tagline: 'SHA-256, SHA-384 and SHA-512 hashes, generated locally.',
    description:
      'Generate SHA-256, SHA-384 or SHA-512 hashes of any text using your browser’s built-in WebCrypto engine. Great for checksums, integrity checks and API signatures — the text never leaves your device.',
    icon: '#',
    clientOnly: true,
    tags: ['hash', 'sha-256', 'sha256', 'sha-512', 'digest', 'checksum', 'integrity', 'hash generator', 'md5 alternative'],
    aliases: ['hash generator', 'sha256 of text', 'calculate sha-256', 'text to hash', 'generate hash'],
    steps: [
      'Paste the text you want to hash.',
      'Choose an algorithm (SHA-256 is the most common).',
      'Press “Hash” and copy the digest.',
    ],
    features: [
      'SHA-256, SHA-384 and SHA-512',
      'Lowercase or uppercase output',
      'Copy or download the digest',
      'Uses the browser’s cryptographic WebCrypto API',
      'Nothing is sent anywhere — hashing is local',
    ],
    faq: [
      {
        q: 'Is this the same as what server-side tools produce?',
        a: 'Yes. SHA-256 is a standardized algorithm — hash("hello") is 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824 everywhere, in every language and browser.',
      },
      {
        q: 'Can I get the original text back from a hash?',
        a: 'No. Hash functions are one-way. That’s what makes them useful for verifying integrity without exposing the data.',
      },
    ],
    related: ['uuid-generator', 'base64', 'json-formatter'],
    component: lazy(() => import('../tools/dev/HashGenerator')),
  },
  {
    slug: 'regex-tester',
    name: 'Regex Tester',
    category: 'developer',
    tagline: 'Test regular expressions with live highlighting and capture groups.',
    description:
      'Test regular expressions against a sample string: see every match highlighted inline, read the match positions, and inspect capture groups — with clear errors when the pattern is invalid.',
    icon: '.*',
    clientOnly: true,
    tags: ['regex', 'regular expression', 'test regex', 'pattern', 'match', 'capture groups', 'regexp', 'validate email regex'],
    aliases: ['regex tester', 'test regex', 'regular expression tester', 'check my regex'],
    steps: [
      'Enter a pattern, e.g. \\b\\w+@\\w+\\.\\w+\\b.',
      'Toggle flags (g, i, m, s, u).',
      'Paste or type your test string and watch the matches appear.',
    ],
    features: [
      'Live inline highlighting of all matches',
      'Global, case-insensitive, multiline, dotall and unicode flags',
      'Match index and capture-group inspection',
      'Precise error messages for invalid patterns',
      'Copy all matches at once',
    ],
    faq: [
      {
        q: 'Why do I only see one match?',
        a: 'Without the global flag (g), regular expressions only ever report the first match. Turn on “g” to find all of them.',
      },
      {
        q: 'Is this the same as JavaScript regex?',
        a: 'Yes — it uses your browser’s native RegExp engine, so behavior matches JavaScript (and nearly all modern engines) exactly.',
      },
    ],
    related: ['json-formatter', 'base64', 'url-encoder'],
    component: lazy(() => import('../tools/dev/RegexTester')),
  },
  {
    slug: 'query-string-parser',
    name: 'Query String Parser',
    category: 'developer',
    tagline: 'Parse URL query parameters into a clean table and JSON.',
    description:
      'Paste a full URL or a raw query string and instantly see every key/value pair in a table, plus a ready-to-copy JSON representation. Handles repeated keys and encoded characters.',
    icon: '?',
    clientOnly: true,
    tags: ['query string', 'url parameters', 'parse query', 'query params to json', 'get parameters', 'uri', 'url parser'],
    aliases: ['query string parser', 'parse url params', 'query params to json', 'url query string to json'],
    steps: [
      'Paste a full URL or a raw query string (a=1&b=2).',
      'Read the key/value table.',
      'Copy the JSON or download it.',
    ],
    features: [
      'Full URLs or bare query strings',
      'Automatic URL-decoding of values',
      'Repeated keys collected into arrays',
      'Copy or download as JSON',
    ],
    faq: [
      {
        q: 'What about percent-encoded values like %20?',
        a: 'Values are decoded automatically — %20 becomes a space, %26 becomes &, and so on.',
      },
      {
        q: 'Does it work with fragments (#…)?',
        a: 'Fragments are part of the URL, not the query string, so they are ignored. Only the ?… part is parsed.',
      },
    ],
    related: ['url-encoder', 'utm-builder', 'json-to-csv'],
    component: lazy(() => import('../tools/dev/QueryStringParser')),
  },
  {
    slug: 'json-to-csv',
    name: 'JSON to CSV Converter',
    category: 'developer',
    tagline: 'Turn an array of JSON objects into a clean CSV file.',
    description:
      'Convert JSON arrays into CSV with automatic headers, proper quoting of commas, quotes and newlines, and nested values serialized as JSON. Runs entirely in your browser.',
    icon: '⇄',
    clientOnly: true,
    tags: ['json to csv', 'json csv converter', 'export csv', 'data conversion', 'spreadsheet', 'tabular', 'table'],
    aliases: ['json to csv', 'convert json to csv', 'json to spreadsheet', 'json to excel'],
    steps: [
      'Paste an array of JSON objects (or an object containing one array).',
      'Press “Convert JSON → CSV”.',
      'Copy the CSV or download it as a .csv file.',
    ],
    features: [
      'Automatic header row from object keys',
      'Safe quoting for commas, quotes and line breaks',
      'Nested objects/arrays serialized as JSON strings',
      'Download as .csv (opens in Excel/Sheets)',
    ],
    faq: [
      {
        q: 'My rows have different keys — what happens?',
        a: 'The header includes the union of all keys, in order of first appearance; missing values become empty cells.',
      },
      {
        q: 'Does it handle accented characters?',
        a: 'Yes. If Excel shows garbled text on Windows, open the file and re-save it as UTF-8, or paste it into a spreadsheet instead.',
      },
    ],
    related: ['csv-to-json', 'json-formatter', 'query-string-parser'],
    component: lazy(() =>
      import('../tools/dev/JsonCsv').then((m) => ({ default: () => createElement(m.default, { direction: 'json2csv' }) })),
    ),
  },
  {
    slug: 'csv-to-json',
    name: 'CSV to JSON Converter',
    category: 'developer',
    tagline: 'Turn CSV data into a JSON array of objects.',
    description:
      'Paste CSV and get a clean JSON array — first row becomes the keys. Handles quoted fields, escaped quotes, commas and newlines inside quotes.',
    icon: '⇄',
    clientOnly: true,
    tags: ['csv to json', 'csv json converter', 'import csv', 'data conversion', 'tabular', 'spreadsheet to json'],
    aliases: ['csv to json', 'convert csv to json', 'csv to javascript object'],
    steps: [
      'Paste your CSV (first row = column headers).',
      'Press “Convert CSV → JSON”.',
      'Copy the JSON or download it as a .json file.',
    ],
    features: [
      'Full CSV parsing: quotes, “” escapes, newlines in fields',
      'First row auto-used as object keys',
      'Duplicate headers get numbered suffixes',
      'Download as .json',
    ],
    faq: [
      {
        q: 'Are numbers converted to numbers?',
        a: 'Values stay as strings (the standard, safe behavior for CSV). Parse them yourself or in your app — CSV has no types.',
      },
      {
        q: 'What if my CSV has no header row?',
        a: 'The first row is always treated as the header. Add a row like id,name,value if you have none.',
      },
    ],
    related: ['json-to-csv', 'json-formatter', 'query-string-parser'],
    component: lazy(() =>
      import('../tools/dev/JsonCsv').then((m) => ({ default: () => createElement(m.default, { direction: 'csv2json' }) })),
    ),
  },

  /* ---------------------- Phase 3 — PDF extras ---------------------- */
  {
    slug: 'pdf-page-deleter',
    name: 'PDF Page Deleter',
    category: 'pdf',
    tagline: 'Remove specific pages from a PDF, keeping the rest.',
    description:
      'Delete the pages you don’t want from a PDF document — enter them by number or range and download a clean copy. All processing happens in your browser.',
    icon: '🗑️',
    clientOnly: true,
    tags: ['delete pdf pages', 'remove pages from pdf', 'pdf page remover', 'drop pages', 'pdf editor', 'cut pages'],
    aliases: ['delete pages from pdf', 'remove pdf pages', 'pdf page deleter', 'drop pdf pages'],
    steps: [
      'Add a PDF file.',
      'Enter the pages to delete, e.g. “2, 5-8”.',
      'Press “Delete pages” and download the result.',
    ],
    features: [
      'Delete by single pages or ranges',
      'Knows your document’s page count',
      'Protects against deleting everything',
      'No uploads — runs locally',
    ],
    faq: [
      {
        q: 'Can I undo a deletion?',
        a: 'The original file on your device is untouched — only the downloaded copy is changed. You can always delete different pages from the original.',
      },
      {
        q: 'Why not “keep pages” instead?',
        a: 'Both mental models exist — the PDF Splitter works in “keep” mode if that suits you better.',
      },
    ],
    related: ['pdf-splitter', 'pdf-rotator', 'pdf-merger'],
    component: lazy(() => import('../tools/pdf/PageDeleter')),
  },
  {
    slug: 'pdf-rotator',
    name: 'PDF Rotator',
    category: 'pdf',
    tagline: 'Rotate PDF pages 90°, 180° or 270°, clockwise or not.',
    description:
      'Fix sideways pages: rotate specific pages (or all of them) by 90°, 180° or 270° in either direction, then download the corrected PDF. 100% in your browser.',
    icon: '🔄',
    clientOnly: true,
    tags: ['rotate pdf', 'pdf page rotation', 'sideways page', 'fix orientation', 'pdf editor', 'landscape portrait'],
    aliases: ['rotate pdf pages', 'rotate pdf 90', 'fix sideways pdf page', 'pdf rotator'],
    steps: [
      'Add a PDF file.',
      'Choose the pages (empty = all), the angle and the direction.',
      'Press “Rotate pages” and download.',
    ],
    features: [
      'Rotate selected pages or the whole document',
      '90°, 180° and 270°',
      'Clockwise or counter-clockwise',
      'Rotations stack correctly if you rotate twice',
    ],
    faq: [
      {
        q: 'Does rotating flatten or compress my PDF?',
        a: 'No — rotation is stored as page metadata, so quality and file size are essentially unchanged.',
      },
      {
        q: 'Can different pages get different rotations?',
        a: 'One run applies the same angle to the pages you select. To rotate different pages differently, run the tool several times and download after each run.',
      },
    ],
    related: ['pdf-page-deleter', 'pdf-splitter', 'pdf-merger'],
    component: lazy(() => import('../tools/pdf/Rotator')),
  },

  /* --------------------- Phase 3 — Image extras --------------------- */
  {
    slug: 'image-metadata-cleaner',
    name: 'Image Metadata Cleaner',
    category: 'image',
    tagline: 'Strip EXIF, GPS and camera data from images before sharing.',
    description:
      'Remove hidden metadata — GPS location, camera model, edit history — from JPG, PNG and WebP images by re-encoding them from pixels only. Essential before publishing photos you took on your phone.',
    icon: '🧼',
    clientOnly: true,
    tags: ['remove exif', 'metadata cleaner', 'gps location', 'photo metadata', 'privacy', 'strip exif', 'clean image', 'hide location'],
    aliases: ['remove exif data', 'strip image metadata', 'remove gps from photo', 'clean photo metadata'],
    steps: [
      'Drop one or more images.',
      'Pick an output format.',
      'Press “Remove metadata” and download the clean copies.',
    ],
    features: [
      'Removes EXIF, GPS, camera and edit-history data',
      'Batch processing',
      'Choose PNG, JPEG or WebP output',
      'Before/after file sizes',
      'Runs on your device — no upload of your photos',
    ],
    faq: [
      {
        q: 'Why does this remove metadata at all?',
        a: 'The image is decoded to raw pixels and re-encoded. Metadata (which lives in separate image headers) is simply not copied over.',
      },
      {
        q: 'Will the photo quality change?',
        a: 'PNG output is lossless. JPEG/WebP are re-compressed (quality 92%), which is visually identical but slightly different in bytes.',
      },
    ],
    related: ['image-compressor', 'image-converter', 'image-cropper'],
    component: lazy(() => import('../tools/image/MetadataCleaner')),
  },
  {
    slug: 'image-to-base64',
    name: 'Image to Base64',
    category: 'image',
    tagline: 'Convert an image into a Base64 data URL for embedding.',
    description:
      'Turn an image file into a Base64 data URL (data:image/…;base64,…) you can paste directly into HTML, CSS or JSON. Generated locally — your image is never uploaded.',
    icon: '🔣',
    clientOnly: true,
    tags: ['image to base64', 'base64 image', 'data url', 'embed image', 'html image', 'inline image', 'convert image'],
    aliases: ['image to base64', 'convert image to base64', 'image to data url', 'base64 encode image'],
    steps: [
      'Drop an image (PNG, JPG, WebP, GIF or SVG).',
      'Press “Convert to Base64”.',
      'Copy the data URL or re-download the image.',
    ],
    features: [
      'Full data URL output, ready to paste',
      'PNG, JPG, WebP, GIF and SVG input',
      'Shows the resulting data-URL size',
      'Copy with one click',
    ],
    faq: [
      {
        q: 'When should I use a data URL?',
        a: 'For small icons and decorative images embedded in HTML/CSS where you want a single self-contained file. For real photos, a separate image file is almost always better — Base64 is ~33% larger.',
      },
      {
        q: 'Why is the output so long?',
        a: 'Base64 represents every 3 bytes as 4 characters, so it’s always about 33% bigger than the binary file. A 100 KB image becomes a ~133 KB data URL.',
      },
    ],
    related: ['base64-to-image', 'base64', 'image-converter'],
    component: lazy(() =>
      import('../tools/image/Base64Image').then((m) => ({ default: () => createElement(m.default, { direction: 'toBase64' }) })),
    ),
  },
  {
    slug: 'base64-to-image',
    name: 'Base64 to Image',
    category: 'image',
    tagline: 'Decode a Base64 data URL back into a real image file.',
    description:
      'Paste a Base64 image data URL and get back a preview plus a downloadable image file. Handy for recovering images hidden in emails, logs and HTML source.',
    icon: '🖼️',
    clientOnly: true,
    tags: ['base64 to image', 'decode base64 image', 'data url to image', 'extract image', 'base64 decoder'],
    aliases: ['base64 to image', 'decode base64 image', 'convert base64 to png', 'data url to png'],
    steps: [
      'Paste the data URL (it starts with data:image/…;base64,).',
      'Press “Decode to image”.',
      'Preview and download the restored image.',
    ],
    features: [
      'Detects the image type from the data URL',
      'Live preview of the decoded image',
      'Download as a real file',
      'Decoding happens locally',
    ],
    faq: [
      {
        q: 'Does it work with raw Base64 (no data: prefix)?',
        a: 'It needs the data URL prefix to know the image type. If you only have raw Base64, prepend “data:image/png;base64,” (or the correct type) first.',
      },
      {
        q: 'Which image types can it decode?',
        a: 'Whatever the data URL declares — PNG, JPEG, WebP, GIF and SVG all work, since decoding just reverses the encoding.',
      },
    ],
    related: ['image-to-base64', 'base64', 'image-converter'],
    component: lazy(() =>
      import('../tools/image/Base64Image').then((m) => ({ default: () => createElement(m.default, { direction: 'fromBase64' }) })),
    ),
  },

  /* ------------------- Phase 3 — Marketing extras -------------------- */
  {
    slug: 'social-text-formatter',
    name: 'Social Media Text Formatter',
    category: 'marketing',
    tagline: 'Bold, italic, script and 8 more Unicode text styles.',
    description:
      'Style your text for social media bios and posts with fancy Unicode characters: bold, italic, monospace, script, superscript, fullwidth, encircled and more — no app or image needed.',
    icon: '✒️',
    clientOnly: true,
    tags: ['fancy text', 'bold text', 'aesthetic text', 'unicode text', 'instagram bio', 'stylized text', 'decorative font', 'cool font'],
    aliases: ['fancy text generator', 'bold text for instagram', 'aesthetic font generator', 'stylized text'],
    steps: [
      'Type your text.',
      'Pick a style from the grid.',
      'Copy it and paste into your bio or post.',
    ],
    features: [
      '11 styles at once: bold, italic, script, mono and more',
      'Instant results as you type',
      'One-click copy for each style',
      'Works in most apps and platforms',
    ],
    faq: [
      {
        q: 'Will it work on Instagram/TikTok/X?',
        a: 'These are real Unicode characters, so they work anywhere Unicode text is supported — including bios. Some platforms may render rare styles differently.',
      },
      {
        q: 'Is this a real font?',
        a: 'No font is installed. Each style is a different set of Unicode code points that most devices already know how to draw.',
      },
    ],
    related: ['hashtag-generator', 'case-converter', 'qr-generator'],
    component: lazy(() => import('../tools/marketing/SocialFormatter')),
  },
  {
    slug: 'hashtag-generator',
    name: 'Hashtag Generator',
    category: 'marketing',
    tagline: 'Generate relevant hashtags from your content.',
    description:
      'Paste your caption, bio or product description and get the most relevant hashtags, ranked by how often the words appear. Copy them all in one click.',
    icon: '#',
    clientOnly: true,
    tags: ['hashtag generator', 'hashtags for instagram', 'create hashtags', 'social media hashtags', 'trend hashtags', 'caption'],
    aliases: ['hashtag generator', 'generate hashtags', 'make hashtags for my post', 'instagram hashtags'],
    steps: [
      'Paste your content or description.',
      'Choose how many hashtags you want.',
      'Press “Generate” and copy them.',
    ],
    features: [
      'Frequency-based relevance ranking',
      'Common filler words filtered out',
      'Copy all as one ready-to-paste string',
      '1–30 hashtags per batch',
    ],
    faq: [
      {
        q: 'How do hashtags actually help?',
        a: 'They categorize your post so people browsing that tag can find it. Specific, niche tags usually outperform huge generic ones.',
      },
      {
        q: 'Why did some of my words not become hashtags?',
        a: 'Very common words (the, and, for…) and short fragments are skipped so the results stay meaningful.',
      },
    ],
    related: ['social-text-formatter', 'utm-builder', 'meta-tag-generator'],
    component: lazy(() => import('../tools/marketing/HashtagGenerator')),
  },

  /* ------------------- Phase 3 — Business extras --------------------- */
  {
    slug: 'quotation-generator',
    name: 'Quotation Generator',
    category: 'business',
    tagline: 'Professional quotations with a “valid until” date, printable as PDF.',
    description:
      'Create a clean business quotation: your details, the client, priced line items, tax and discount, plus a validity period. Preview live, then print or save as PDF — free and private.',
    icon: '📑',
    clientOnly: true,
    tags: ['quotation generator', 'quote generator', 'create quotation', 'business quote', 'pdf quotation', 'estimate', 'proposal price'],
    aliases: ['quotation generator', 'create a quote', 'quotation maker', 'business estimate generator'],
    steps: [
      'Fill in your business details and the client’s.',
      'Add priced line items, tax and discount.',
      'Set the “valid until” date, then print / save as PDF.',
    ],
    features: [
      'Live preview as you type',
      'Line items with quantity × price',
      'Validity period (“valid until”)',
      'Any currency symbol',
      'Print or save as PDF, download HTML',
    ],
    faq: [
      {
        q: 'Quotation vs. invoice?',
        a: 'A quotation proposes a price (“we will charge this if you proceed”); an invoice demands payment. Start with a quote, then switch to the Invoice Generator once accepted.',
      },
      {
        q: 'How do I send the quotation to a client?',
        a: 'Print / save it as PDF and attach it to an email, or download the HTML version — both look professional with your details and the line items.',
      },
    ],
    related: ['invoice-generator', 'receipt-generator', 'discount-calculator'],
    component: lazy(() => import('../tools/business/DocumentGenerator').then((m) => ({ default: m.QuoteDoc }))),
  },

  /* --------------------- Phase 3 — Utility extras -------------------- */
  {
    slug: 'number-to-words',
    name: 'Number to Words',
    category: 'utility',
    tagline: '150000 → “One hundred and fifty thousand” — with currency.',
    description:
      'Convert numbers into English words, with an optional currency layer for checks, cheques and official documents (₦ NGN, $ USD, € EUR, £ GBP). Works up to 999 quadrillion.',
    icon: '🔤',
    clientOnly: true,
    tags: ['number to words', 'spell out number', 'words for number', 'check amount', 'cheque', 'naira in words', 'amount in words', 'currency words'],
    aliases: ['number to words', 'write number in words', '150000 in words', 'spell out amount in naira'],
    steps: [
      'Enter a whole number.',
      'Choose plain words or “with currency”.',
      'Copy the result.',
    ],
    features: [
      'Full English number words',
      'Currency layer: NGN, USD, EUR, GBP',
      'Handles negatives',
      'Up to 999,999,999,999,999',
    ],
    faq: [
      {
        q: 'Which format should I use on a cheque?',
        a: 'Check with your bank — most want the amount in words with the currency name, e.g. “One hundred and fifty thousand Nigerian Naira”. Capitalize the first letter if required.',
      },
      {
        q: 'Why no decimals?',
        a: 'Words for fractions (e.g. “and 50/100”) follow different conventions per country and institution, so this tool sticks to whole numbers.',
      },
    ],
    related: ['percentage-calculator', 'discount-calculator', 'invoice-generator'],
    component: lazy(() => import('../tools/utility/NumberToWords')),
  },
  {
    slug: 'stopwatch',
    name: 'Stopwatch',
    category: 'utility',
    tagline: 'A precise stopwatch with lap times and splits.',
    description:
      'A clean, accurate stopwatch with start/pause, lap recording and per-lap splits — precise to the millisecond, and it keeps counting correctly in the background.',
    icon: '⏱️',
    clientOnly: true,
    tags: ['stopwatch', 'timer', 'lap timer', 'count up', 'time trial', 'millisecond timer', 'kitchen timer'],
    aliases: ['stopwatch', 'lap timer', 'count up timer', 'precision stopwatch'],
    steps: ['Press Start.', 'Record laps any time.', 'Pause and reset when done.'],
    features: [
      'Millisecond precision',
      'Lap times with split durations',
      'Accurate when the tab is in the background',
      'No ads, no account — just time',
    ],
    faq: [
      {
        q: 'Does it stay accurate when I switch tabs?',
        a: 'Yes — it measures against the system clock, not the animation frame rate, so background tabs don’t slow it down.',
      },
      {
        q: 'Is there a maximum time?',
        a: 'No practical limit — the display switches to hours when you pass an hour, and millisecond precision is kept throughout.',
      },
    ],
    related: ['countdown-timer', 'timestamp-converter', 'age-calculator'],
    component: lazy(() => import('../tools/utility/Stopwatch')),
  },
  {
    slug: 'countdown-timer',
    name: 'Countdown Timer',
    category: 'utility',
    tagline: 'Set hours, minutes or seconds — get an alarm when it hits zero.',
    description:
      'A simple countdown timer: set the duration, start it, and get an audible chime plus a clear “time’s up” banner. Great for breaks, cooking, study sessions and workouts.',
    icon: '⏰',
    clientOnly: true,
    tags: ['countdown timer', 'timer', 'pomodoro', 'break timer', 'cooking timer', 'study timer', 'alarm', 'time off'],
    aliases: ['countdown timer', 'set a timer', 'pomodoro timer', '5 minute timer'],
    steps: ['Set hours, minutes and seconds.', 'Press Start.', 'Take a break when it chimes.'],
    features: [
      'Hours, minutes and seconds',
      'Audible chime at zero (3 beeps)',
      'Pause and resume',
      'Stays accurate in background tabs',
    ],
    faq: [
      {
        q: 'I don’t hear the chime?',
        a: 'Browsers block audio until you’ve interacted with the page — pressing Start counts, so the chime should play. Check your system volume too.',
      },
      {
        q: 'How long can a countdown be?',
        a: 'Up to 99 hours, 59 minutes and 59 seconds — long enough for overnight infusions and very short enough for a 30-second sprint.',
      },
    ],
    related: ['stopwatch', 'timestamp-converter'],
    component: lazy(() => import('../tools/utility/Timer')),
  },
  {
    slug: 'random-number-generator',
    name: 'Random Number Generator',
    category: 'utility',
    tagline: 'Random numbers in any range — integers or decimals, unique or not.',
    description:
      'Generate random numbers between any minimum and maximum: whole numbers or decimals, as many as you need (up to 1,000), with optional uniqueness. Perfect for raffles, sampling and games.',
    icon: '🎲',
    clientOnly: true,
    tags: ['random number', 'random generator', 'dice', 'raffle', 'pick random', 'randomize', 'lottery', 'random pick'],
    aliases: ['random number generator', 'pick a random number', 'random between 1 and 100', 'raffle random picker'],
    steps: [
      'Set the minimum and maximum.',
      'Choose how many, and whether they must be unique.',
      'Press “Generate numbers”.',
    ],
    features: [
      'Any range, integers or decimals (up to 6 dp)',
      'Up to 1,000 numbers per batch',
      'Unique-values mode',
      'Copy all or download as .txt',
    ],
    faq: [
      {
        q: 'Is it cryptographically secure?',
        a: 'It uses Math.random(), which is fine for games, raffles and sampling — but not for security purposes like tokens or lotteries with legal stakes. Use the Password Generator for that.',
      },
      {
        q: 'Can I pick one number instead of many?',
        a: 'Yes — set “how many” to 1. That’s the classic “pick a random winner” use case.',
      },
    ],
    related: ['password-generator', 'uuid-generator', 'stopwatch'],
    component: lazy(() => import('../tools/utility/RandomNumber')),
  },
  {
    slug: 'contrast-checker',
    name: 'Contrast Checker',
    category: 'utility',
    tagline: 'Check text/background color contrast against WCAG AA & AAA.',
    description:
      'Pick a text color and a background color to get the exact contrast ratio plus pass/fail for WCAG 2.1 AA and AAA (normal and large text) — with a live preview.',
    icon: '🌓',
    clientOnly: true,
    tags: ['contrast checker', 'wcag', 'accessibility', 'color contrast', 'contrast ratio', 'aa aaa', 'text contrast', 'design check'],
    aliases: ['contrast checker', 'wcag contrast checker', 'check color contrast', 'contrast ratio calculator'],
    steps: [
      'Pick your text color and background color.',
      'Read the ratio and the AA/AAA verdicts.',
      'Adjust until it passes — the preview updates live.',
    ],
    features: [
      'Exact contrast ratio (1:1 – 21:1)',
      'WCAG 2.1 AA & AAA verdicts for normal and large text',
      'Live color preview',
      'One-click swap',
    ],
    faq: [
      {
        q: 'What ratio should I target?',
        a: 'At least 4.5:1 for normal text (AA) is the legal baseline in many jurisdictions; 7:1 (AAA) is the gold standard. Large text needs only 3:1 for AA.',
      },
      {
        q: 'Do I need to check both light and dark mode?',
        a: 'Yes — dark mode isn’t automatically darker or lighter. Check each theme’s actual text/background pair separately.',
      },
    ],
    related: ['color-converter', 'qr-generator', 'meta-tag-generator'],
    component: lazy(() => import('../tools/utility/ContrastChecker')),
  },
];

export const TOOL_BY_SLUG: Record<string, Tool> = Object.fromEntries(TOOLS.map((t) => [t.slug, t]));

export function getTool(slug: string): Tool | undefined {
  return TOOL_BY_SLUG[slug];
}

export function toolsByCategory(categoryId: string): Tool[] {
  return TOOLS.filter((t) => t.category === categoryId);
}

export function featuredTools(): Tool[] {
  return TOOLS.filter((t) => t.featured);
}

export function relatedTools(slug: string, limit = 3): Tool[] {
  const tool = TOOL_BY_SLUG[slug];
  if (!tool) return [];
  const related = tool.related
    .map((s) => TOOL_BY_SLUG[s])
    .filter((t): t is Tool => Boolean(t))
    .slice(0, limit);
  return related;
}
