import type { Product } from '../types';
import { daysUntilExpiry } from '../utils';

interface ScadenzeProps {
  products: Product[];
  onProductClick: (p: Product) => void;
}

function ProductRow({ product, onClick }: { product: Product; onClick: () => void }) {
  const days = daysUntilExpiry(product.expiryDate);

  let chipClass = 'bg-emerald-100 text-emerald-700';
  let chipText = days > 30 ? 'OK' : `${days}g`;
  if (product.status === 'scaduto') { chipClass = 'bg-red-100 text-red-600'; chipText = 'Scaduto'; }
  else if (product.status === 'in_scadenza') { chipClass = 'bg-amber-100 text-amber-700'; chipText = days === 0 ? 'Oggi!' : `${days}g`; }

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 active:scale-[0.98] transition-all text-left"
    >
      <span className="text-4xl flex-shrink-0">{product.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 truncate">{product.name}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {product.qty} {product.unit} ·{' '}
          {product.location === 'frigo' ? '🧊 Frigo' : product.location === 'dispensa' ? '🗄️ Dispensa' : '❄️ Freezer'}
        </p>
      </div>
      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0 ${chipClass}`}>
        {chipText}
      </span>
    </button>
  );
}

function Section({ title, color, items, onProductClick }: {
  title: string;
  color: string;
  items: Product[];
  onProductClick: (p: Product) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${color}`}>
        {title} · {items.length}
      </p>
      <div className="space-y-2">
        {items.map(p => (
          <ProductRow key={p.id} product={p} onClick={() => onProductClick(p)} />
        ))}
      </div>
    </div>
  );
}

export function Scadenze({ products, onProductClick }: ScadenzeProps) {
  const scaduti = products.filter(p => p.status === 'scaduto')
    .sort((a, b) => daysUntilExpiry(a.expiryDate) - daysUntilExpiry(b.expiryDate));

  const oggi = products.filter(p => p.status !== 'scaduto' && daysUntilExpiry(p.expiryDate) === 0);

  const entro3 = products.filter(p => {
    const d = daysUntilExpiry(p.expiryDate);
    return d >= 1 && d <= 3;
  }).sort((a, b) => daysUntilExpiry(a.expiryDate) - daysUntilExpiry(b.expiryDate));

  const entro7 = products.filter(p => {
    const d = daysUntilExpiry(p.expiryDate);
    return d >= 4 && d <= 7;
  }).sort((a, b) => daysUntilExpiry(a.expiryDate) - daysUntilExpiry(b.expiryDate));

  const ok = products.filter(p => daysUntilExpiry(p.expiryDate) > 7)
    .sort((a, b) => daysUntilExpiry(a.expiryDate) - daysUntilExpiry(b.expiryDate));

  const totalUrgent = scaduti.length + oggi.length + entro3.length;

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center px-6">
        <div className="text-7xl">📅</div>
        <p className="text-xl font-bold text-slate-700">Nessun prodotto</p>
        <p className="text-sm text-slate-400">Aggiungi prodotti dalla Dispensa</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-6 space-y-6">
      {/* Summary pills */}
      <div className="flex gap-2">
        <div className="flex-1 bg-red-50 rounded-2xl py-3 text-center">
          <p className="text-2xl font-bold text-red-600">{scaduti.length + oggi.length}</p>
          <p className="text-[10px] text-red-400 font-semibold mt-0.5">SCADUTI</p>
        </div>
        <div className="flex-1 bg-amber-50 rounded-2xl py-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{entro3.length}</p>
          <p className="text-[10px] text-amber-400 font-semibold mt-0.5">ENTRO 3G</p>
        </div>
        <div className="flex-1 bg-yellow-50 rounded-2xl py-3 text-center">
          <p className="text-2xl font-bold text-yellow-600">{entro7.length}</p>
          <p className="text-[10px] text-yellow-400 font-semibold mt-0.5">ENTRO 7G</p>
        </div>
        <div className="flex-1 bg-emerald-50 rounded-2xl py-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{ok.length}</p>
          <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">IN ORDINE</p>
        </div>
      </div>

      {totalUrgent === 0 && scaduti.length === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
          <p className="text-2xl mb-1">🎉</p>
          <p className="text-emerald-700 font-semibold text-sm">Tutto in ordine!</p>
          <p className="text-emerald-500 text-xs mt-0.5">Nessun prodotto in scadenza critica</p>
        </div>
      )}

      <Section title="Scaduti" color="text-red-500" items={scaduti} onProductClick={onProductClick} />
      <Section title="Scadono oggi" color="text-red-400" items={oggi} onProductClick={onProductClick} />
      <Section title="Entro 3 giorni" color="text-amber-600" items={entro3} onProductClick={onProductClick} />
      <Section title="Entro 7 giorni" color="text-yellow-600" items={entro7} onProductClick={onProductClick} />
      <Section title="In ordine" color="text-emerald-600" items={ok} onProductClick={onProductClick} />
    </div>
  );
}
