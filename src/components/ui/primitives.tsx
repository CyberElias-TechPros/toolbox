import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

/* ------------------------------- Button ------------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-900',
  secondary:
    'border border-zinc-300 bg-white text-zinc-800 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800',
  ghost: 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50',
  danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-500',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export function Button({ variant = 'primary', size = 'md', className, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    />
  );
}

/* -------------------------------- Card -------------------------------- */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-zinc-200 bg-white shadow-card dark:border-zinc-800 dark:bg-zinc-900',
        className,
      )}
    >
      {children}
    </div>
  );
}

/* -------------------------------- Badge ------------------------------- */

export function Badge({
  className,
  children,
  tone = 'default',
}: {
  className?: string;
  children: ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'info' | 'brand';
}) {
  const tones: Record<string, string> = {
    default: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    info: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
    brand: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', tones[tone], className)}>
      {children}
    </span>
  );
}

/* ------------------------------- Spinner ------------------------------ */

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-sm text-zinc-500 dark:text-zinc-400" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600 dark:border-zinc-700 dark:border-t-indigo-400" />
      {label ?? 'Working…'}
    </div>
  );
}

/* -------------------------------- Stat -------------------------------- */

export function Stat({
  label,
  value,
  sub,
  accent,
  className,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('rounded-xl border border-zinc-200 bg-zinc-50/60 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40', className)}>
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className={cn('mt-1 text-xl font-semibold tabular-nums', accent && 'text-indigo-600 dark:text-indigo-400')}>{value}</div>
      {sub ? <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{sub}</div> : null}
    </div>
  );
}

/* ------------------------------ Notes --------------------------------- */

export function ErrorNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function InfoNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200', className)}>
      {children}
    </div>
  );
}

export function SuccessNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ---------------------------- Section title --------------------------- */

export function SectionTitle({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <h2 id={id} className={cn('text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50', className)}>
      {children}
    </h2>
  );
}
