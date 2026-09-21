import { useState } from 'react';
import { Play, Download, RotateCcw, Sparkles } from 'lucide-react';
import type { ExtraSpec } from '../../registry/extra';
import { transformText, TEXT_SAMPLES, type TextOptions } from '../../lib/extended-text';
import { Card, Button, ErrorNote, InfoNote } from '../../components/ui/primitives';
import { Field, Input, Textarea, Select } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { downloadText } from '../../lib/utils';
export default function TextTools({ spec }: { spec: ExtraSpec }) {
  const [input, setInput] = useState(''),
    [output, setOutput] = useState<string | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const [options, setOptions] = useState<TextOptions>({
    find: 'world',
    replace: 'day',
    count: 5,
    base: 10,
    target: 16,
    secret: '',
  });
  const change = (key: keyof TextOptions, value: string | number) => {
    setOptions((o) => ({ ...o, [key]: value }));
    setOutput(null);
  };
  const run = async () => {
    setError('');
    setOutput(null);
    setBusy(true);
    try {
      setOutput(await transformText(spec.slug, input, options));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const extension = spec.slug.endsWith('yaml')
    ? 'yaml'
    : spec.slug.includes('json') || spec.slug === 'jwt-decoder'
      ? 'json'
      : spec.slug === 'css-minifier'
        ? 'css'
        : spec.slug === 'javascript-minifier'
          ? 'js'
          : spec.slug === 'json-to-xml'
            ? 'xml'
            : spec.slug === 'sql-formatter'
              ? 'sql'
              : 'txt';
  return (
    <Card className="tool-workspace">
      <div className="flex items-center justify-between mb-5">
        <span className="eyebrow muted">YOUR PRIVATE WORKSPACE</span>
        <Button
          disabled={busy}
          variant="ghost"
          size="sm"
          onClick={() => {
            setInput(TEXT_SAMPLES[spec.slug] || 'Hello, world!');
            setOutput(null);
            setError('');
            if (spec.slug === 'hmac-generator') change('secret', 'example-key');
          }}
        >
          <Sparkles size={14} /> Try an example
        </Button>
      </div>
      {spec.note && <InfoNote className="mb-5">{spec.note}</InfoNote>}
      <div className="workbench-grid">
        <Field label="Input">
          <Textarea
            disabled={busy}
            aria-label="Input"
            placeholder="Paste your content here…"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setOutput(null);
            }}
            spellCheck={false}
          />
        </Field>
        <Field label="Result">
          <Textarea
            aria-label="Result"
            placeholder="A little less busywork starts here."
            value={output ?? ''}
            readOnly
            spellCheck={false}
          />
        </Field>
      </div>
      {spec.slug === 'find-replace' && (
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Field label="Find (case-sensitive)">
            <Input
              disabled={busy}
              aria-label="Find"
              value={options.find}
              onChange={(e) => change('find', e.target.value)}
            />
          </Field>
          <Field label="Replace with">
            <Input
              disabled={busy}
              aria-label="Replace with"
              value={options.replace}
              onChange={(e) => change('replace', e.target.value)}
            />
          </Field>
        </div>
      )}
      {spec.slug === 'text-repeater' && (
        <Field label="Repetitions" className="mt-4">
          <Input
            disabled={busy}
            aria-label="Repetitions"
            type="number"
            min={1}
            max={10000}
            value={options.count}
            onChange={(e) => change('count', +e.target.value)}
          />
        </Field>
      )}
      {spec.slug === 'number-base-converter' && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {(['base', 'target'] as const).map((key, i) => (
            <Field key={key} label={i ? 'To base' : 'From base'}>
              <Select
                disabled={busy}
                aria-label={i ? 'To base' : 'From base'}
                value={options[key]}
                onChange={(e) => change(key, +e.target.value)}
              >
                {[2, 8, 10, 16].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </Field>
          ))}
        </div>
      )}
      {spec.slug === 'hmac-generator' && (
        <Field label="Secret key (UTF-8)" className="mt-4">
          <Input
            disabled={busy}
            aria-label="Secret key"
            autoComplete="off"
            type="password"
            value={options.secret}
            onChange={(e) => change('secret', e.target.value)}
          />
        </Field>
      )}
      <div className="workbench-toolbar">
        <Button onClick={run} disabled={!input.trim() || busy}>
          <Play size={14} />
          {busy ? 'Working…' : 'Run tool'}
        </Button>
        <Button
          disabled={busy}
          variant="ghost"
          onClick={() => {
            setInput('');
            setOutput(null);
            setError('');
          }}
        >
          <RotateCcw size={14} /> Clear
        </Button>
        {output !== null && (
          <>
            <CopyButton text={output} />
            <Button variant="secondary" onClick={() => downloadText(output, `${spec.slug}.${extension}`)}>
              <Download size={14} />
              Download result
            </Button>
          </>
        )}
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
      {output === '' && (
        <InfoNote>
          Done. No matching content was found, or the transformation produced an empty result.
        </InfoNote>
      )}
    </Card>
  );
}
