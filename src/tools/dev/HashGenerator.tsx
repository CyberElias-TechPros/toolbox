import { useState } from 'react';
import { Button, Card, ErrorNote, InfoNote } from '../../components/ui/primitives';
import { Checkbox, Field, Select, Textarea } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { downloadText } from '../../lib/utils';
import { track } from '../../lib/track';

type Algo = 'SHA-256' | 'SHA-384' | 'SHA-512';

export default function HashGenerator() {
  const [text, setText] = useState('');
  const [algo, setAlgo] = useState<Algo>('SHA-256');
  const [upper, setUpper] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function hash() {
    setBusy(true);
    setError(null);
    try {
      if (!crypto?.subtle) {
        throw new Error(
          'Your browser does not expose the WebCrypto hashing API here (it requires a secure context — https or localhost). Open this page over HTTPS.',
        );
      }
      const bytes = new TextEncoder().encode(text);
      const digest = await crypto.subtle.digest(algo, bytes);
      const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
      setResult(upper ? hex.toUpperCase() : hex);
      track('tool_completed', 'hash-generator');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Hashing failed in this browser.');
      setResult(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <Textarea
          aria-label="Text to hash"
          placeholder="Paste the text to hash…"
          className="min-h-[10rem] font-sans text-sm"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setResult(null);
          }}
        />
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <Field label="Algorithm" className="w-40">
            <Select value={algo} onChange={(e) => setAlgo(e.target.value as Algo)} aria-label="Algorithm">
              <option>SHA-256</option>
              <option>SHA-384</option>
              <option>SHA-512</option>
            </Select>
          </Field>
          <Checkbox label="UPPERCASE" checked={upper} onChange={(v) => {
            setUpper(v);
            if (result) setResult(v ? result.toUpperCase() : result.toLowerCase());
          }} className="mb-1" />
          <Button size="lg" className="ml-auto" onClick={hash} disabled={!text || busy}>
            {busy ? 'Hashing…' : `Hash with ${algo}`}
          </Button>
        </div>
        {error ? (
          <div className="mt-4">
            <ErrorNote>{error}</ErrorNote>
          </div>
        ) : null}
      </Card>

      {result ? (
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">{algo} digest</h2>
            <div className="flex gap-2">
              <CopyButton text={result} label="Copy hash" />
              <Button variant="secondary" size="sm" onClick={() => downloadText(result, `${algo.toLowerCase()}-hash.txt`)}>
                ⬇ .txt
              </Button>
            </div>
          </div>
          <p className="mt-3 break-all rounded-xl bg-zinc-950 p-4 font-mono text-[13px] leading-relaxed text-zinc-100">
            {result}
          </p>
        </Card>
      ) : null}

      <InfoNote>
        Hashes are one-way: great for checksums and verifying integrity, but a hash can never be reversed to the original text.
      </InfoNote>
    </div>
  );
}
