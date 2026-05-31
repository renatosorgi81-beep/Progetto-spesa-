import { useState } from 'react';
import { Receipt, PenLine } from 'lucide-react';
import type { Product, ProductLocation } from '../types';
import { daysUntilExpiry } from '../utils';

const LOC_LABEL: Record<ProductLocation, string> = {
  frigo: '🧊 Frigo',
  dispensa: '🗄️ Dispensa',
  freezer: '❄️ Freezer',
};

function ExpiryChip({ product }: { product: Product }) {
  const days = daysUntilExpiry(product.expiryDate);
  if (product.status === 'scaduto') {
    return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-600">Scaduto</span>;
  }
  if (product.status === 'in_scadenza') {
    return (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">
        {days === 0 ? 'Oggi' : `${days}g`}
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
      {days > 30 ? 'OK' : `${days}g`}
    </span>
  );
}

interface DispensaProps {
  products: Product[];
  onProductClick: (p: Product) => void;
  onOpenScanner: () => void;
  onOpenAddForm: () => void;
}

type LocFilter = 'tutti' | ProductLocation;

export function Dispensa({ products, onProductClick, onOpenScanner, onOpenAddForm }: DispensaProps) {
  const [locFilter, setLocFilter] = useState<LocFilter>('tutti');
  const [showFab, setShowFab] = useState(false);

  const filtered = locFilter === 'tutti'
    ? products
    : products.filter(p => p.location === locFilter);

  const sorted = [...filtered].sort((a, b) => {
    const da = daysUntilExpiry(a.expiryDate);
    const db = daysUntilExpiry(b.expiryDate);
    return da - db;
  });

  const expiringSoon = products.filter(p => p.status === 'scaduto' || p.status === 'in_scadenza').length;

  // Empty state
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 gap-5 text-center">
        <div className="text-8xl">🗄️</div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dispensa vuota</h2>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Aggiungi i prodotti scansionando lo scontrino o inserendoli a mano
          </p>
        </div>
        <button
          onClick={onOpenScanner}
          className="w-full max-w-xs py-4 bg-emerald-500 text-white font-bold rounded-2xl text-base flex items-center justify-center gap-3 hover:bg-emerald-600 active:scale-95 transition-all shadow-lg shadow-emerald-200"
        >
          <Receipt size={22} /> Scansiona scontrino
        </button>
        <button
          onClick={onOpenAddForm}
          className="flex items-center gap-2 text-sm text-slate-400 underline underline-offset-4"
        >
          <PenLine size={14} /> Aggiungi a mano
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      {/* Alert banner */}
      {expiringSoon > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p className="text-amber-700 text-sm font-semibold">
            {expiringSoon} prodott{expiringSoon > 1 ? 'i' : 'o'} in scadenza
          </p>
        </div>
      )}

      {/* Location filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {(['tutti', 'frigo', 'dispensa', 'freezer'] as const).map(loc => (
          <button
            key={loc}
            onClick={() => setLocFilter(loc)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              locFilter === loc
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-500'
            }`}
          >
            {loc === 'tutti' ? `Tutti (${products.length})` : `${LOC_LABEL[loc]} (${products.filter(p => p.location === loc).length})`}
          </button>
        ))}
      </div>

      {/* Products list */}
      {sorted.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <p className="text-4xl mb-2">🔍</p>
          <p className="text-sm">Nessun prodotto in questa sezione</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(p => (
            <button
              key={p.id}
              onClick={() => onProductClick(p)}
              className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 hover:border-emerald-200 hover:shadow-md active:scale-[0.98] transition-all text-left"
            >
              <span className="text-4xl flex-shrink-0">{p.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{p.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {p.qty} {p.unit} · {LOC_LABEL[p.location]}
                </p>
              </div>
              <ExpiryChip product={p} />
            </button>
          ))}
        </div>
      )}

      {/* FAB */}
      <div className="fixed bottom-20 right-4 z-30">
        {showFab && (
          <div className="mb-3 flex flex-col items-end gap-2">
            <button
              onClick={() => { setShowFab(false); onOpenScanner(); }}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold text-sm px-4 py-3 rounded-2xl shadow-lg"
            >
              <Receipt size={16} className="text-emerald-500" /> Scansiona scontrino
            </button>
            <button
              onClick={() => { setShowFab(false); onOpenAddForm(); }}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold text-sm px-4 py-3 rounded-2xl shadow-lg"
            >
              <PenLine size={16} className="text-emerald-500" /> Aggiungi a mano
            </button>
          </div>
        )}
        <button
          onClick={() => setShowFab(v => !v)}
          className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl transition-all ${
            showFab ? 'bg-slate-700 text-white rotate-45' : 'bg-emerald-500 text-white'
          }`}
        >
          +
        </button>
      </div>

      {/* FAB backdrop */}
      {showFab && (
        <div className="fixed inset-0 z-20" onClick={() => setShowFab(false)} />
      )}
    </div>
  );
}
