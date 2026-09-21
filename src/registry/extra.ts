import { createElement, lazy } from 'react';
import type { CategoryId, Tool } from './types';
export type Engine = 'documents' | 'pdf' | 'text' | 'calculator' | 'spreadsheet' | 'image' | 'files';
export interface ExtraSpec {
  slug: string;
  name: string;
  category: CategoryId;
  engine: Engine;
  tagline: string;
  note?: string;
}
const groups: [Engine, CategoryId, [string, string, string, string?][]][] = [
  [
    'documents',
    'pdf',
    [
      [
        'word-to-pdf',
        'Word to PDF',
        'Your Word document. A beautifully portable PDF.',
        'Supports .docx, not legacy .doc. Browser-rendered pages preserve common formatting and images; complex layouts, fonts, fields and tracked changes can differ from Microsoft Word. Output is image-based, not searchable.',
      ],
      [
        'combine-word-to-pdf',
        'Combine Word to PDF',
        'Many Word documents. One perfectly ordered PDF.',
        'Add multiple .docx files, arrange their order, and export one PDF. Complex Word layouts may differ. PDF pages are image-based.',
      ],
      [
        'documents-to-pdf',
        'Mixed Files to PDF',
        'Bring Word, PDFs, and images together in one file.',
        'Mix .docx, PDF, PNG, JPG and WebP. Existing PDF pages stay searchable; Word and image pages are rendered as images.',
      ],
      [
        'word-to-text',
        'Word to Text',
        'Extract the words. Leave the formatting behind.',
        'Extracts paragraph text from .docx files. Images, headers and advanced formatting are not included.',
      ],
      ['text-to-word', 'Text to Word', 'Turn your notes into a ready-to-share Word document.'],
      [
        'text-to-pdf',
        'Text to PDF',
        'Give plain text a clean, printable home.',
        'Text is rendered with browser fonts into image-based A4 PDF pages.',
      ],
      [
        'markdown-to-pdf',
        'Markdown to PDF',
        'From simple Markdown to a polished PDF.',
        'Supports headings, lists, code, links and emphasis. HTML is sanitized. Output is image-based.',
      ],
      [
        'pdf-to-word',
        'PDF Text to Word',
        'Move selectable PDF text into an editable Word file.',
        'Text-only extraction, not a layout-preserving converter. Scanned documents require OCR, which is not included.',
      ],
    ],
  ],
  [
    'pdf',
    'pdf',
    [
      ['pdf-watermark', 'Watermark PDF', 'Make it yours with a subtle text watermark.'],
      ['pdf-page-numbers', 'Add PDF Page Numbers', 'Keep every page in the picture, and in order.'],
      ['pdf-metadata-editor', 'PDF Metadata Editor', 'Set the title, author, subject, and keywords.'],
      [
        'pdf-to-text',
        'PDF to Text',
        'Take selectable text out of your PDF.',
        'Works with selectable text. Scanned image-only PDFs need OCR, which is not included.',
      ],
      ['pdf-resize', 'Resize PDF Pages', 'Fit every page to A4, Letter, or A3.'],
      ['pdf-reverse', 'Reverse PDF Pages', 'Last page first. Reverse your entire document.'],
      ['pdf-duplicate', 'Duplicate PDF Pages', 'Repeat your document pages in a single PDF.'],
    ],
  ],
  [
    'spreadsheet',
    'business',
    [
      ['csv-to-excel', 'CSV to Excel', 'Make a real Excel workbook from your CSV.'],
      ['excel-to-csv', 'Excel to CSV', 'A spreadsheet, simplified. Export a sheet as CSV.'],
      ['excel-to-json', 'Excel to JSON', 'Turn spreadsheet rows into structured JSON.'],
      ['json-to-excel', 'JSON to Excel', 'From structured data to an organized workbook.'],
      [
        'spreadsheet-viewer',
        'Spreadsheet Viewer',
        'Open an Excel workbook without installing Excel.',
        'Reads .xlsx files and lets you select a worksheet. Previews the first 100 rows; exports include every row. Formulas display cached values, not recalculated results.',
      ],
    ],
  ],
  [
    'text',
    'text',
    [
      ['remove-duplicate-lines', 'Remove Duplicate Lines', 'Keep the first occurrence. Skip the repetition.'],
      ['extract-emails', 'Email Extractor', 'Find unique email addresses in a block of text.'],
      ['extract-urls', 'URL Extractor', 'Pull HTTP and HTTPS links out of your text.'],
      ['slug-generator', 'URL Slug Generator', 'Turn a title into a clean, link-friendly slug.'],
      ['reverse-text', 'Reverse Text', 'Flip your words around, one character at a time.'],
      ['remove-whitespace', 'Remove Whitespace', 'Clear spaces, tabs, and line breaks in one click.'],
      ['text-repeater', 'Text Repeater', 'Repeat a little. Or a lot. You choose.'],
      ['find-replace', 'Find & Replace', 'Find exact matches and replace them everywhere.'],
      ['text-to-binary', 'Text to Binary', 'Encode your text as UTF-8 binary bytes.'],
      ['binary-to-text', 'Binary to Text', 'Make readable text from a sequence of binary bytes.'],
      ['html-entity-encoder', 'HTML Entity Encoder', 'Safely escape special characters for HTML.'],
      ['html-entity-decoder', 'HTML Entity Decoder', 'Turn HTML entities back into readable text.'],
    ],
  ],
  [
    'text',
    'developer',
    [
      ['json-to-yaml', 'JSON to YAML', 'The same data, in a more human-friendly format.'],
      ['yaml-to-json', 'YAML to JSON', 'Turn YAML into validated, formatted JSON.'],
      ['xml-to-json', 'XML to JSON', 'Convert structured XML into readable JSON.'],
      ['json-to-xml', 'JSON to XML', 'Give your JSON data an XML structure.'],
      [
        'jwt-decoder',
        'JWT Decoder',
        'Inspect token headers and payloads locally.',
        'Decoding does not verify signatures or establish token trust. Never treat decoded claims as authenticated.',
      ],
      ['css-minifier', 'CSS Minifier', 'Less CSS to send. The same styles to show.'],
      ['javascript-minifier', 'JavaScript Minifier', 'Make your JavaScript lighter with Terser.'],
      ['sql-formatter', 'SQL Formatter', 'Give complicated queries a little breathing room.'],
      ['json-minifier', 'JSON Minifier', 'Remove the whitespace, keep every value.'],
      ['json-key-sorter', 'JSON Key Sorter', 'Sort object keys, all the way down.'],
      [
        'number-base-converter',
        'Number Base Converter',
        'Binary, octal, decimal, or hex. Your number, your way.',
      ],
      ['hmac-generator', 'HMAC Generator', 'Create a keyed SHA-256 signature, privately.'],
    ],
  ],
  [
    'calculator',
    'calculator',
    [
      [
        'bmi-calculator',
        'BMI Calculator',
        'A quick body mass index calculation.',
        'For adults. BMI is a screening measure, not a diagnosis or personalized health advice.',
      ],
      [
        'loan-calculator',
        'Loan Calculator',
        'See the monthly payment before you commit.',
        'Estimates fixed-rate amortizing loans. Excludes fees, taxes, insurance and lender-specific rounding.',
      ],
      [
        'compound-interest',
        'Compound Interest',
        'See how your savings could grow over time.',
        'Assumes monthly compounding, constant rates and end-of-month contributions. Not financial advice.',
      ],
      ['simple-interest', 'Simple Interest', 'Calculate interest without the compounding.'],
      ['tip-calculator', 'Tip & Bill Splitter', 'A fair split. A thoughtful tip. No mental math.'],
      ['sales-tax-calculator', 'Sales Tax Calculator', 'Know the tax, and the total, before checkout.'],
      ['date-difference', 'Date Difference', 'Count the days between any two dates.'],
      [
        'aspect-ratio-calculator',
        'Aspect Ratio Calculator',
        'Find the right proportions for your next frame.',
      ],
      ['average-calculator', 'Average Calculator', 'Mean, median, and range. Make sense of your numbers.'],
      ['fraction-calculator', 'Fraction Calculator', 'Add two fractions and simplify the answer.'],
      ['pace-calculator', 'Running Pace Calculator', 'Find your minutes per kilometer and average speed.'],
      ['fuel-cost-calculator', 'Fuel Cost Calculator', 'Plan the drive. Know the fuel budget.'],
    ],
  ],
  [
    'image',
    'image',
    [
      ['image-rotate-flip', 'Rotate & Flip Image', 'A fresh perspective, in 90-degree steps.'],
      ['image-grayscale', 'Image to Grayscale', 'Strip back the color. Keep the character.'],
      ['image-brightness', 'Image Brightness', 'A little lighter. A little more balanced.'],
      ['image-watermark', 'Image Watermark', 'Add your name, credit, or copyright to a photo.'],
      ['image-collage', 'Image Collage', 'Bring your favorite images into one neat grid.'],
    ],
  ],
  [
    'files',
    'utility',
    [
      ['zip-creator', 'Create ZIP', 'A whole collection. One tidy ZIP file.'],
      [
        'zip-extractor',
        'Extract ZIP',
        'See what’s inside. Download just what you need.',
        'ZIP only. Password-protected and encrypted archives are not supported. Archives are limited to 50 MB input and 200 MB expanded data.',
      ],
      ['file-hash', 'File Checksum', 'Check file integrity with a SHA-256 fingerprint.'],
    ],
  ],
];
export const EXTRA_SPECS: ExtraSpec[] = groups.flatMap(([engine, category, rows]) =>
  rows.map(([slug, name, tagline, note]) => ({ slug, name, tagline, note, engine, category })),
);
const loaders = {
  documents: () => import('../tools/extended/Documents'),
  pdf: () => import('../tools/extended/PdfTools'),
  spreadsheet: () => import('../tools/extended/Spreadsheets'),
  text: () => import('../tools/extended/TextTools'),
  calculator: () => import('../tools/extended/Calculators'),
  image: () => import('../tools/extended/ImageTools'),
  files: () => import('../tools/extended/FileTools'),
};
export const EXTRA_TOOLS: Tool[] = EXTRA_SPECS.map((spec) => ({
  ...spec,
  icon: '↗',
  clientOnly: true,
  tags: [...spec.slug.split('-'), spec.category, spec.engine, 'new'],
  aliases: [
    spec.name.toLowerCase(),
    spec.slug.replaceAll('-', ' '),
    ...(spec.slug.includes('word') ? ['docx ' + spec.slug.replaceAll('-', ' ')] : []),
  ],
  description:
    spec.tagline +
    ' ' +
    (spec.note || 'Work directly in your browser, with a downloadable result and no account required.'),
  steps:
    spec.engine === 'calculator'
      ? [
          'Enter your values in the labeled fields.',
          'Adjust the inputs to explore different scenarios.',
          'Read your calculated results below.',
        ]
      : spec.engine === 'text'
        ? [
            'Paste your content, or start with the included example.',
            'Adjust the available settings and choose Run tool.',
            'Review your result, then copy or download it.',
          ]
        : [
            'Add your files or enter your content.',
            'Choose your settings. If combining files, arrange them in the order you want.',
            'Run the tool, review the result, and download.',
          ],
  features: [
    'Entirely browser-based',
    'No account or subscription',
    'Local processing, no uploads',
    ...(spec.note ? [spec.note] : ['Downloadable results']),
  ],
  faq: [
    {
      q: 'Are my files or inputs uploaded?',
      a: 'No. Processing runs locally in your browser. Your content is not sent to a conversion server.',
    },
    {
      q: 'What should I know before using this tool?',
      a:
        spec.note ||
        'Use the supported inputs shown in the tool. You can review the result before downloading. Very large files are limited by your browser’s memory.',
    },
  ],
  related: EXTRA_SPECS.filter((s) => s.engine === spec.engine && s.slug !== spec.slug)
    .slice(0, 3)
    .map((s) => s.slug),
  component: lazy(async () => {
    const module = await loaders[spec.engine]();
    return { default: () => createElement(module.default, { spec }) };
  }),
}));
