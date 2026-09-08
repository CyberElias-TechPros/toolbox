import type { ComponentType, LazyExoticComponent } from 'react';

export type CategoryId =
  | 'image'
  | 'pdf'
  | 'text'
  | 'developer'
  | 'calculator'
  | 'marketing'
  | 'business'
  | 'utility';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  tagline: string;
  description: string;
}

export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolMeta {
  slug: string;
  name: string;
  category: CategoryId;
  tagline: string;
  description: string;
  icon: string;
  /** Class A: runs 100% in the browser, no server, no account. */
  clientOnly: boolean;
  featured?: boolean;
  /** Search keywords (lowercase). */
  tags: string[];
  /** Natural-language intent phrases. */
  aliases: string[];
  steps: string[];
  features: string[];
  faq: ToolFaq[];
  /** Slugs of related tools. */
  related: string[];
}

export interface Tool extends ToolMeta {
  component: LazyExoticComponent<ComponentType>;
}
