import { useState } from 'react';
import { Download, Sparkles } from 'lucide-react';
import type { ExtraSpec } from '../../registry/extra';
import { Card, Button, ErrorNote, InfoNote } from '../../components/ui/primitives';
import { Field, Select, Textarea } from '../../components/ui/fields';
import { FileDrop, type DropFile } from '../../components/ui/FileDrop';
import {
  parseCsv,
  createWorkbook,
  jsonToRows,
  readWorkbook,
  rowsToCsv,
  rowsToObjects,
  type SheetData,
} from '../../lib/spreadsheets';
import { downloadBlob, downloadText, uint8ToBlob, baseName } from '../../lib/utils';
import { validateFiles } from '../../lib/documents';
export default function Spreadsheets({ spec }: { spec: ExtraSpec }) {
  const inputText = spec.slug === 'csv-to-excel' || spec.slug === 'json-to-excel';
  const [text, setText] = useState(''),
    [files, setFiles] = useState<DropFile[]>([]),
    [sheets, setSheets] = useState<SheetData[]>([]),
    [selected, setSelected] = useState(0),
    [result, setResult] = useState<Blob | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const clear = () => {
    setSheets([]);
    setResult(null);
    setError('');
    setSelected(0);
  };
  const run = async () => {
    setBusy(true);
    clear();
    try {
      if (inputText) {
        const rows = spec.slug === 'json-to-excel' ? jsonToRows(text) : parseCsv(text);
        if (!rows.length) throw Error('Add some data first.');
        const data = await createWorkbook(rows);
        setResult(uint8ToBlob(data, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'));
        setSheets([{ name: 'Data', rows }]);
      } else {
        validateFiles(
          files.map((f) => f.file),
          20,
        );
        const data = await readWorkbook(await files[0].file.arrayBuffer());
        if (!data.length) throw Error('This workbook has no worksheets.');
        setSheets(data);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const current = sheets[selected];
  return (
    <Card className="tool-workspace">
      <InfoNote className="mb-5">
        {spec.note ||
          'XLSX workbooks only; legacy XLS files are not supported. Formulas display stored values, not recalculated results. CSV exports neutralize formula-like text for safety.'}
      </InfoNote>
      <fieldset disabled={busy}>
        {inputText ? (
          <>
            <div className="flex justify-end mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clear();
                  setText(
                    spec.slug === 'json-to-excel'
                      ? '[{"Name":"Alex","Team":"Design","Hours":24},{"Name":"Sam","Team":"Development","Hours":32}]'
                      : 'Name,Team,Hours\nAlex,Design,24\nSam,Development,32',
                  );
                }}
              >
                <Sparkles size={14} />
                Try an example
              </Button>
            </div>
            <Field label={spec.slug === 'json-to-excel' ? 'JSON array of objects' : 'CSV content'}>
              <Textarea
                aria-label="Spreadsheet input"
                rows={10}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  clear();
                }}
                placeholder="Paste your data here…"
              />
            </Field>
            {spec.slug === 'csv-to-excel' && (
              <div className="mt-3">
                <label className="text-xs text-zinc-500">
                  Or choose a CSV file
                  <input
                    aria-label="Choose CSV file"
                    type="file"
                    accept=".csv"
                    className="block mt-2 text-xs"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        clear();
                        if (f.size > 20 * 1024 * 1024) {
                          setError('Use a CSV below 20 MB.');
                          return;
                        }
                        setText(await f.text());
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            )}
          </>
        ) : (
          <FileDrop
            accept={['xlsx']}
            files={files}
            multiple={false}
            onFiles={(f) => {
              setFiles(f);
              clear();
            }}
            onRemove={() => {
              setFiles([]);
              clear();
            }}
            hint="XLSX · Up to 20 MB · Nothing is uploaded"
          />
        )}
      </fieldset>
      <div className="workbench-toolbar">
        <Button disabled={busy || (inputText ? !text.trim() : !files.length)} onClick={run}>
          {busy ? 'Reading your data…' : inputText ? 'Create Excel workbook' : 'Open workbook'}
        </Button>
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
      {current && (
        <div className="result-panel">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <Field label="Worksheet">
              <Select aria-label="Worksheet" value={selected} onChange={(e) => setSelected(+e.target.value)}>
                {sheets.map((sheet, i) => (
                  <option key={i} value={i}>
                    {sheet.name} ({sheet.rows.length} rows)
                  </option>
                ))}
              </Select>
            </Field>
            <Button
              onClick={() => {
                const stem = baseName(files[0]?.file.name || 'spreadsheet');
                if (result) downloadBlob(result, `${stem}.xlsx`);
                else if (spec.slug === 'excel-to-json')
                  downloadText(
                    JSON.stringify(rowsToObjects(current.rows), null, 2),
                    `${stem}-${current.name}.json`,
                    'application/json',
                  );
                else downloadText(rowsToCsv(current.rows), `${stem}-${current.name}.csv`, 'text/csv');
              }}
            >
              <Download size={14} />
              Download {result ? 'XLSX' : spec.slug === 'excel-to-json' ? 'JSON' : 'CSV'}
            </Button>
          </div>
          <p className="text-xs text-zinc-500 my-4">
            Preview · First {Math.min(100, current.rows.length)} of {current.rows.length} rows. Downloads
            contain all rows.
          </p>
          <div className="overflow-auto max-h-96">
            <table className="w-full text-xs text-left">
              <tbody>
                {current.rows.slice(0, 100).map((row, i) => (
                  <tr key={i} className={i === 0 ? 'font-semibold bg-zinc-200 dark:bg-zinc-800' : ''}>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className="border border-zinc-200 dark:border-zinc-700 p-2 whitespace-pre-wrap min-w-24 max-w-96"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}
