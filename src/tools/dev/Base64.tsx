import { useMemo, useState } from 'react';
import { Card, ErrorNote, InfoNote } from '../../components/ui/primitives';
import { Tabs } from '../../components/ui/Tabs';
import { Textarea } from '../../components/ui/fields';
import { CopyButton } from '../../components/ui/CopyButton';
import { downloadText } from '../../lib/utils';
import { Button } from '../../components/ui/primitives';

function encodeUtf8(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

function decodeUtf8(input: string): string {
  const clean = input.replace(/\s/g, '');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean) || clean.length % 4 !== 0) {
    throw new Error('Not a valid Base64 string. It should contain only A–Z, a–z, 0–9, “+”, “/” and optional “=” padding.');
  }
  const bin = atob(clean);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export default function Base64() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const output = useMemo(() => {
    if (!input) return '';
    if (mode === 'encode') return encodeUtf8(input);
    try {
      return decodeUtf8(input);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid Base64.');
      return null;
    }
  }, [input, mode]);

  // Reset error when switching modes
  const switchMode = (m: string) => {
    setError(null);
    setInput('');
    setMode(m as 'encode' | 'decode');
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <Tabs
          items={[
            { id: 'encode', label: 'Encode (text → Base64)' },
            { id: 'decode', label: 'Decode (Base64 → text)' },
          ]}
          value={mode}
          onChange={switchMode}
        />

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <h2 className="mb-2 text-sm font-semibold">{mode === 'encode' ? 'Plain text' : 'Base64 input'}</h2>
            <Textarea
              aria-label={mode === 'encode' ? 'Text to encode' : 'Base64 to decode'}
              placeholder={mode === 'encode' ? 'Hello, world!' : 'SGVsbG8sIHdvcmxkIQ=='}
              className="min-h-[10rem]"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
              }}
            />
          </div>
          <div>
            <h2 className="mb-2 text-sm font-semibold">Result</h2>
            <Textarea
              aria-label="Result"
              readOnly
              className="min-h-[10rem] bg-zinc-50 dark:bg-zinc-950"
              value={output ?? ''}
            />
          </div>
        </div>

        {error ? (
          <div className="mt-4">
            <ErrorNote>{error}</ErrorNote>
          </div>
        ) : null}

        {output ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <CopyButton text={output} label="Copy result" size="md" />
            <Button variant="secondary" size="md" onClick={() => downloadText(output, mode === 'encode' ? 'encoded.txt' : 'decoded.txt')}>
              ⬇ Download .txt
            </Button>
          </div>
        ) : null}
      </Card>

      <InfoNote>
        Base64 is an <strong>encoding</strong>, not encryption — anyone can decode it back. Don’t use it to hide secrets.
      </InfoNote>
    </div>
  );
}
