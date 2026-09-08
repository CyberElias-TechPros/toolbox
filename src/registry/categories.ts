import type { Category } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'image',
    name: 'Image Tools',
    icon: '🖼️',
    tagline: 'Compress, resize, convert and crop images',
    description:
      'Make images smaller, change their format, dimensions or orientation — all processed privately on your device.',
  },
  {
    id: 'pdf',
    name: 'PDF & Document Tools',
    icon: '📄',
    tagline: 'Merge, split and create PDF files',
    description:
      'Combine PDFs, extract pages and build new PDFs from images. Files never leave your browser.',
  },
  {
    id: 'text',
    name: 'Text Tools',
    icon: '✍️',
    tagline: 'Count, clean, transform and compare text',
    description:
      'Everyday text utilities: word counts, cleaning messy copies, case conversion, diffing and placeholder text.',
  },
  {
    id: 'developer',
    name: 'Developer Tools',
    icon: '💻',
    tagline: 'JSON, Base64, UUID, colors and more',
    description:
      'Fast utilities for developers: format and validate JSON, encode Base64, generate UUIDs, convert colors and timestamps.',
  },
  {
    id: 'calculator',
    name: 'Calculator & Converter Tools',
    icon: '🔢',
    tagline: 'Percentages, discounts, units, file sizes',
    description:
      'Practical calculators and unit converters for everyday math, shopping, measurements and data sizes.',
  },
  {
    id: 'marketing',
    name: 'Marketing & Social Tools',
    icon: '📣',
    tagline: 'QR codes, UTM links and meta tags',
    description:
      'Create QR codes, build tracked marketing links and generate SEO meta tags for your pages.',
  },
  {
    id: 'business',
    name: 'Business Tools',
    icon: '💼',
    tagline: 'Invoices, receipts and documents',
    description:
      'Professional, printable business documents you can create in minutes and save as PDF — no template fees.',
  },
  {
    id: 'utility',
    name: 'Utility Tools',
    icon: '🔧',
    tagline: 'Everyday helpers',
    description:
      'Small but essential helpers, like secure password generation, that you reach for constantly.',
  },
];

export const CATEGORY_BY_ID: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
);
