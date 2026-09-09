import { useState } from 'react';
import { Button, Card, ErrorNote, SuccessNote } from '../../components/ui/primitives';
import { Checkbox, Field, Select, Textarea } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { downloadText, formatBytes } from '../../lib/utils';
import { track } from '../../lib/track';

/** Parse JSON with a precise, friendly error location. */
function parseWithPosition(input: string): { value: unknown; error: null } | { value: null; error: { message: string; line: number; col: number } } {
  try {
    return { value: JSON.parse(input), error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid JSON';
    const posMatch = msg.match(/position (\d+)/i);
    let line = 0;
    let col = 0;
    if (posMatch) {
      const pos = Math.min(parseInt(posMatch[1], 10), input.length);
      const before = input.slice(0, pos);
      const lastNewline = before.lastIndexOf('\n');
      line = (before.match(/\n/g)?.length ?? 0) + 1;
      col = pos - lastNewline;
    }
    return { value: null, error: { message: msg.replace(/ in JSON:.*$/s, ''), line, col } };
  }
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) out[key] = sortKeysDeep(obj[key]);
    return out;
  }
  return value;
}

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [indent, setIndent] = useState('2');
  const [sortKeys, setSortKeys] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [valid, setValid] = useState<boolean | null>(null);

  function run(mode: 'format' | 'minify' | 'validate') {
    if (!input.trim()) {
      setError('Paste some JSON first.');
      return;
    }
    const parsed = parseWithPosition(input);
    if (parsed.error) {
      setError(
        parsed.error.message +
          (parsed.error.line ? ` (line ${parsed.error.line}, column ${parsed.error.col})` : ''),
      );
      setValid(false);
      setOutput(null);
      return;
    }
    const value = sortKeys ? sortKeysDeep(parsed.value) : parsed.value;
    setError(null);
    setValid(true);
    if (mode === 'validate') {
      setOutput(null);
      track('tool_completed', 'json-formatter');
      return;
    }
    setOutput(mode === 'minify' ? JSON.stringify(value) : JSON.stringify(value, null, parseInt(indent, 10)));
    track('tool_completed', 'json-formatter');
  }

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <Textarea
          aria-label="JSON input"
          placeholder='{"name": "John", "age": 25, "skills": ["React", "Node"]}'
          className="min-h-[14rem]"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setValid(null);
          }}
        />
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <Field label="Indent" className="w-28">
            <Select value={indent} onChange={(e) => setIndent(e.target.value)} aria-label="Indent">
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
            </Select>
          </Field>
          <Checkbox label="Sort object keys" checked={sortKeys} onChange={setSortKeys} className="mb-1" />
          <div className="ml-auto flex flex-wrap gap-2">
            <Button onClick={() => run('format')} disabled={!input.trim()}>
              { } Format
            </Button>
            <Button variant="secondary" onClick={() => run('minify')} disabled={!input.trim()}>
              Minify
            </Button>
            <Button variant="secondary" onClick={() => run('validate')} disabled={!input.trim()}>
              ✓ Validate
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mt-4">
            <ErrorNote>
              <span className="font-semibold">Invalid JSON:</span> {error}
            </ErrorNote>
          </div>
        ) : null}
        {valid && !output ? (
          <div className="mt-4">
            <SuccessNote>Valid JSON ✓ — {formatBytes(new Blob([input]).size)}</SuccessNote>
          </div>
        ) : null}
      </Card>

      {output != null ? (
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Output</h2>
            <div className="flex gap-2">
              <CopyButton text={output} label="Copy" />
              <Button variant="secondary" size="sm" onClick={() => downloadText(output, 'formatted.json', 'application/json')}>
                ⬇ .json
              </Button>
            </div>
          </div>
          <pre className="mt-3 max-h-[28rem] overflow-auto rounded-xl bg-zinc-950 p-4 text-[13px] leading-relaxed text-zinc-100">
            {output}
          </pre>
        </Card>
      ) : null}
    </div>
  );
}
