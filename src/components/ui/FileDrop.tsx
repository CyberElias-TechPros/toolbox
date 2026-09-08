import { useRef, useState, type DragEvent } from 'react';
import { cn, formatBytes } from '../../lib/utils';
import { Button } from './primitives';

export interface DropFile {
  file: File;
  id: string;
}

/**
 * Accessible drag-and-drop file input.
 * - drag & drop, click to browse, keyboard (Enter/Space on the zone)
 * - filters by extension, enforces a soft size warning
 */
export function FileDrop({
  accept,
  multiple = true,
  files,
  onFiles,
  onRemove,
  hint,
  maxBytes,
  emptyLabel = 'Drop files here',
  emptySub = 'or',
}: {
  accept: string[];
  multiple?: boolean;
  files: DropFile[];
  onFiles: (files: DropFile[]) => void;
  onRemove?: (id: string) => void;
  hint?: string;
  maxBytes?: number;
  emptyLabel?: string;
  emptySub?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const okExt = (name: string): boolean => {
    const ext = name.toLowerCase().split('.').pop() || '';
    return accept.some((a) => a.toLowerCase().replace(/^\./, '') === ext);
  };

  const addFiles = (list: FileList | File[]) => {
    const incoming = Array.from(list).filter((f) => okExt(f.name));
    if (incoming.length === 0) {
      setError(`Only ${accept.map((a) => `.${a.replace(/^\./, '')}`).join(', ')} files are supported.`);
      return;
    }
    setError(null);
    const withIds: DropFile[] = incoming.map((file) => ({
      file,
      id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
    }));
    onFiles(multiple ? [...files, ...withIds] : withIds);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const tooLarge = maxBytes ? files.some((f) => f.file.size > maxBytes) : false;

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label={`${emptyLabel}. Press Enter to browse files.`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors',
          dragging
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
            : 'border-zinc-300 bg-zinc-50/60 hover:border-indigo-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950/40 dark:hover:border-indigo-600',
        )}
      >
        <span className="text-3xl" aria-hidden>
          {dragging ? '⬇️' : '📂'}
        </span>
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{dragging ? 'Release to add' : emptyLabel}</span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {emptySub} <span className="font-medium text-indigo-600 dark:text-indigo-400">browse your device</span>
        </span>
        {hint ? <span className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">{hint}</span> : null}
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          multiple={multiple}
          accept={accept.map((a) => `.${a.replace(/^\./, '')}`).join(',')}
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : null}
      {tooLarge ? (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          A file exceeds {formatBytes(maxBytes || 0)} — very large files may be slow in the browser.
        </p>
      ) : null}

      {files.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {files.map((df) => (
            <li
              key={df.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span aria-hidden>📄</span>
                <span className="truncate font-medium text-zinc-800 dark:text-zinc-200">{df.file.name}</span>
                <span className="shrink-0 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">{formatBytes(df.file.size)}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1">
                {onRemove ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Remove ${df.file.name}`}
                    onClick={() => onRemove(df.id)}
                  >
                    ✕
                  </Button>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
