import React, { useState, useRef } from 'react';
import { X, Upload, Loader2, CheckCircle2, Circle, Pencil } from 'lucide-react';
import type { Product, ProductLocation } from '../types';
import { guessEmoji, computeStatus, defaultExpiry } from '../utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface ParsedItem {
  id: string;
  name: string;
  qty: number;
  price: number;     // prezzo cadauno
  unit: string;      // 'pz' | 'kg' | ecc.
  selected: boolean;
  emoji: string;
  editName: string;
  editPrice: string;
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

function isAddressLine(line: string): boolean {
  if (/^\d{5}[\s\-]/.test(line)) return true;
  const lower = line.toLowerCase();
  return ['strada statale', 'via ', 'viale ', 'piazza ', 'corso ', 'largo ',
    'vicolo', 'autostrada', ' km ', 'km.', 's.s.', 'localita', 'loc.'].some(w => lower.includes(w));
}

function parseReceipt(text: string): ParsedItem[] {
  // Skip only lines that START with these (IVA 22% and totals are NOT product lines)
  const SKIP_START = [
    'totale', 'subtotal', 'sub total', 'iva', 'sconto', 'resto', 'valore',
    'pagamento', 'contante', 'grazie', 'arriveder',
    'di cui', 'operatore', 'data:', 'ora:', 'tel:', 'tel.:', 'telefono',
    'importo', 'nr. ', 'num.',
  ];
  // Skip lines CONTAINING these exact phrases anywhere
  const SKIP_CONTAINS = [
    'p.iva', 'codice fiscale', 'partita iva', 'scontrino fiscale',
    'fidelity', 'cashback', 'spesa totale', 'risparmio', 'esercizio',
  ];

  // Matches the price at end of line in both Italian receipt layouts:
  //   Layout A (IVA after price):  "PASTA  1,79 22%"  or  "PASTA  1,79 A"
  //   Layout B (IVA before price): "PASTA  22%  3,57"  — IVA% consumed in optional prefix
  // The optional prefix (?:iva\s+)?\d{1,2}\s*%\s+ strips "22%  " or "IVA 22%  " before price.
  const priceRe = /(?:(?:iva\s+)?\d{1,2}\s*%\s+)?(\d{1,4}[.,]\d{2})\s*(?:[A-D]|\d{1,2}\s*%|iva\s*\d{0,2}\s*%?)?\s*$/i;

  // Qty prefix on same product line: "2 X PASTA 3,58"
  const qtyPrefixRe = /^(\d+)\s*[Xx\*]\s+/;

  // CAD detail line immediately below a product, e.g.:
  //   "CAD 1,79 pz. 3"     → unit price 1,79, qty 3, unit pz
  //   "CAD 17,50/kg pz. 1" → unit price 17,50, unit kg
  const cadIdentRe = /\bcad\b/i;
  const cadPriceRe = /(\d{1,4}[.,]\d{2})/;
  // "Pz. 3", "Pz.3", "Pz 3", "Pz3" — number always follows Pz on this receipt format
  const cadQtyRe = /pz\.?\s*(\d+)/i;
  const cadKgRe = /\/kg\b/i;

  const lines = text.split('\n').map(l => l.trim());
  const items: ParsedItem[] = [];
  const seen = new Set<string>();

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    i++;

    if (line.length < 3) continue;
    const lower = line.toLowerCase();
    if (SKIP_START.some(k => lower.startsWith(k))) continue;
    if (SKIP_CONTAINS.some(k => lower.includes(k))) continue;
    if (isAddressLine(line)) continue;
    if (/^[\-\=\*\.\_\s]+$/.test(line)) continue;
    // CAD detail lines start with "CAD"; skip any not consumed by lookahead
    if (/^\s*cad\b/i.test(line)) continue;

    const pm = line.match(priceRe);
    if (!pm || pm.index === undefined) continue;

    // Skip discount/coupon lines (negative prices like "-0,89")
    if (line.slice(0, pm.index).trimEnd().endsWith('-')) continue;

    // Price on the product line = unit price (not total)
    let unitPrice = parseFloat(pm[1].replace(',', '.'));
    if (!unitPrice || unitPrice <= 0 || unitPrice > 300) continue;

    // Name = everything before the price match
    let name = line.slice(0, pm.index).trim();
    let qty = 1;
    let unit = 'pz';

    // "2 X PASTA 3,58" → qty=2, line price IS the total → divide
    const qm = name.match(qtyPrefixRe);
    if (qm) {
      qty = Math.min(parseInt(qm[1]), 99);
      name = name.slice(qm[0].length).trim();
      unitPrice = Math.round((unitPrice / qty) * 100) / 100;
    }

    // Look ahead for a CAD detail line
    let j = i;
    while (j < lines.length && lines[j].trim().length === 0) j++;
    if (j < lines.length && cadIdentRe.test(lines[j])) {
      const next = lines[j].trim();
      const priceM = next.match(cadPriceRe);
      const qtyM = next.match(cadQtyRe);
      if (priceM) {
        unitPrice = parseFloat(priceM[1].replace(',', '.'));
        unit = cadKgRe.test(next) ? 'kg' : 'pz';
      }
      if (qtyM) {
        qty = Math.min(parseInt(qtyM[1]) || 1, 99);
      }
      i = j + 1; // consume the CAD line
    }

    name = name
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-àáâãèéêëìíîïòóôùúûüçñÀÁÂÃÈÉÊËÌÍÎÏÒÓÔÙÚÛÜÇÑ]/g, '')
      .trim();
    if (name.length < 3 || /^\d+$/.test(name)) continue;

    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const formatted = name.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    items.push({
      id: String(items.length),
      name: formatted,
      qty,
      price: unitPrice,
      unit,
      selected: true,
      emoji: guessEmoji(key),
      editName: formatted,
      editPrice: unitPrice.toFixed(2),
    });
    if (items.length >= 200) break;
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

  function startEdit(id: string) {
    setEditingId(id);
  }

  function setEditField(id: string, field: 'editName' | 'editPrice', value: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  }

  function commitEdit(id: string) {
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      const price = parseFloat(i.editPrice.replace(',', '.'));
      const name = i.editName.trim() || i.name;
      return {
        ...i,
        name,
        price: isNaN(price) || price <= 0 ? i.price : Math.round(price * 100) / 100,
        emoji: guessEmoji(name.toLowerCase()),
      };
    }));
    setEditingId(null);
  }

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
    if (editingId === id) return; // don't toggle while editing
    setItems(prev => prev.map(i => i.id === id ? { ...i, selected: !i.selected } : i));
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
        unit: i.unit,
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
                  {items.map(item => {
                    const isEditing = editingId === item.id;
                    const total = (item.price * item.qty).toFixed(2);
                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-2xl border shadow-sm transition-all ${
                          item.selected ? 'border-slate-200' : 'border-slate-100 opacity-50'
                        }`}
                      >
                        {/* Main row */}
                        <div className="p-3 flex items-center gap-3">
                          <button onClick={() => toggle(item.id)} className="flex-shrink-0">
                            {item.selected
                              ? <CheckCircle2 size={22} className="text-emerald-500" />
                              : <Circle size={22} className="text-slate-300" />}
                          </button>
                          <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                            <p className="text-xs text-slate-400">
                              {item.qty} {item.unit} · €{item.price.toFixed(2)}/{item.unit}
                              {item.qty > 1 && <span className="ml-1 text-slate-300">· tot €{total}</span>}
                            </p>
                          </div>
                          <button
                            onClick={() => isEditing ? commitEdit(item.id) : startEdit(item.id)}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
                              isEditing ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400 hover:text-emerald-500'
                            }`}
                          >
                            {isEditing ? <CheckCircle2 size={14} /> : <Pencil size={13} />}
                          </button>
                        </div>

                        {/* Inline edit panel */}
                        {isEditing && (
                          <div className="px-3 pb-3 pt-0 space-y-2 border-t border-slate-100">
                            <div>
                              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Descrizione</label>
                              <input
                                autoFocus
                                className="mt-0.5 w-full text-sm font-semibold border border-emerald-300 rounded-xl px-3 py-2 outline-none focus:border-emerald-500 bg-white"
                                value={item.editName}
                                onChange={e => setEditField(item.id, 'editName', e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && commitEdit(item.id)}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Prezzo cadauno (€)</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="mt-0.5 w-full text-sm border border-emerald-300 rounded-xl px-3 py-2 outline-none focus:border-emerald-500 bg-white"
                                value={item.editPrice}
                                onChange={e => setEditField(item.id, 'editPrice', e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && commitEdit(item.id)}
                              />
                            </div>
                            <button
                              onClick={() => commitEdit(item.id)}
                              className="w-full py-2 bg-emerald-500 text-white text-sm font-bold rounded-xl"
                            >
                              Salva
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
