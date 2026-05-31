import React from 'react';
import { daysUntilExpiry } from '../components/ExpiryBadge';
import { ProductCard } from '../components/ProductCard';
import type { Product, PageName } from '../types';
import { ChefHat, AlertTriangle, CheckCircle } from 'lucide-react';

interface ExpiryProps {
  onProductClick: (product: Product) => void;
  onNavigate: (page: PageName) => void;
  products: Product[];
}

function SectionHeader({ icon, title, count, color }: {
  icon: React.ReactNode;
  title: string;
  count: number;
  color: string;
}) {
  return (
    <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${color}`}>
      {icon}
      <h3 className="text-sm font-bold">{title}</h3>
      <span className="ml-auto text-xs font-semibold opacity-70">{count} prodotti</span>
    </div>
  );
}

export function Expiry({ onProductClick, onNavigate, products }: ExpiryProps) {
  const expired = products.filter(p => p.status === 'scaduto')
    .sort((a, b) => daysUntilExpiry(a.expiryDate) - daysUntilExpiry(b.expiryDate));

  const today = products.filter(p => p.status !== 'scaduto' && daysUntilExpiry(p.expiryDate) === 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  const within3 = products.filter(p => {
    const d = daysUntilExpiry(p.expiryDate);
    return d >= 1 && d <= 3;
  }).sort((a, b) => daysUntilExpiry(a.expiryDate) - daysUntilExpiry(b.expiryDate));

  const within7 = products.filter(p => {
    const d = daysUntilExpiry(p.expiryDate);
    return d >= 4 && d <= 7;
  }).sort((a, b) => daysUntilExpiry(a.expiryDate) - daysUntilExpiry(b.expiryDate));

  const ok = products.filter(p => {
    const d = daysUntilExpiry(p.expiryDate);
    return d > 7;
  }).sort((a, b) => daysUntilExpiry(a.expiryDate) - daysUntilExpiry(b.expiryDate));

  const totalUrgent = expired.length + today.length + within3.length;

  return (
    <div className="px-4 py-5 space-y-6">

      {/* Summary */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-red-50 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{expired.length}</p>
          <p className="text-[10px] text-red-500 font-medium mt-0.5 leading-tight">Scaduti</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{today.length}</p>
          <p className="text-[10px] text-amber-600 font-medium mt-0.5 leading-tight">Oggi</p>
        </div>
        <div className="bg-orange-50 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-orange-500">{within3.length}</p>
          <p className="text-[10px] text-orange-500 font-medium mt-0.5 leading-tight">Entro 3g</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{ok.length}</p>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5 leading-tight">In ordine</p>
        </div>
      </div>

      {/* Smart tip */}
      {totalUrgent > 0 && (
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-4 text-white">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-sm">
                {totalUrgent} prodotti necessitano attenzione
              </p>
              <p className="text-white/85 text-xs mt-0.5">
                Consulta le ricette per usarli subito e ridurre lo spreco.
              </p>
              <button
                onClick={() => onNavigate('recipes')}
                className="mt-2 text-xs font-semibold bg-white/25 hover:bg-white/35 px-3 py-1.5 rounded-lg inline-flex items-center gap-1 transition-colors"
              >
                <ChefHat size={12} /> Vedi ricette urgenti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scaduti */}
      {expired.length > 0 && (
        <div>
          <SectionHeader
            icon={<span className="text-red-500"><AlertTriangle size={16} /></span>}
            title="Scaduti"
            count={expired.length}
            color="border-red-200 text-red-600"
          />
          <div className="space-y-2">
            {expired.map(p => (
              <ProductCard key={p.id} product={p} compact onClick={() => onProductClick(p)} />
            ))}
          </div>
        </div>
      )}

      {/* Scadono oggi */}
      {today.length > 0 && (
        <div>
          <SectionHeader
            icon={<span className="text-amber-500">⏰</span>}
            title="Scadono oggi"
            count={today.length}
            color="border-amber-200 text-amber-600"
          />
          <div className="space-y-2">
            {today.map(p => (
              <ProductCard key={p.id} product={p} compact onClick={() => onProductClick(p)} />
            ))}
          </div>
        </div>
      )}

      {/* Entro 3 giorni */}
      {within3.length > 0 && (
        <div>
          <SectionHeader
            icon={<span className="text-orange-500">🕐</span>}
            title="Entro 3 giorni"
            count={within3.length}
            color="border-orange-200 text-orange-500"
          />
          <div className="space-y-2">
            {within3.map(p => (
              <ProductCard key={p.id} product={p} compact onClick={() => onProductClick(p)} />
            ))}
          </div>
        </div>
      )}

      {/* Entro 7 giorni */}
      {within7.length > 0 && (
        <div>
          <SectionHeader
            icon={<span className="text-yellow-500">📅</span>}
            title="Entro 7 giorni"
            count={within7.length}
            color="border-yellow-200 text-yellow-600"
          />
          <div className="space-y-2">
            {within7.map(p => (
              <ProductCard key={p.id} product={p} compact onClick={() => onProductClick(p)} />
            ))}
          </div>
        </div>
      )}

      {/* Tutto ok */}
      {ok.length > 0 && (
        <div>
          <SectionHeader
            icon={<CheckCircle size={16} className="text-emerald-500" />}
            title="In ordine"
            count={ok.length}
            color="border-emerald-200 text-emerald-600"
          />
          <div className="space-y-2">
            {ok.slice(0, 5).map(p => (
              <ProductCard key={p.id} product={p} compact onClick={() => onProductClick(p)} />
            ))}
            {ok.length > 5 && (
              <p className="text-xs text-slate-400 text-center py-2">
                + altri {ok.length - 5} prodotti in ordine
              </p>
            )}
          </div>
        </div>
      )}

      {totalUrgent === 0 && expired.length === 0 && (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🎉</div>
          <p className="font-bold text-slate-700">Ottimo lavoro!</p>
          <p className="text-sm text-slate-400 mt-1">Nessun prodotto in scadenza critica.</p>
        </div>
      )}

      <div className="h-2" />
    </div>
  );
}
