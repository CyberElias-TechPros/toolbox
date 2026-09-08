import { useMemo, useState } from 'react';
import { Button, Card } from '../../components/ui/primitives';
import { Field, Input, Textarea } from '../../components/ui/fields';
import { downloadText, uid } from '../../lib/utils';
import { track } from '../../lib/track';

type Kind = 'invoice' | 'receipt' | 'quote' | 'po' | 'delivery';
type Currency = 'NGN' | 'USD' | 'EUR' | 'GBP';
const CURRENCY_SYMBOL: Record<Currency, string> = { NGN: '₦', USD: '$', EUR: '€', GBP: '£' };

interface Item {
  id: string;
  desc: string;
  qty: string;
  price: string;
}

interface DocState {
  bizName: string;
  bizAddress: string;
  bizContact: string;
  custName: string;
  custAddress: string;
  number: string;
  date: string;
  due: string;
  currency: Currency;
  items: Item[];
  discountPct: string;
  taxPct: string;
  notes: string;
}

const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

function money(n: number, currency: Currency): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 2,
  }).format(n);
}

/** Shared engine for the Invoice and Receipt generators. */
export function DocumentTool({ kind }: { kind: Kind }) {
  const [s, setS] = useState<DocState>(() => ({
    bizName: 'My Business',
    bizAddress: '123 Example Street\nLagos, Nigeria',
    bizContact: 'hello@mybusiness.com · +234 800 000 0000',
    custName: 'Customer Name',
    custAddress: '',
    number:
      kind === 'invoice' ? 'INV-001' : kind === 'quote' ? 'QTN-001' : kind === 'po' ? 'PO-001' : kind === 'delivery' ? 'DN-001' : 'RCP-001',
    date: today(),
    due: plusDays(14),
    currency: 'NGN',
    items: [{ id: uid(), desc: '', qty: '1', price: '' }],
    discountPct: '0',
    taxPct: '0',
    notes:
      kind === 'invoice'
        ? 'Payment due within 14 days. Thank you for your business!'
        : kind === 'quote'
          ? 'This quotation is valid for 14 days. Thank you for your consideration!'
          : kind === 'po'
            ? 'Please confirm this order. Goods will be dispatched after confirmation.'
            : kind === 'delivery'
              ? 'Please inspect the items and sign below upon receipt.'
              : 'Payment received. Thank you!',
  }));

  const set = <K extends keyof DocState>(k: K, v: DocState[K]) => setS((prev) => ({ ...prev, [k]: v }));

  const totals = useMemo(() => {
    let subtotal = 0;
    for (const it of s.items) {
      const q = parseFloat(it.qty) || 0;
      const p = parseFloat(it.price) || 0;
      subtotal += q * p;
    }
    const discountPct = parseFloat(s.discountPct) || 0;
    const discount = (subtotal * discountPct) / 100;
    const taxPct = parseFloat(s.taxPct) || 0;
    const tax = ((subtotal - discount) * taxPct) / 100;
    const total = subtotal - discount + tax;
    return { subtotal, discount, tax, total };
  }, [s.items, s.discountPct, s.taxPct]);

  const docTitle =
    kind === 'invoice'
      ? 'INVOICE'
      : kind === 'quote'
        ? 'QUOTATION'
        : kind === 'po'
          ? 'PURCHASE ORDER'
          : kind === 'delivery'
            ? 'DELIVERY NOTE'
            : 'RECEIPT';
  const dateLabel = kind === 'invoice' ? 'Invoice date' : kind === 'po' ? 'PO date' : 'Date';
  const dueLabel = kind === 'quote' ? 'Valid until' : kind === 'po' ? 'Delivery by' : 'Due';
  const showDue = kind !== 'receipt' && kind !== 'delivery';
  const showPaid = kind === 'receipt';
  const showPrices = kind !== 'delivery';
  const fmtDate = (iso: string) => {
    const d = new Date(`${iso}T12:00:00`);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const downloadHtml = () => {
    const rows = s.items
      .filter((it) => it.desc.trim() || (showPrices && parseFloat(it.price)))
      .map(
        (it) =>
          `      <tr><td>${escapeHtml(it.desc || '—')}</td><td class="r">${escapeHtml(it.qty || '1')}</td>${showPrices ? `<td class="r">${money((parseFloat(it.qty) || 0) * (parseFloat(it.price) || 0), s.currency)}</td>` : ''}</tr>`,
      )
      .join('\n');
    const signatures =
      kind === 'delivery'
        ? `  <div style="display:flex; justify-content:space-between; gap:32px; margin-top:72px;">
    <div style="width:45%; border-top:1px solid #18181b; padding-top:6px; font-size:12px; color:#71717a;">Dispatched by — name &amp; signature</div>
    <div style="width:45%; border-top:1px solid #18181b; padding-top:6px; font-size:12px; color:#71717a;">Received by — name &amp; signature</div>
  </div>`
        : '';
    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(docTitle)} ${escapeHtml(s.number)}</title>
<style>
  body { font-family: -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; color: #18181b; margin: 40px auto; max-width: 720px; padding: 0 16px; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #4f46e5; padding-bottom: 16px; }
  h1 { font-size: 28px; letter-spacing: 4px; color: #4f46e5; margin: 0; }
  .muted { color: #71717a; font-size: 13px; white-space: pre-line; }
  table { width: 100%; border-collapse: collapse; margin-top: 24px; }
  th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #71717a; border-bottom: 1px solid #e4e4e7; padding: 8px; }
  td { padding: 10px 8px; border-bottom: 1px solid #f4f4f5; font-size: 14px; }
  .r { text-align: right; }
  .totals { margin-top: 16px; margin-left: auto; width: 260px; font-size: 14px; }
  .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
  .grand { font-size: 18px; font-weight: 700; border-top: 2px solid #18181b; margin-top: 6px; padding-top: 8px; }
  .paid { color: #059669; font-weight: 700; letter-spacing: 2px; }
  .notes { margin-top: 28px; font-size: 13px; color: #52525b; white-space: pre-line; }
</style>
</head>
<body>
  <div class="head">
    <div>
      <h1>${docTitle}</h1>
      <p class="muted" style="margin-top:10px">${escapeHtml(s.bizName)}${s.bizAddress ? `<br/>${escapeHtml(s.bizAddress).replace(/\n/g, '<br/>')}` : ''}${s.bizContact ? `<br/>${escapeHtml(s.bizContact)}` : ''}</p>
    </div>
    <div style="text-align:right">
      <p class="muted"><strong>${escapeHtml(s.number)}</strong><br/>${dateLabel}: ${fmtDate(s.date)}${showDue ? `<br/>${dueLabel}: ${fmtDate(s.due)}` : ''}</p>
      <p class="muted" style="margin-top:12px">Bill to<br/><strong>${escapeHtml(s.custName)}</strong>${s.custAddress ? `<br/>${escapeHtml(s.custAddress).replace(/\n/g, '<br/>')}` : ''}</p>
    </div>
  </div>
  ${showPaid ? '<p class="paid" style="margin-top:16px">✓ PAID</p>' : ''}
  <table>
    <thead><tr><th>Description</th><th class="r">Qty</th>${showPrices ? '<th class="r">Amount</th>' : ''}</tr></thead>
    <tbody>
${rows}
    </tbody>
  </table>
  ${
    showPrices
      ? `<div class="totals">
    <div><span>Subtotal</span><span>${money(totals.subtotal, s.currency)}</span></div>
    ${totals.discount > 0 ? `<div><span>Discount (${s.discountPct}%)</span><span>−${money(totals.discount, s.currency)}</span></div>` : ''}
    ${totals.tax > 0 ? `<div><span>Tax (${s.taxPct}%)</span><span>${money(totals.tax, s.currency)}</span></div>` : ''}
    <div class="grand"><span>Total</span><span>${money(totals.total, s.currency)}</span></div>
  </div>`
      : ''
  }
  ${signatures}
  <p class="notes">${escapeHtml(s.notes)}</p>
</body>
</html>`;
    downloadText(html, `${kind}-${s.number.replace(/\s+/g, '-').toLowerCase()}.html`, 'text/html');
    track('download_clicked', kind);
  };

  const items = s.items.filter((it) => it.desc.trim() || parseFloat(it.price));

  return (
    <div className="space-y-4">
      {/* Form */}
      <Card className="no-print p-5 sm:p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold">Your business</h2>
            <Field label="Business name">
              <Input value={s.bizName} onChange={(e) => set('bizName', e.target.value)} aria-label="Business name" />
            </Field>
            <Field label="Address">
              <Textarea value={s.bizAddress} onChange={(e) => set('bizAddress', e.target.value)} className="min-h-[4.5rem]" aria-label="Business address" />
            </Field>
            <Field label="Email / phone">
              <Input value={s.bizContact} onChange={(e) => set('bizContact', e.target.value)} aria-label="Business contact" />
            </Field>
            <h2 className="pt-2 text-sm font-semibold">Customer</h2>
            <Field label="Customer name">
              <Input value={s.custName} onChange={(e) => set('custName', e.target.value)} aria-label="Customer name" />
            </Field>
            <Field label="Customer address (optional)">
              <Textarea value={s.custAddress} onChange={(e) => set('custAddress', e.target.value)} className="min-h-[4.5rem]" aria-label="Customer address" />
            </Field>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold">Document details</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Number">
                <Input value={s.number} onChange={(e) => set('number', e.target.value)} aria-label="Document number" />
              </Field>
              <Field label={dateLabel}>
                <Input type="date" value={s.date} onChange={(e) => set('date', e.target.value)} aria-label="Date" />
              </Field>
            </div>
            {showDue ? (
              <Field label={dueLabel}>
                <Input type="date" value={s.due} onChange={(e) => set('due', e.target.value)} aria-label={dueLabel} />
              </Field>
            ) : null}
            {showPrices ? (
            <div className="grid grid-cols-3 gap-4">
              <Field label="Currency">
                <select
                  value={s.currency}
                  onChange={(e) => set('currency', e.target.value as Currency)}
                  aria-label="Currency"
                  className="w-full cursor-pointer rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="NGN">₦ NGN</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                  <option value="GBP">£ GBP</option>
                </select>
              </Field>
              <Field label="Discount %">
                <Input type="number" min={0} max={100} step="any" value={s.discountPct} onChange={(e) => set('discountPct', e.target.value)} aria-label="Discount percent" />
              </Field>
              <Field label="Tax %">
                <Input type="number" min={0} max={100} step="any" value={s.taxPct} onChange={(e) => set('taxPct', e.target.value)} aria-label="Tax percent" />
              </Field>
            </div>
            ) : null}

            <h2 className="pt-2 text-sm font-semibold">Line items</h2>
            {s.items.map((it) => (
              <div key={it.id} className="flex gap-2">
                <Input
                  value={it.desc}
                  onChange={(e) =>
                    set(
                      'items',
                      s.items.map((x) => (x.id === it.id ? { ...x, desc: e.target.value } : x)),
                    )
                  }
                  placeholder="Description"
                  aria-label="Item description"
                  className="flex-1"
                />
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={it.qty}
                  onChange={(e) =>
                    set(
                      'items',
                      s.items.map((x) => (x.id === it.id ? { ...x, qty: e.target.value } : x)),
                    )
                  }
                  aria-label="Quantity"
                  className="w-16"
                />
                {showPrices ? (
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={it.price}
                    onChange={(e) =>
                      set(
                        'items',
                        s.items.map((x) => (x.id === it.id ? { ...x, price: e.target.value } : x)),
                      )
                    }
                    aria-label="Unit price"
                    className="w-24"
                  />
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  aria-label="Remove item"
                  disabled={s.items.length === 1}
                  onClick={() =>
                    set(
                      'items',
                      s.items.length === 1 ? s.items : s.items.filter((x) => x.id !== it.id),
                    )
                  }
                >
                  ✕
                </Button>
              </div>
            ))}
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                set('items', [...s.items, { id: uid(), desc: '', qty: '1', price: '' }])
              }
            >
              + Add item
            </Button>

            <Field label="Notes / footer">
              <Textarea value={s.notes} onChange={(e) => set('notes', e.target.value)} className="min-h-[3.5rem]" aria-label="Notes" />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <Button size="lg" onClick={() => window.print()}>
            🖨 Print / Save as PDF
          </Button>
          <Button variant="secondary" size="lg" onClick={downloadHtml}>
            ⬇ Download HTML
          </Button>
        </div>
      </Card>

      {/* Live preview (this is what prints) */}
      <div className="printable">
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-8 text-zinc-900 shadow-card sm:p-10 dark:border-zinc-700">
          <div className="flex flex-wrap items-start justify-between gap-6 border-b-4 border-indigo-600 pb-5">
            <div>
              <h1 className="text-3xl font-extrabold tracking-[0.25em] text-indigo-600">{docTitle}</h1>
              <div className="mt-3 text-sm leading-relaxed text-zinc-500">
                <p className="font-semibold text-zinc-900">{s.bizName || 'Your business'}</p>
                <p className="whitespace-pre-line">{s.bizAddress}</p>
                {s.bizContact ? <p>{s.bizContact}</p> : null}
              </div>
            </div>
            <div className="text-right text-sm leading-relaxed text-zinc-500">
              <p className="text-base font-bold text-zinc-900">{s.number}</p>
              <p>
                {dateLabel}: <strong className="text-zinc-900">{fmtDate(s.date)}</strong>
              </p>
              {showDue ? (
                <p>
                  {dueLabel}: <strong className="text-zinc-900">{fmtDate(s.due)}</strong>
                </p>
              ) : showPaid ? (
                <p className="mt-2 font-bold tracking-[0.2em] text-emerald-600">✓ PAID</p>
              ) : null}
              <p className="mt-3">
                <span className="text-xs uppercase tracking-wide">Bill to</span>
                <br />
                <strong className="text-zinc-900">{s.custName || 'Customer'}</strong>
              </p>
              {s.custAddress ? <p className="whitespace-pre-line">{s.custAddress}</p> : null}
            </div>
          </div>

          <table className="mt-7 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-300 text-left text-[11px] uppercase tracking-wider text-zinc-400">
                <th className="px-2 py-2">Description</th>
                <th className="w-16 px-2 py-2 text-right">Qty</th>
                {showPrices ? <th className="w-28 px-2 py-2 text-right">Amount</th> : null}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={showPrices ? 3 : 2} className="px-2 py-6 text-center text-zinc-400">
                    Add line items to see them here.
                  </td>
                </tr>
              ) : (
                items.map((it) => (
                  <tr key={it.id} className="border-b border-zinc-100">
                    <td className="px-2 py-2.5">{it.desc || '—'}</td>
                    <td className="px-2 py-2.5 text-right tabular-nums">{it.qty || '1'}</td>
                    {showPrices ? (
                      <td className="px-2 py-2.5 text-right tabular-nums">
                        {money((parseFloat(it.qty) || 0) * (parseFloat(it.price) || 0), s.currency)}
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {showPrices ? (
          <div className="ml-auto mt-4 w-full max-w-[16rem] text-sm">
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">Subtotal</span>
              <span className="tabular-nums">{money(totals.subtotal, s.currency)}</span>
            </div>
            {totals.discount > 0 ? (
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Discount ({s.discountPct}%)</span>
                <span className="tabular-nums">−{money(totals.discount, s.currency)}</span>
              </div>
            ) : null}
            {totals.tax > 0 ? (
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Tax ({s.taxPct}%)</span>
                <span className="tabular-nums">{money(totals.tax, s.currency)}</span>
              </div>
            ) : null}
            <div className="mt-1 flex justify-between border-t-2 border-zinc-900 pt-2 text-base font-bold">
              <span>Total</span>
              <span className="tabular-nums">{money(totals.total, s.currency)}</span>
            </div>
            <p className="mt-2 text-right text-xs text-zinc-400">{CURRENCY_SYMBOL[s.currency]} {s.currency}</p>
          </div>
          ) : null}

          {kind === 'delivery' ? (
            <div className="mt-16 flex justify-between gap-8">
              <div className="w-1/2 border-t border-zinc-900 pt-1.5 text-xs text-zinc-500">Dispatched by — name &amp; signature</div>
              <div className="w-1/2 border-t border-zinc-900 pt-1.5 text-xs text-zinc-500">Received by — name &amp; signature</div>
            </div>
          ) : null}

          {s.notes ? <p className="mt-8 whitespace-pre-line text-xs leading-relaxed text-zinc-500">{s.notes}</p> : null}
        </div>
      </div>
    </div>
  );
}

export function InvoiceDoc() {
  return <DocumentTool kind="invoice" />;
}

export function ReceiptDoc() {
  return <DocumentTool kind="receipt" />;
}

export function QuoteDoc() {
  return <DocumentTool kind="quote" />;
}

export function PurchaseOrderDoc() {
  return <DocumentTool kind="po" />;
}

export function DeliveryNoteDoc() {
  return <DocumentTool kind="delivery" />;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
