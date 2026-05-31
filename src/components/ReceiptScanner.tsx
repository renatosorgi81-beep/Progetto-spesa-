import React, { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { X, Upload, Loader2, CheckCircle2, Circle, Pencil } from 'lucide-react';
import type { Product, ProductCategory, ProductLocation } from '../types';

// ── Types ────────────────────────────────────────────────────────────────────

interface ParsedItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  selected: boolean;
  emoji: string;
  category: ProductCategory;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function guessEmoji(n: string): string {
  const map: [string[], string][] = [
    [['latte', 'panna', 'crema di'], '🥛'],
    [['formaggio', 'grana', 'parmigian', 'pecorino', 'mozzarella', 'brie', 'cheddar', 'asiago'], '🧀'],
    [['uova', 'uovo'], '🥚'],
    [['pollo', 'tacchino', 'petto di'], '🍗'],
    [['carne', 'bistecca', 'manzo', 'maiale', 'vitello', 'hamburger', 'arrosto', 'filetto'], '🥩'],
    [['pesce', 'salmone', 'merluzzo', 'branzino', 'orata', 'trota'], '🐟'],
    [['tonno'], '🐟'],
    [['gamber', 'polpo', 'vongole', 'cozze'], '🦐'],
    [['pomodoro', 'passata', 'pelat'], '🍅'],
    [['broccoli', 'cavolfiore', 'spinaci', 'insalata', 'rucola', 'lattuga', 'zucchina', 'melanzana', 'peperone', 'verdura', 'finocchio', 'sedano'], '🥦'],
    [['carota'], '🥕'],
    [['patata'], '🥔'],
    [['cipolla'], '🧅'],
    [['aglio'], '🧄'],
    [['fungo', 'champignon'], '🍄'],
    [['limone', 'lime'], '🍋'],
    [['mela', 'mele'], '🍎'],
    [['banana'], '🍌'],
    [['fragola'], '🍓'],
    [['uva'], '🍇'],
    [['arancia', 'arance'], '🍊'],
    [['pesca', 'pesche'], '🍑'],
    [['ananas'], '🍍'],
    [['pasta', 'spaghetti', 'penne', 'rigatoni', 'fusilli', 'farfalle', 'linguine', 'tagliatelle'], '🍝'],
    [['riso', 'risotto'], '🍚'],
    [['pane', 'panino', 'focaccia', 'ciabatta', 'baguette', 'grissini'], '🍞'],
    [['burro'], '🧈'],
    [['yogurt', 'yoghurt'], '🫙'],
    [['olio', 'oliva'], '🫒'],
    [['aceto', 'sale', 'pepe', 'origano', 'basilico', 'rosmarino', 'spezie'], '🧂'],
    [['acqua'], '💧'],
    [['birra'], '🍺'],
    [['vino'], '🍷'],
    [['succo', 'aranciata', 'limonata', 'chinotto'], '🧃'],
    [['caffè', 'caffe', 'espresso', 'cialde', 'capsule'], '☕'],
    [['cioccolato', 'cacao', 'nutella'], '🍫'],
    [['biscotti', 'biscotto', 'wafer'], '🍪'],
    [['gelato'], '🍨'],
    [['torta', 'crostata', 'pandoro', 'panettone'], '🎂'],
    [['prosciutto', 'salame', 'mortadella', 'bresaola', 'speck', 'pancetta'], '🥓'],
    [['surgelat', 'congelat'], '🧊'],
    [['ketchup', 'maionese', 'salsa', 'senape'], '🫙'],
    [['detersivo', 'sapone', 'shampoo', 'dentifricio', 'bagnoschiuma'], '🧴'],
    [['carta', 'scottex', 'fazzoletti', 'tovaglioli'], '🧻'],
  ];
  for (const [kws, emoji] of map) {
    if (kws.some(k => n.includes(k))) return emoji;
  }
  return '🛒';
}

function guessCategory(n: string): ProductCategory {
  const map: [string[], ProductCategory][] = [
    [['latte', 'formaggio', 'mozzarella', 'parmigian', 'pecorino', 'yogurt', 'panna', 'burro', 'ricotta', 'grana', 'brie'], 'latticini'],
    [['pollo', 'manzo', 'maiale', 'vitello', 'carne', 'bistecca', 'hamburger', 'tacchino', 'arrosto', 'filetto'], 'carne'],
    [['pesce', 'tonno', 'salmone', 'merluzzo', 'branzino', 'gamber', 'polpo', 'vongole', 'orata'], 'pesce'],
    [['insalata', 'spinaci', 'carota', 'zucchina', 'melanzana', 'broccoli', 'peperone', 'pomodoro', 'lattuga', 'rucola', 'sedano', 'patata', 'cipolla', 'aglio', 'finocchio', 'fungo', 'verdura'], 'verdura'],
    [['mela', 'pera', 'banana', 'arancia', 'limone', 'fragola', 'uva', 'pesca', 'frutta', 'ananas', 'kiwi', 'mango'], 'frutta'],
    [['pane', 'panino', 'focaccia', 'grissini', 'ciabatta', 'baguette', 'fette biscottate'], 'pane'],
    [['pasta', 'spaghetti', 'penne', 'rigatoni', 'fusilli', 'tagliatelle', 'riso', 'risotto', 'cous'], 'pasta_riso'],
    [['conserva', 'passata', 'pelat', 'fagioli', 'ceci', 'mais', 'tonno', 'legumi', 'lenticchie'], 'conserve'],
    [['acqua', 'birra', 'vino', 'succo', 'aranciata', 'limonata', 'bevand', 'chinotto', 'the', 'tè'], 'bevande'],
    [['cioccolato', 'biscotti', 'torta', 'gelato', 'dolce', 'crostata', 'nutella', 'marmellata', 'pandoro', 'panettone'], 'dolci'],
    [['surgelat', 'congelat', 'frozen'], 'surgelati'],
    [['prosciutto', 'salame', 'mortadella', 'bresaola', 'speck', 'salumi', 'pancetta'], 'salumi'],
    [['olio', 'aceto', 'sale', 'pepe', 'spezie', 'ketchup', 'maionese', 'salsa', 'senape', 'origano', 'caffè', 'caffe', 'zucchero', 'farina', 'brodo', 'dado'], 'condimenti'],
  ];
  for (const [kws, cat] of map) {
    if (kws.some(k => n.includes(k))) return cat;
  }
  return 'conserve';
}

function parseReceipt(text: string): ParsedItem[] {
  const SKIP = [
    'totale', 'tot.', 'subtotal', 'sub total', 'iva', 'sconto', 'resto',
    'pagamento', 'contante', 'carta', 'cassa', 'scontrino', 'fiscale',
    'grazie', 'arriveder', 'data:', 'ora:', 'tel:', 'cod.', 'p.iva',
    'codice fiscale', 'partita iva', 'operatore', 'punti', 'fidelity',
    'cashback', 'cambio', 'documento', 'spesa totale', 'risparmio',
  ];

  // Italian price: ends with N,NN or N.NN optionally followed by A/B/C/D VAT code
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

    // Clean name
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
      price,
      selected: true,
      emoji: guessEmoji(key),
      category: guessCategory(key),
    });

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
    setStatusText('Caricamento modello OCR...');

    try {
      const worker = await createWorker('ita+eng', undefined, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
            setStatusText('Riconoscimento testo...');
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUrl(URL.createObjectURL(file));
    runOCR(file);
  }

  function openPicker(useCamera: boolean) {
    if (!fileRef.current) return;
    if (useCamera) {
      fileRef.current.setAttribute('capture', 'environment');
    } else {
      fileRef.current.removeAttribute('capture');
    }
    fileRef.current.click();
  }

  function toggle(id: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, selected: !i.selected } : i));
  }

  function update(id: string, patch: Partial<ParsedItem>) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
  }

  function confirm() {
    const today = new Date().toISOString().split('T')[0];
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    const expiryDate = expiry.toISOString().split('T')[0];

    const products: Product[] = items
      .filter(i => i.selected && i.name.trim().length > 0)
      .map((i, idx) => ({
        id: `scan-${Date.now()}-${idx}`,
        name: i.name,
        brand: '',
        category: i.category,
        imageEmoji: i.emoji,
        location,
        purchasedQty: i.qty,
        remainingQty: i.qty,
        unit: 'pz',
        format: '',
        purchaseDate: today,
        expiryDate,
        lot: '',
        notes: `Da scontrino · €${i.price.toFixed(2)}`,
        price: i.price,
        status: 'ok' as const,
      }));

    onAddProducts(products);
    onClose();
  }

  const selectedCount = items.filter(i => i.selected).length;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 h-14 border-b border-slate-100 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center"
        >
          <X size={20} className="text-slate-600" />
        </button>
        <h2 className="font-bold text-slate-800 flex-1">Scansiona Scontrino</h2>
        <span className="text-sm bg-emerald-100 text-emerald-700 font-semibold px-2 py-1 rounded-lg">
          OCR
        </span>
      </header>

      <div className="flex-1 overflow-y-auto">

        {/* Pick step */}
        {step === 'pick' && (
          <div className="px-4 py-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="text-7xl">📄</div>
              <h3 className="text-xl font-bold text-slate-800">Carica lo scontrino</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Carica una foto dello scontrino: il sistema riconosce automaticamente prodotti, quantità e prezzi.
              </p>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="space-y-3">
              <button
                onClick={() => openPicker(false)}
                className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-3 text-base"
              >
                <Upload size={22} /> Carica da galleria
              </button>
              <button
                onClick={() => openPicker(true)}
                className="w-full py-4 border-2 border-emerald-300 text-emerald-700 font-bold rounded-2xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-3 text-base"
              >
                📷 Scatta foto
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
              <p className="text-blue-700 text-sm font-semibold">💡 Per risultati migliori:</p>
              <ul className="text-blue-600 text-xs space-y-1">
                <li>• Buona illuminazione, evita ombre sul testo</li>
                <li>• Tieni lo scontrino ben disteso e piatto</li>
                <li>• Tutta la lista prodotti deve essere visibile</li>
                <li>• I prodotti saranno aggiunti con scadenza di 7 giorni</li>
              </ul>
            </div>
          </div>
        )}

        {/* Analyzing step */}
        {step === 'analyzing' && (
          <div className="px-4 py-8 space-y-6">
            {imageUrl && (
              <div className="w-full max-h-52 overflow-hidden rounded-2xl border border-slate-200">
                <img src={imageUrl} alt="Scontrino" className="w-full object-contain" />
              </div>
            )}
            <div className="text-center space-y-4">
              <Loader2 size={44} className="text-emerald-500 animate-spin mx-auto" />
              <div>
                <p className="font-bold text-slate-800 text-lg">Analisi in corso…</p>
                <p className="text-sm text-slate-500 mt-1">{statusText}</p>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-lg font-bold text-emerald-600">{progress}%</p>
              <p className="text-xs text-slate-400">
                Il modello OCR viene scaricato solo al primo utilizzo (~4 MB)
              </p>
            </div>
          </div>
        )}

        {/* Review step */}
        {step === 'review' && (
          <div className="px-4 py-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="text-6xl">😕</div>
                <p className="font-bold text-slate-700 text-lg">Nessun prodotto riconosciuto</p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Prova con una foto più nitida, con migliore illuminazione o assicurati che lo scontrino sia ben disteso.
                </p>
                <button
                  onClick={() => setStep('pick')}
                  className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-colors"
                >
                  Riprova
                </button>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <p className="text-emerald-700 font-semibold text-sm">
                    ✅ {items.length} prodotti riconosciuti dallo scontrino
                  </p>
                  <p className="text-emerald-600 text-xs mt-1">
                    Seleziona quelli da aggiungere · Scadenza automatica: +7 giorni da oggi
                  </p>
                </div>

                {/* Location selector */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Dove conservare
                  </p>
                  <div className="flex gap-2">
                    {(['dispensa', 'frigo', 'freezer'] as ProductLocation[]).map(loc => (
                      <button
                        key={loc}
                        onClick={() => setLocation(loc)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                          location === loc
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {loc === 'dispensa' ? '🗄️ Dispensa' : loc === 'frigo' ? '🧊 Frigo' : '❄️ Freezer'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Item list */}
                <div className="space-y-2">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl border shadow-sm p-3 transition-all ${
                        item.selected ? 'border-slate-200' : 'border-slate-100 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
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
                              className="w-full text-sm font-semibold border border-emerald-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-200"
                              value={item.name}
                              onChange={e => update(item.id, { name: e.target.value })}
                              onBlur={() => setEditingId(null)}
                              onKeyDown={e => e.key === 'Enter' && setEditingId(null)}
                            />
                          ) : (
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {item.name}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                            <span>x{item.qty}</span>
                            <span>·</span>
                            <span>€{item.price.toFixed(2)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                          className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors flex-shrink-0"
                        >
                          <Pencil size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => { setStep('pick'); setItems([]); }}
                  className="w-full py-2.5 border border-slate-200 text-slate-500 text-sm font-semibold rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  ← Scansiona un altro scontrino
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      {step === 'review' && items.length > 0 && (
        <div className="px-4 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
          <button
            onClick={confirm}
            disabled={selectedCount === 0}
            className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 transition-all text-base"
          >
            Aggiungi {selectedCount} prodott{selectedCount === 1 ? 'o' : 'i'} alla dispensa
          </button>
        </div>
      )}
    </div>
  );
}
