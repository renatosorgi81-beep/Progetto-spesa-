import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { PRODUCTS } from '../data/mockData';
import { ProductCard } from '../components/ProductCard';
import type { Product, ProductCategory, ProductLocation, ProductStatus } from '../types';
import { daysUntilExpiry } from '../components/ExpiryBadge';

interface PantryProps {
  onProductClick: (product: Product) => void;
}

type SortKey = 'expiry' | 'name' | 'location' | 'quantity';

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  latticini: 'Latticini',
  carne: 'Carne',
  pesce: 'Pesce',
  verdura: 'Verdura',
  frutta: 'Frutta',
  pane: 'Pane',
  pasta_riso: 'Pasta & Riso',
  conserve: 'Conserve',
  bevande: 'Bevande',
  dolci: 'Dolci',
  surgelati: 'Surgelati',
  salumi: 'Salumi',
  condimenti: 'Condimenti',
};

const STATUS_LABELS: Record<ProductStatus, string> = {
  ok: 'OK',
  in_scadenza: 'In scadenza',
  scaduto: 'Scaduto',
  quasi_finito: 'Quasi finito',
};

const LOCATION_LABELS: Record<ProductLocation, string> = {
  frigo: 'Frigo',
  dispensa: 'Dispensa',
  freezer: 'Freezer',
};

export function Pantry({ onProductClick }: PantryProps) {
  const [query, setQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState<ProductLocation | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ProductStatus | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<ProductCategory | 'all'>('all');
  const [sort, setSort] = useState<SortKey>('expiry');
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(PRODUCTS.map(p => p.category));
    return Array.from(cats) as ProductCategory[];
  }, []);

  const filtered = useMemo(() => {
    let list = [...PRODUCTS];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (filterLocation !== 'all') list = list.filter(p => p.location === filterLocation);
    if (filterStatus !== 'all') list = list.filter(p => p.status === filterStatus);
    if (filterCategory !== 'all') list = list.filter(p => p.category === filterCategory);

    list.sort((a, b) => {
      if (sort === 'expiry') return daysUntilExpiry(a.expiryDate) - daysUntilExpiry(b.expiryDate);
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'location') return a.location.localeCompare(b.location);
      if (sort === 'quantity') {
        const pctA = a.remainingQty / a.purchasedQty;
        const pctB = b.remainingQty / b.purchasedQty;
        return pctA - pctB;
      }
      return 0;
    });

    return list;
  }, [query, filterLocation, filterStatus, filterCategory, sort]);

  const activeFiltersCount = [
    filterLocation !== 'all',
    filterStatus !== 'all',
    filterCategory !== 'all',
  ].filter(Boolean).length;

  function clearFilters() {
    setFilterLocation('all');
    setFilterStatus('all');
    setFilterCategory('all');
  }

  return (
    <div className="px-4 py-4 space-y-4">

      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cerca prodotti..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={14} className="text-slate-400" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`relative w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${showFilters || activeFiltersCount > 0 ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-600'}`}
        >
          <SlidersHorizontal size={16} />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
          {/* Location filter */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Dove</p>
            <div className="flex flex-wrap gap-2">
              {(['all', 'frigo', 'dispensa', 'freezer'] as const).map(loc => (
                <button
                  key={loc}
                  onClick={() => setFilterLocation(loc)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterLocation === loc
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {loc === 'all' ? 'Tutti' : LOCATION_LABELS[loc]}
                </button>
              ))}
            </div>
          </div>

          {/* Status filter */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Stato</p>
            <div className="flex flex-wrap gap-2">
              {(['all', 'ok', 'in_scadenza', 'scaduto', 'quasi_finito'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterStatus === s
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s === 'all' ? 'Tutti' : STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Categoria</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterCategory === 'all'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tutte
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterCategory === cat
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Ordina per</p>
            <div className="flex flex-wrap gap-2">
              {([
                ['expiry', 'Scadenza'],
                ['name', 'Nome'],
                ['location', 'Posizione'],
                ['quantity', 'Quantità'],
              ] as [SortKey, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    sort === key
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs text-red-500 font-semibold flex items-center gap-1"
            >
              <X size={12} /> Rimuovi filtri
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {filtered.length} prodotti
          {activeFiltersCount > 0 && ' (filtrati)'}
        </p>
        {sort === 'expiry' && (
          <p className="text-xs text-slate-400">Ordinati per scadenza</p>
        )}
      </div>

      {/* Product list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-slate-600 font-medium">Nessun prodotto trovato</p>
          <p className="text-sm text-slate-400 mt-1">Prova a cambiare i filtri di ricerca</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} onClick={() => onProductClick(p)} />
          ))}
        </div>
      )}

      <div className="h-2" />
    </div>
  );
}
