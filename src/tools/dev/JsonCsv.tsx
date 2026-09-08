import { useState } from 'react';
import { Button, Card, ErrorNote } from '../../components/ui/primitives';
import { Tabs } from '../../components/ui/Tabs';
import { Textarea } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { csvToJson, jsonToCsv } from '../../lib/csv';
import { downloadText } from '../../lib/utils';
import { track } from '../../lib/track';

type Dir = 'json2csv' | 'csv2json';

export default function JsonCsv({ direction }: { direction: Dir }) {
  const [dir, setDir] = useState<Dir>(direction);
  const [input, setInput] = useState(
    direction === 'json2csv'
      ? '[\n  { "name": "Alpha", "qty": 3, "price": 150 },\n  { "name": "Beta, the bold", "qty": 1, "price": 99.5 }\n]'
      : 'name,qty,price\nAlpha,3,150\n"Beta, the bold",1,99.5',
  );
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function convert() {
    const res = dir === 'json2csv' ? jsonToCsv(input) : csvToJson(input);
    if (!res.ok) {
      setError(res.error);
      setOutput(null);
      return;
    }
    setError(null);
    setOutput(res.value);
    track('tool_completed', dir === 'json2csv' ? 'json-to-csv' : 'csv-to-json');
  }

  const outName = dir === 'json2csv' ? 'converted.csv' : 'converted.json';
  const outMime = dir === 'json2csv' ? 'text/csv' : 'application/json';

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <Tabs
          items={[
            { id: 'json2csv', label: 'JSON → CSV' },
            { id: 'csv2json', label: 'CSV → JSON' },
          ]}
          value={dir}
          onChange={(v) => {
            setDir(v as Dir);
            setError(null);
            setOutput(null);
            setInput(
              (v as Dir) === 'json2csv'
                ? '[\n  { "name": "Alpha", "qty": 3, "price": 150 },\n  { "name": "Beta, the bold", "qty": 1, "price": 99.5 }\n]'
                : 'name,qty,price\nAlpha,3,150\n"Beta, the bold",1,99.5',
            );
          }}
        />

        <Textarea
          aria-label="Input"
          className="mt-4 min-h-[14rem]"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(null);
          }}
        />

        <div className="mt-4">
          <Button size="lg" onClick={convert} disabled={!input.trim()}>
            {dir === 'json2csv' ? 'Convert JSON → CSV' : 'Convert CSV → JSON'}
          </Button>
        </div>

        {error ? (
          <div className="mt-4">
            <ErrorNote>{error}</ErrorNote>
          </div>
        ) : null}
      </Card>

      {output != null ? (
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Output</h2>
            <div className="flex gap-2">
              <CopyButton text={output} label="Copy" />
              <Button variant="secondary" size="sm" onClick={() => downloadText(output, outName, outMime)}>
                ⬇ {outName}
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
