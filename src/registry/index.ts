import { lazy } from 'react';
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
