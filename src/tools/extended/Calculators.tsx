import { useState } from 'react';
import { Download, RotateCcw } from 'lucide-react';
import type { ExtraSpec } from '../../registry/extra';
import { CALCULATOR_FIELDS, calculate } from '../../lib/calculators';
import { Card, Button, ErrorNote, InfoNote } from '../../components/ui/primitives';
import { Field, Input } from '../../components/ui/fields';
import { downloadText } from '../../lib/utils';
export default function Calculators({ spec }: { spec: ExtraSpec }) {
  const fields = CALCULATOR_FIELDS[spec.slug],
    initial = Object.fromEntries(fields.map((f) => [f.key, f.value]));
  const [values, setValues] = useState(initial);
  let results: Record<string, string | number> = {},
    error = '';
  try {
    results = calculate(spec.slug, values);
  } catch (e) {
    error = (e as Error).message;
  }
  return (
    <Card className="tool-workspace">
      <div className="eyebrow muted mb-5">A LITTLE CLARITY, IN NUMBERS</div>
      {spec.note && <InfoNote className="mb-5">{spec.note}</InfoNote>}
      <div className="grid sm:grid-cols-2 gap-5">
        {fields.map((f) => (
          <Field key={f.key} label={f.label}>
            <Input
              type={f.type || 'number'}
              step="any"
              aria-label={f.label}
              value={values[f.key]}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            />
          </Field>
        ))}
      </div>
      <div className="mt-6" aria-live="polite">
        {error ? (
          <ErrorNote>{error}</ErrorNote>
        ) : (
          <div className="result-grid">
            {Object.entries(results).map(([key, value]) => (
              <div className="result-stat" key={key}>
                <span>{key}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="workbench-toolbar">
        <Button
          disabled={!!error}
          onClick={() =>
            downloadText(
              `${spec.name}\n\n${fields.map((f) => `${f.label}: ${values[f.key]}`).join('\n')}\n\n${Object.entries(
                results,
              )
                .map(([k, v]) => `${k}: ${v}`)
                .join('\n')}\n\n${spec.note || ''}`,
              `${spec.slug}.txt`,
            )
          }
        >
          <Download size={14} />
          Download results
        </Button>
        <Button variant="ghost" onClick={() => setValues(initial)}>
          <RotateCcw size={14} />
          Reset example
        </Button>
      </div>
      <p className="text-xs text-zinc-500">
        Results update as you type. Monetary values use your chosen currency, without conversion.
      </p>
    </Card>
  );
}
