import { useState } from 'react';
import { cn } from '../../lib/utils';
import type { ToolFaq } from '../../registry/types';

export function Accordion({ items, defaultOpen = 0 }: { items: ToolFaq[]; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-zinc-900 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              {item.q}
              <span
                aria-hidden
                className={cn('text-zinc-400 transition-transform duration-200', isOpen && 'rotate-180')}
              >
                ▾
              </span>
            </button>
            {isOpen ? (
              <p className="animate-fade-in px-5 pb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{item.a}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
