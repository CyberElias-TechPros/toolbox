import { useState } from 'react';
import { Button, Card } from '../../components/ui/primitives';
import { Field, Input, Select, Textarea } from '../../components/ui/fields';
import { downloadText, uid } from '../../lib/utils';
import { track } from '../../lib/track';

const THEMES: Record<string, { accent: string; soft: string }> = {
  indigo: { accent: '#4f46e5', soft: '#eef2ff' },
  emerald: { accent: '#059669', soft: '#ecfdf5' },
  amber: { accent: '#b45309', soft: '#fffbeb' },
  rose: { accent: '#be123c', soft: '#fff1f2' },
};

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default function CertificateGenerator() {
  const [title, setTitle] = useState('Certificate of Completion');
  const [subtitle, setSubtitle] = useState('This is proudly presented to');
  const [name, setName] = useState('Jane Doe');
  const [forText, setForText] = useState('for successfully completing the Web Design Fundamentals course.');
  const [org, setOrg] = useState('Cyber Elias Academy');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [sig1Name, setSig1Name] = useState('Curriculum Director');
  const [sig2Name, setSig2Name] = useState('Programme Chair');
  const [theme, setTheme] = useState<keyof typeof THEMES>('indigo');
  const [docId] = useState(() => uid());

  const t = THEMES[theme];
  const fmtDate = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const downloadHtml = () => {
    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)} — ${esc(name)}</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; margin: 0; background: #f4f4f5; }
  .sheet { width: 794px; min-height: 560px; margin: 24px auto; background: #ffffff; padding: 64px; box-sizing: border-box; border: 3px solid ${t.accent}; position: relative; }
  .inner { position: absolute; inset: 10px; border: 1px solid ${t.accent}; pointer-events: none; }
  .kicker { letter-spacing: 6px; font-size: 12px; text-transform: uppercase; color: ${t.accent}; text-align: center; font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; }
  h1 { text-align: center; font-size: 40px; margin: 18px 0 6px; color: #18181b; }
  .sub { text-align: center; font-style: italic; color: #52525b; margin: 0 0 34px; }
  .name { text-align: center; font-size: 42px; color: ${t.accent}; font-style: italic; margin: 0 0 26px; }
  .for { text-align: center; max-width: 520px; margin: 0 auto 48px; color: #3f3f46; font-size: 15px; line-height: 1.6; text-align: center; }
  .foot { display: flex; justify-content: space-between; align-items: flex-end; }
  .sig { text-align: center; font-size: 12px; color: #52525b; }
  .sig .line { width: 180px; border-top: 1px solid #18181b; margin-bottom: 6px; }
  .date { text-align: center; font-size: 12px; color: #52525b; }
  .date .line { width: 120px; border-top: 1px solid #18181b; margin: 0 auto 6px; }
  .org { text-align: center; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; color: ${t.accent}; margin-top: 36px; }
</style>
</head>
<body>
  <div class="sheet">
    <div class="inner"></div>
    <p class="kicker">${esc(org)}</p>
    <h1>${esc(title)}</h1>
    <p class="sub">${esc(subtitle)}</p>
    <p class="name">${esc(name || 'Recipient Name')}</p>
    <p class="for">${esc(forText)}</p>
    <div class="foot">
      <div class="sig"><div class="line"></div>${esc(sig1Name)}</div>
      <div class="date"><div class="line"></div>${esc(fmtDate)}</div>
      <div class="sig"><div class="line"></div>${esc(sig2Name)}</div>
    </div>
    <p class="org">${esc(org)}</p>
  </div>
</body>
</html>`;
    downloadText(html, 'certificate.html', 'text/html');
    track('download_clicked', 'certificate-generator');
  };

  return (
    <div className="space-y-4" key={docId}>
      <Card className="no-print p-5 sm:p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-4">
            <Field label="Certificate title">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Certificate title" />
            </Field>
            <Field label="Lead-in line">
              <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} aria-label="Lead-in line" />
            </Field>
            <Field label="Recipient name">
              <Input value={name} onChange={(e) => setName(e.target.value)} aria-label="Recipient name" />
            </Field>
            <Field label="Awarded for…">
              <Textarea value={forText} onChange={(e) => setForText(e.target.value)} className="min-h-[5rem]" aria-label="Awarded for" />
            </Field>
          </div>
          <div className="space-y-4">
            <Field label="Organisation">
              <Input value={org} onChange={(e) => setOrg(e.target.value)} aria-label="Organisation" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date" />
              </Field>
              <Field label="Theme">
                <Select value={theme} onChange={(e) => setTheme(e.target.value as keyof typeof THEMES)} aria-label="Theme">
                  <option value="indigo">Indigo</option>
                  <option value="emerald">Emerald</option>
                  <option value="amber">Amber</option>
                  <option value="rose">Rose</option>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Signature 1 (label)">
                <Input value={sig1Name} onChange={(e) => setSig1Name(e.target.value)} aria-label="Signature one label" />
              </Field>
              <Field label="Signature 2 (label)">
                <Input value={sig2Name} onChange={(e) => setSig2Name(e.target.value)} aria-label="Signature two label" />
              </Field>
            </div>
            <div className="flex flex-wrap gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800">
              <Button size="lg" onClick={() => window.print()}>
                🖨 Print / Save as PDF
              </Button>
              <Button variant="secondary" size="lg" onClick={downloadHtml}>
                ⬇ Download HTML
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="printable">
        <div
          className="mx-auto w-full max-w-3xl border-[3px] bg-white p-6 shadow-card sm:p-10"
          style={{ borderColor: t.accent }}
        >
          <div className="pointer-events-none absolute" style={{ display: 'none' }} aria-hidden />
          <div className="border p-6 sm:p-8" style={{ borderColor: t.accent }}>
            <p className="text-center text-xs uppercase tracking-[0.4em]" style={{ color: t.accent }}>
              {org}
            </p>
            <h1 className="mt-4 text-center font-serif text-4xl font-bold text-zinc-900">{title}</h1>
            <p className="mt-1 text-center italic text-zinc-500">{subtitle}</p>
            <p className="mt-8 text-center font-serif text-4xl italic" style={{ color: t.accent }}>
              {name || 'Recipient Name'}
            </p>
            <p className="mx-auto mt-6 max-w-md text-center text-sm leading-relaxed text-zinc-600">{forText}</p>
            <div className="mt-14 flex items-end justify-between gap-6 text-center text-xs text-zinc-500">
              <div className="w-2/5 border-t border-zinc-900 pt-1.5">{sig1Name}</div>
              <div className="w-1/5 border-t border-zinc-900 pt-1.5">{fmtDate}</div>
              <div className="w-2/5 border-t border-zinc-900 pt-1.5">{sig2Name}</div>
            </div>
            <p className="mt-10 text-center text-xs uppercase tracking-[0.3em]" style={{ color: t.accent }}>
              {org}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
