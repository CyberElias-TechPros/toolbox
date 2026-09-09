import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface TabItem {
  id: string;
  label: ReactNode;
}

export function Tabs({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-100/80 p-1 dark:border-zinc-800 dark:bg-zinc-950/60',
        className,
      )}
    >
      {items.map((item) => (
        <button
          key={item.id}
          role="tab"
          aria-selected={value === item.id}
          onClick={() => onChange(item.id)}
          className={cn(
            'whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors',
            value === item.id
              ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50'
              : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
