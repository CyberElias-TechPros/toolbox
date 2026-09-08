import { useEffect, useRef, useState } from 'react';
import { copyToClipboard, cn } from '../../lib/utils';
import { track } from '../../lib/track';
import type { ButtonProps } from './primitives';
import { Button } from './primitives';

/** Button that copies text and shows a transient “Copied” state. */
export function CopyButton({
  text,
  label = 'Copy',
  copiedLabel = 'Copied ✓',
  size = 'sm',
  variant = 'secondary',
  className,
  ...rest
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
} & ButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (!copied) return;
    timer.current = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer.current);
  }, [copied]);

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(copied && 'border-emerald-400 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300', className)}
      disabled={!text}
      onClick={async () => {
        const ok = await copyToClipboard(text);
        if (ok) {
          setCopied(true);
          track('copy_clicked');
        }
      }}
      {...rest}
    >
      {copied ? copiedLabel : label}
    </Button>
  );
}
