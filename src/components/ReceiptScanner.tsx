import React, { useState, useRef } from 'react';
import { X, Upload, Loader2, CheckCircle2, Circle, Pencil } from 'lucide-react';
import type { Product, ProductLocation } from '../types';
import { guessEmoji, computeStatus, defaultExpiry } from '../utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface ParsedItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  selected: boolean;
  emoji: string;
}

type FileKind = 'image' | 'pdf' | 'excel' | 'word' | 'text' | 'unsupported';

// ── File kind detection ───────────────────────────────────────────────────────

function detectKind(file: File): FileKind {
  const mime = file.type.toLowerCase();
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'bmp', 'webp', 'gif', 'tiff', 'tif', 'heic', 'heif'].includes(ext)) return 'image';
  if (mime === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (['xls', 'xlsx', 'xlsm', 'csv', 'ods'].includes(ext) || mime.includes('spreadsheet') || mime.includes('excel') || mime === 'text/csv') return 'excel';
  if (['doc', 'docx', 'odt'].includes(ext) || mime.includes('word') || mime.includes('document')) return 'word';
  if (mime.startsWith('text/') || ext === 'txt') return 'text';
  return 'unsupported';
}

// ── Receipt parser ────────────────────────────────────────────────────────────

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

// ── Text extractors ───────────────────────────────────────────────────────────

async function extractFromImage(
  file: File,
  onProgress: (pct: number) => void,
  onStatus: (s: string) => void,
): Promise<string> {
  const { createWorker } = await import('tesseract.js');
  onStatus('Caricamento modello OCR...');
  const worker = await createWorker('ita+eng', undefined, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text') {
        onProgress(Math.round(m.progress * 100));
        onStatus('Lettura testo...');
      } else if (m.status.includes('load')) {
        onStatus('Caricamento modello...');
      }
    },
  } as Parameters<typeof createWorker>[2]);
  const { data } = await worker.recognize(file);
  await worker.terminate();
  return data.text;
}

async function extractFromPDF(
  file: File,
  onProgress: (pct: number) => void,
  onStatus: (s: string) => void,
): Promise<string> {
  onStatus('Lettura PDF...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfjsLib = await import('pdfjs-dist');
  // Set worker source for pdfjs
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url,
  ).toString();

  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const totalPages = pdf.numPages;
  let fullText = '';

  for (let i = 1; i <= totalPages; i++) {
    onStatus(`Pagina ${i}/${totalPages}...`);
    onProgress(Math.round((i / totalPages) * 80));
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    fullText += pageText + '\n';
  }

  // If no text was extracted, it's a scanned PDF — try OCR on first page canvas
  if (fullText.trim().length < 20) {
    onStatus('PDF scansionato, uso OCR...');
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), 'image/png'));
    const imgFile = new File([blob], 'page.png', { type: 'image/png' });
    fullText = await extractFromImage(imgFile, onProgress, onStatus);
  }

  onProgress(100);
  return fullText;
}

async function extractFromExcel(
  file: File,
  onStatus: (s: string) => void,
): Promise<string> {
  onStatus('Lettura foglio Excel...');
  const arrayBuffer = await file.arrayBuffer();
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const lines: string[] = [];
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    lines.push(csv);
  }
  return lines.join('\n');
}

async function extractFromWord(
  file: File,
  onStatus: (s: string) => void,
): Promise<string> {
  onStatus('Lettura documento Word...');
  const arrayBuffer = await file.arrayBuffer();
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function extractFromText(file: File, onStatus: (s: string) => void): Promise<string> {
  onStatus('Lettura testo...');
  return file.text();
}

// ── Component ────────────────────────────────────────────────────────────────

interface ReceiptScannerProps {
  onAddProducts: (products: Product[]) => void;
  onClose: () => void;
}

type Step = 'pick' | 'analyzing' | 'review';

const KIND_LABELS: Record<FileKind, string> = {
  image: 'Immagine',
  pdf: 'PDF',
  excel: 'Excel/CSV',
  word: 'Word',
  text: 'Testo',
  unsupported: 'Non supportato',
};

export function ReceiptScanner({ onAddProducts, onClose }: ReceiptScannerProps) {
  const [step, setStep] = useState<Step>('pick');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [fileKind, setFileKind] = useState<FileKind>('image');
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [location, setLocation] = useState<ProductLocation>('dispensa');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function processFile(file: File) {
    const kind = detectKind(file);
    setFileKind(kind);

    if (kind === 'unsupported') {
      setErrorMsg(`Formato non supportato: ${file.name.split('.').pop()?.toUpperCase() ?? 'sconosciuto'}`);
      setStep('review');
      setItems([]);
      return;
    }

    setStep('analyzing');
    setProgress(0);
    setStatusText('Preparazione...');
    if (kind === 'image') {
      setImageUrl(URL.createObjectURL(file));
    } else {
      setImageUrl(null);
    }

    try {
      let text = '';
      if (kind === 'image') {
        text = await extractFromImage(file, setProgress, setStatusText);
      } else if (kind === 'pdf') {
        text = await extractFromPDF(file, setProgress, setStatusText);
      } else if (kind === 'excel') {
        text = await extractFromExcel(file, setStatusText);
        setProgress(100);
      } else if (kind === 'word') {
        text = await extractFromWord(file, setStatusText);
        setProgress(100);
      } else if (kind === 'text') {
        text = await extractFromText(file, setStatusText);
        setProgress(100);
      }
      setItems(parseReceipt(text));
      setErrorMsg('');
      setStep('review');
    } catch (err) {
      console.error(err);
      setItems([]);
      setErrorMsg('Errore durante la lettura del file. Riprova.');
      setStep('review');
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    processFile(file);
  }

  function openPicker(camera: boolean) {
    if (!fileRef.current) return;
    if (camera) {
      fileRef.current.setAttribute('capture', 'environment');
    } else {
      fileRef.current.removeAttribute('capture');
    }
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
        <h2 className="font-bold text-slate-800 flex-1 text-lg">Importa Scontrino</h2>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Pick */}
        {step === 'pick' && (
          <div className="px-5 py-10 space-y-6 text-center">
            <div className="text-7xl">📄</div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Carica lo scontrino</h3>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                Supporta immagini, PDF, Excel, Word, CSV e file di testo
              </p>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf,.xls,.xlsx,.xlsm,.csv,.ods,.doc,.docx,.odt,.txt"
              className="hidden"
              onChange={handleFile}
            />

            <div className="space-y-3 text-left">
              <button
                onClick={() => openPicker(false)}
                className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 text-base"
              >
                <Upload size={20} /> Carica file
              </button>
              <button
                onClick={() => openPicker(true)}
                className="w-full py-4 border-2 border-emerald-300 text-emerald-700 font-bold rounded-2xl flex items-center justify-center gap-3 text-base"
              >
                📷 Scatta foto scontrino
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-600">Formati supportati:</p>
              <p>📷 Immagini: JPG, PNG, BMP, WebP, GIF, HEIC</p>
              <p>📄 Documenti: PDF, Word (DOC/DOCX)</p>
              <p>📊 Fogli: Excel (XLS/XLSX), CSV, ODS</p>
              <p>📝 Testo: TXT</p>
              <p className="mt-2 text-slate-400">• Al primo uso OCR scarica ~4 MB di modello</p>
              <p className="text-slate-400">• Scadenza automatica: oggi + 7 giorni</p>
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
            {!imageUrl && (
              <div className="w-full h-32 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                <span className="text-4xl">
                  {fileKind === 'pdf' ? '📄' : fileKind === 'excel' ? '📊' : fileKind === 'word' ? '📝' : '📄'}
                </span>
              </div>
            )}
            <Loader2 size={44} className="text-emerald-500 animate-spin mx-auto" />
            <div>
              <p className="font-bold text-slate-800 text-lg">
                Analisi {KIND_LABELS[fileKind]}…
              </p>
              <p className="text-sm text-slate-400 mt-1">{statusText}</p>
            </div>
            {fileKind === 'image' || fileKind === 'pdf' ? (
              <>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xl font-bold text-emerald-600">{progress}%</p>
              </>
            ) : null}
          </div>
        )}

        {/* Review */}
        {step === 'review' && (
          <div className="px-4 py-5 space-y-4">
            {errorMsg ? (
              <div className="text-center py-12 space-y-4">
                <div className="text-6xl">⚠️</div>
                <p className="font-bold text-slate-700 text-lg">{errorMsg}</p>
                <button onClick={() => { setStep('pick'); setErrorMsg(''); }} className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-2xl">
                  Riprova
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="text-6xl">😕</div>
                <p className="font-bold text-slate-700 text-lg">Nessun prodotto riconosciuto</p>
                <p className="text-sm text-slate-400">Prova con una foto più nitida o un file diverso</p>
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
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl border shadow-sm p-3 flex items-center gap-3 transition-all ${
                        item.selected ? 'border-slate-200' : 'border-slate-100 opacity-50'
                      }`}
                    >
                      <button onClick={() => toggle(item.id)} className="flex-shrink-0">
                        {item.selected
                          ? <CheckCircle2 size={22} className="text-emerald-500" />
                          : <Circle size={22} className="text-slate-300" />}
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

                <button
                  onClick={() => { setStep('pick'); setItems([]); setImageUrl(null); }}
                  className="w-full py-3 border border-slate-200 text-slate-500 text-sm font-semibold rounded-2xl"
                >
                  ← Importa un altro file
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {step === 'review' && items.length > 0 && !errorMsg && (
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
