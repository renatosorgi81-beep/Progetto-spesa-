import React, { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { X, Upload, Loader2, CheckCircle2, Circle, Pencil } from 'lucide-react';
import type { Product, ProductLocation } from '../types';
import { guessEmoji, computeStatus, defaultExpiry } from '../utils';

// ── Receipt parser ────────────────────────────────────────────────────────────

interface ParsedItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  selected: boolean;
  emoji: string;
}

function parseReceipt(text: string): ParsedItem[] {
  const SKIP = [
    'totale', 'tot.', 'subtotal', 'sub total', 'iva', 'sconto', 'resto',
    'pagamento', 'contante', 'carta', 'cassa', 'scontrino', 'fiscale',
    'grazie', 'arriveder', 'data:', 'ora:', 'tel:', 'p.iva',
    'codice fiscale', 'partita iva', 'operatore', 'punti', 'fidelity',
    'cashback', 'cambio', 'spesa totale', 'risparmio',
  ];

  const priceRe = /\s(\d{1,4}[.,]\d{2})\s*[ABCD]?\s*$/;
  const qtyRe = /^(\d+)\s*[Xx\*]\s+/;
  const items: ParsedItem[] = [];
  const seen = new Set<string>();

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (line.length < 4) continue;
    const lower = line.toLowerCase();
    if (SKIP.some(k => lower.includes(k))) continue;
    if (/^[\-\=\*\.\_\s]+$/.test(line)) continue;

    const pm = line.match(priceRe);
    if (!pm) continue;

    const price = parseFloat(pm[1].replace(',', '.'));
    if (!price || price <= 0 || price > 300) continue;

    let name = line.slice(0, line.lastIndexOf(pm[0])).trim();
    let qty = 1;

    const qm = name.match(qtyRe);
    if (qm) {
      qty = Math.min(parseInt(qm[1]), 99);
      name = name.slice(qm[0].length).trim();
    }

    name = name.replace(/\s+/g, ' ').replace(/[^\w\s\-àáâãèéêëìíîïòóôùúûüçñÀÁÂÃÈÉÊËÌÍÎÏÒÓÔÙÚÛÜÇÑ]/g, '').trim();
    if (name.length < 3 || /^\d+$/.test(name)) continue;

    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const formatted = name.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    items.push({ id: String(items.length), name: formatted, qty, price, selected: true, emoji: guessEmoji(key) });
    if (items.length >= 30) break;
  }

  return items;
}

// ── Component ────────────────────────────────────────────────────────────────

interface ReceiptScannerProps {
  onAddProducts: (products: Product[]) => void;
  onClose: () => void;
}

type Step = 'pick' | 'analyzing' | 'review';

export function ReceiptScanner({ onAddProducts, onClose }: ReceiptScannerProps) {
  const [step, setStep] = useState<Step>('pick');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [location, setLocation] = useState<ProductLocation>('dispensa');
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function runOCR(file: File) {
    setStep('analyzing');
    setProgress(0);
    setStatusText('Caricamento OCR...');
    try {
      const worker = await createWorker('ita+eng', undefined, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
            setStatusText('Lettura testo...');
          } else if (m.status.includes('load')) {
            setStatusText('Caricamento modello...');
          }
        },
      } as Parameters<typeof createWorker>[2]);
      const { data } = await worker.recognize(file);
      await worker.terminate();
      setItems(parseReceipt(data.text));
      setStep('review');
    } catch {
      setItems([]);
      setStep('review');
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUrl(URL.createObjectURL(file));
    runOCR(file);
  }

  function openPicker(camera: boolean) {
    if (!fileRef.current) return;
    camera ? fileRef.current.setAttribute('capture', 'environment') : fileRef.current.removeAttribute('capture');
    fileRef.current.click();
  }

  function toggle(id: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, selected: !i.selected } : i));
  }

  function updateName(id: string, name: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, name, emoji: guessEmoji(name.toLowerCase()) } : i));
  }

  function confirm() {
    const expiryDate = defaultExpiry(7);
    const today = new Date().toISOString();
    const products: Product[] = items
      .filter(i => i.selected && i.name.trim())
      .map((i, idx) => ({
        id: `scan-${Date.now()}-${idx}`,
        name: i.name,
        emoji: i.emoji,
        location,
        expiryDate,
        qty: i.qty,
        unit: 'pz',
        price: i.price,
        addedAt: today,
        status: computeStatus(expiryDate),
      }));
    onAddProducts(products);
    onClose();
  }

  const selectedCount = items.filter(i => i.selected).length;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 h-14 border-b border-slate-100 flex-shrink-0">
        <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
          <X size={20} className="text-slate-600" />
        </button>
        <h2 className="font-bold text-slate-800 flex-1 text-lg">Scansiona Scontrino</h2>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Pick */}
        {step === 'pick' && (
          <div className="px-5 py-10 space-y-6 text-center">
            <div className="text-7xl">📄</div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Carica lo scontrino</h3>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                Fotografa o carica lo scontrino: estraggo automaticamente prodotti, quantità e prezzi
              </p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <div className="space-y-3 text-left">
              <button
                onClick={() => openPicker(false)}
                className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 text-base"
              >
                <Upload size={20} /> Carica da galleria
              </button>
              <button
                onClick={() => openPicker(true)}
                className="w-full py-4 border-2 border-emerald-300 text-emerald-700 font-bold rounded-2xl flex items-center justify-center gap-3 text-base"
              >
                📷 Scatta foto
              </button>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-600">Consigli per un buon risultato:</p>
              <p>• Buona luce, scontrino piatto e ben visibile</p>
              <p>• Al primo uso scarica ~4 MB di modello OCR</p>
              <p>• Prodotti aggiunti con scadenza di 7 giorni</p>
            </div>
          </div>
        )}

        {/* Analyzing */}
        {step === 'analyzing' && (
          <div className="px-5 py-8 space-y-6 text-center">
            {imageUrl && (
              <div className="w-full max-h-52 overflow-hidden rounded-2xl border border-slate-200">
                <img src={imageUrl} alt="" className="w-full object-contain" />
              </div>
            )}
            <Loader2 size={44} className="text-emerald-500 animate-spin mx-auto" />
            <div>
              <p className="font-bold text-slate-800 text-lg">Analisi in corso…</p>
              <p className="text-sm text-slate-400 mt-1">{statusText}</p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xl font-bold text-emerald-600">{progress}%</p>
          </div>
        )}

        {/* Review */}
        {step === 'review' && (
          <div className="px-4 py-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="text-6xl">😕</div>
                <p className="font-bold text-slate-700 text-lg">Nessun prodotto riconosciuto</p>
                <p className="text-sm text-slate-400">Prova con una foto più nitida o migliore illuminazione</p>
                <button onClick={() => setStep('pick')} className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-2xl">
                  Riprova
                </button>
              </div>
            ) : (
              <>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <p className="text-emerald-700 font-semibold text-sm">✅ {items.length} prodotti riconosciuti</p>
                  <p className="text-emerald-600 text-xs mt-0.5">Scadenza automatica: oggi + 7 giorni</p>
                </div>

                {/* Location */}
                <div className="flex gap-2">
                  {(['dispensa', 'frigo', 'freezer'] as ProductLocation[]).map(loc => (
                    <button
                      key={loc}
                      onClick={() => setLocation(loc)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        location === loc ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {loc === 'dispensa' ? '🗄️ Dispensa' : loc === 'frigo' ? '🧊 Frigo' : '❄️ Freezer'}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className={`bg-white rounded-2xl border shadow-sm p-3 flex items-center gap-3 transition-all ${item.selected ? 'border-slate-200' : 'border-slate-100 opacity-50'}`}>
                      <button onClick={() => toggle(item.id)} className="flex-shrink-0">
                        {item.selected ? <CheckCircle2 size={22} className="text-emerald-500" /> : <Circle size={22} className="text-slate-300" />}
                      </button>
                      <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        {editingId === item.id ? (
                          <input
                            autoFocus
                            className="w-full text-sm font-semibold border-b border-emerald-400 outline-none bg-transparent"
                            value={item.name}
                            onChange={e => updateName(item.id, e.target.value)}
                            onBlur={() => setEditingId(null)}
                            onKeyDown={e => e.key === 'Enter' && setEditingId(null)}
                          />
                        ) : (
                          <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                        )}
                        <p className="text-xs text-slate-400">x{item.qty} · €{item.price.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                        className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-colors flex-shrink-0"
                      >
                        <Pencil size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={() => { setStep('pick'); setItems([]); }} className="w-full py-3 border border-slate-200 text-slate-500 text-sm font-semibold rounded-2xl">
                  ← Scansiona un altro scontrino
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {step === 'review' && items.length > 0 && (
        <div className="px-4 py-4 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={confirm}
            disabled={selectedCount === 0}
            className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl text-base disabled:bg-slate-200 disabled:text-slate-400 transition-all"
          >
            Aggiungi {selectedCount} prodott{selectedCount === 1 ? 'o' : 'i'} alla dispensa
          </button>
        </div>
      )}
    </div>
  );
}
