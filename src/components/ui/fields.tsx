import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Label({ htmlFor, children, className }: { htmlFor?: string; children: ReactNode; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn('mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300', className)}>
      {children}
    </label>
  );
}

const inputBase =
  'w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500';

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputBase, className)} {...rest} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(inputBase, 'min-h-[9rem] resize-y font-mono text-[13px] leading-relaxed', className)}
      spellCheck={false}
      {...rest}
    />
  );
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputBase, 'cursor-pointer appearance-none pr-9', className)} {...rest}>
      {children}
    </select>
  );
}

export function Range({
  className,
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
}: {
  className?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  label?: string;
}) {
  const id = useId();
  return (
    <input
      id={id}
      aria-label={label}
      type="range"
      className={cn(
        'h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-indigo-600 dark:bg-zinc-700',
        className,
      )}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}

export function Checkbox({
  label,
  checked,
  onChange,
  className,
}: {
  label: ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer select-none items-center gap-2.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-700 transition-colors hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-700',
        checked && 'border-indigo-400 bg-indigo-50/60 dark:border-indigo-600 dark:bg-indigo-950/40',
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        className="h-4 w-4 rounded border-zinc-300 accent-indigo-600"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

/** Labeled field wrapper keeping labels and inputs associated. */
export function Field({ label, hint, children, className }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      {children}
      {hint ? <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p> : null}
    </div>
  );
}
