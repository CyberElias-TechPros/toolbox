import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Button, Card, ErrorNote, SuccessNote } from '../../components/ui/primitives';
import { Field, Input, Select } from '../../components/ui/fields';
import { Tabs } from '../../components/ui/Tabs';
import { buildQrPayload, requiredFieldsError, type QrType } from '../../lib/qr';
import { downloadBlob } from '../../lib/utils';
import { track } from '../../lib/track';

export default function QrGenerator() {
  const [type, setType] = useState<QrType>('url');
  const [url, setUrl] = useState('https://');
  const [text, setText] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEnc, setWifiEnc] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [phone, setPhone] = useState('');
  const [size, setSize] = useState(512);
  const [color, setColor] = useState('#000000');
  const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const params = { type, url, text, wifiSsid, wifiPassword, wifiEncryption: wifiEnc, wifiHidden, emailTo, emailSubject, phone };

  useEffect(() => {
    const fieldError = requiredFieldsError(params);
    if (fieldError) {
      setError(fieldError);
      setPayload('');
      return;
    }
    setError(null);
    const p = buildQrPayload(params);
    setPayload(p);
    const canvas = canvasRef.current;
    if (!canvas || !p) return;
    QRCode.toCanvas(canvas, p, { width: size, margin: 2, errorCorrectionLevel: level, color: { dark: color, light: '#ffffff' } })
      .then(() => track('tool_completed', 'qr-generator'))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not generate the QR code — the content may be too long.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, url, text, wifiSsid, wifiPassword, wifiEnc, wifiHidden, emailTo, emailSubject, phone, size, color, level]);

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, 'qr-code.png');
      track('download_clicked', 'qr-generator');
    }, 'image/png');
  };

  const downloadSvg = async () => {
    if (!payload) return;
    const svg = await QRCode.toString(payload, { type: 'svg', width: size, margin: 2, errorCorrectionLevel: level, color: { dark: color, light: '#ffffff' } });
    downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), 'qr-code.svg');
    track('download_clicked', 'qr-generator');
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-5 sm:p-6">
        <Tabs
          items={[
            { id: 'url', label: 'URL' },
            { id: 'text', label: 'Text' },
            { id: 'wifi', label: 'Wi-Fi' },
            { id: 'email', label: 'Email' },
            { id: 'phone', label: 'Phone' },
          ]}
          value={type}
          onChange={(v) => setType(v as QrType)}
          className="w-full overflow-x-auto"
        />

        <div className="mt-5 space-y-4">
          {type === 'url' ? (
            <Field label="URL">
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" aria-label="URL" />
            </Field>
          ) : null}
          {type === 'text' ? (
            <Field label="Text">
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Any short text" aria-label="Text" />
            </Field>
          ) : null}
          {type === 'phone' ? (
            <Field label="Phone number">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+2348012345678" aria-label="Phone number" />
            </Field>
          ) : null}
          {type === 'email' ? (
            <>
              <Field label="To">
                <Input type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="hello@example.com" aria-label="Email to" />
              </Field>
              <Field label="Subject (optional)">
                <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} aria-label="Email subject" />
              </Field>
            </>
          ) : null}
          {type === 'wifi' ? (
            <>
              <Field label="Network name (SSID)">
                <Input value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} aria-label="Wi-Fi SSID" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Encryption">
                  <Select value={wifiEnc} onChange={(e) => setWifiEnc(e.target.value as typeof wifiEnc)} aria-label="Encryption">
                    <option value="WPA">WPA/WPA2/WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None (open)</option>
                  </Select>
                </Field>
                <label className="flex items-end gap-2 pb-3 text-sm text-zinc-600 dark:text-zinc-300">
                  <input type="checkbox" className="h-4 w-4 rounded accent-indigo-600" checked={wifiHidden} onChange={(e) => setWifiHidden(e.target.checked)} />
                  Hidden network
                </label>
              </div>
              {wifiEnc !== 'nopass' ? (
                <Field label="Password">
                  <Input value={wifiPassword} onChange={(e) => setWifiPassword(e.target.value)} aria-label="Wi-Fi password" />
                </Field>
              ) : null}
            </>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            <Field label={`Size — ${size}px`}>
              <input type="range" min={256} max={1024} step={64} value={size} onChange={(e) => setSize(Number(e.target.value))} className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-indigo-600 dark:bg-zinc-700" aria-label="Size" />
            </Field>
            <Field label="Color">
              <div className="flex items-center gap-2">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} aria-label="QR color" className="h-11 w-14 cursor-pointer rounded-xl border border-zinc-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-950" />
                <Input value={color} onChange={(e) => setColor(e.target.value)} className="font-mono" aria-label="QR color hex" />
              </div>
            </Field>
          </div>
          <Field label="Error correction" hint="Higher survives more damage, but makes denser codes">
            <Select value={level} onChange={(e) => setLevel(e.target.value as typeof level)} aria-label="Error correction" className="w-40">
              <option value="L">L — low</option>
              <option value="M">M — medium</option>
              <option value="Q">Q — quartile</option>
              <option value="H">H — high</option>
            </Select>
          </Field>

          {error ? <ErrorNote>{error}</ErrorNote> : null}
        </div>
      </Card>

      <Card className="flex flex-col items-center p-5 sm:p-6">
        <h2 className="self-start text-sm font-semibold">Your QR code</h2>
        <div className="mt-4 w-full max-w-[320px] rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700">
          <canvas ref={canvasRef} className="block h-auto w-full" aria-label="Generated QR code" />
        </div>
        {payload ? (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button onClick={downloadPng}>⬇ PNG ({size}px)</Button>
            <Button variant="secondary" onClick={downloadSvg}>
              ⬇ SVG
            </Button>
          </div>
        ) : (
          <SuccessNote className="mt-5">Fill in the details on the left and your code appears here instantly.</SuccessNote>
        )}
        <p className="mt-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
          Static QR — never expires. The content is encoded locally and never sent anywhere.
        </p>
      </Card>
    </div>
  );
}
