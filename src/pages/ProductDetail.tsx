import React, { useState } from 'react';
import { Minus, Plus, Trash2, StickyNote, ChefHat, Calendar, Tag, Hash, MapPin, ShoppingBag, ChevronRight } from 'lucide-react';
import type { Product, PageName } from '../types';
import { ExpiryBadge, daysUntilExpiry } from '../components/ExpiryBadge';
import { QuantityBar } from '../components/QuantityBar';
import { LocationBadge } from '../components/LocationBadge';
import { RECIPES } from '../data/mockData';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onNavigate: (page: PageName) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  latticini: '🥛 Latticini',
  carne: '🥩 Carne',
  pesce: '🐟 Pesce',
  verdura: '🥦 Verdura',
  frutta: '🍎 Frutta',
  pane: '🍞 Pane',
  pasta_riso: '🍝 Pasta & Riso',
  conserve: '🥫 Conserve',
  bevande: '🥤 Bevande',
  dolci: '🍪 Dolci',
  surgelati: '❄️ Surgelati',
  salumi: '🥓 Salumi',
  condimenti: '🫙 Condimenti',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function ProductDetail({ product: initialProduct, onBack, onNavigate }: ProductDetailProps) {
  const [qty, setQty] = useState(initialProduct.remainingQty);
  const [note, setNote] = useState(initialProduct.notes);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [finished, setFinished] = useState(false);

  const product = { ...initialProduct, remainingQty: qty };
  const days = daysUntilExpiry(product.expiryDate);

  // Recipes that use this product
  const relatedRecipes = RECIPES.filter(r => r.requiredProductIds.includes(product.id));

  function increment() {
    setQty(v => Math.min(v + 1, initialProduct.purchasedQty));
  }

  function decrement() {
    setQty(v => Math.max(v - 1, 0));
  }

  if (finished) {
    return (
      <div className="px-4 py-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-6xl">✅</div>
        <h3 className="text-xl font-bold text-slate-800">Prodotto terminato!</h3>
        <p className="text-sm text-slate-500 text-center">
          {product.name} è stato rimosso dalla tua dispensa digitale.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
        >
          Torna alla dispensa
        </button>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Hero section */}
      <div className={`px-4 py-6 ${
        product.status === 'scaduto'
          ? 'bg-gradient-to-b from-red-50 to-slate-50'
          : product.status === 'in_scadenza'
          ? 'bg-gradient-to-b from-amber-50 to-slate-50'
          : 'bg-gradient-to-b from-emerald-50 to-slate-50'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center text-5xl">
            {product.imageEmoji}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800 leading-tight">{product.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{product.brand}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <ExpiryBadge status={product.status} expiryDate={product.expiryDate} />
              <LocationBadge location={product.location} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-5 mt-2">

        {/* Expiry warning */}
        {product.status === 'scaduto' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-red-700 font-semibold text-sm">⚠️ Questo prodotto è scaduto</p>
            <p className="text-red-600 text-xs mt-1">
              Scaduto il {formatDate(product.expiryDate)}. Valuta se è ancora consumabile.
            </p>
          </div>
        )}
        {product.status === 'in_scadenza' && days >= 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-amber-700 font-semibold text-sm">
              {days === 0 ? '⏰ Scade oggi!' : `⏰ Scade in ${days} giorni`}
            </p>
            <p className="text-amber-600 text-xs mt-1">
              Usalo prima che scada: consulta le ricette disponibili.
            </p>
          </div>
        )}

        {/* Quantity control */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Quantità rimasta</p>
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={decrement}
              disabled={qty <= 0}
              className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Minus size={18} className="text-slate-600" />
            </button>
            <div className="flex-1 text-center">
              <p className="text-3xl font-bold text-slate-800">{qty}</p>
              <p className="text-xs text-slate-400">{product.unit} su {initialProduct.purchasedQty}</p>
            </div>
            <button
              onClick={increment}
              disabled={qty >= initialProduct.purchasedQty}
              className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={18} className="text-white" />
            </button>
          </div>
          <div className="mt-4">
            <QuantityBar
              purchased={initialProduct.purchasedQty}
              remaining={qty}
              unit={product.unit}
            />
          </div>
        </div>

        {/* Product info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Informazioni</p>
          <div className="space-y-3">
            <InfoRow icon={<Tag size={15} />} label="Categoria" value={CATEGORY_LABELS[product.category]} />
            <InfoRow icon={<ShoppingBag size={15} />} label="Formato" value={product.format} />
            <InfoRow icon={<MapPin size={15} />} label="Conservazione" value={product.location.charAt(0).toUpperCase() + product.location.slice(1)} />
            <InfoRow icon={<Calendar size={15} />} label="Acquistato il" value={formatDate(product.purchaseDate)} />
            <InfoRow icon={<Calendar size={15} />} label="Scade il" value={formatDate(product.expiryDate)} highlight={product.status === 'scaduto' || product.status === 'in_scadenza'} />
            <InfoRow icon={<Hash size={15} />} label="Lotto" value={product.lot} mono />
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Note personali</p>
            <button
              onClick={() => setShowNoteInput(v => !v)}
              className="text-xs text-emerald-600 font-semibold flex items-center gap-1"
            >
              <StickyNote size={13} />
              {showNoteInput ? 'Chiudi' : note ? 'Modifica' : 'Aggiungi'}
            </button>
          </div>
          {showNoteInput ? (
            <div>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Aggiungi una nota su questo prodotto..."
                className="w-full text-sm border border-slate-200 rounded-xl p-3 resize-none outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 h-20 transition-all"
              />
              <button
                onClick={() => setShowNoteInput(false)}
                className="mt-2 px-4 py-2 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Salva nota
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              {note || <span className="text-slate-300 italic">Nessuna nota</span>}
            </p>
          )}
        </div>

        {/* Recipe suggestions */}
        {relatedRecipes.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Idee per usarlo</p>
              <button
                onClick={() => onNavigate('recipes')}
                className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5"
              >
                Vedi tutte <ChevronRight size={12} />
              </button>
            </div>
            <div className="space-y-2">
              {relatedRecipes.map(recipe => (
                <button
                  key={recipe.id}
                  onClick={() => onNavigate('recipes')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 transition-colors text-left"
                >
                  <span className="text-2xl">{recipe.imageEmoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-700">{recipe.name}</p>
                    <p className="text-xs text-slate-400">{recipe.time} · {recipe.difficulty}</p>
                  </div>
                  <ChefHat size={16} className="text-emerald-500" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <button
          onClick={() => setFinished(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-red-200 text-red-500 font-semibold rounded-xl hover:bg-red-50 transition-colors"
        >
          <Trash2 size={18} />
          Prodotto finito / rimosso
        </button>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  highlight,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className={`text-sm font-medium ${highlight ? 'text-amber-600' : 'text-slate-700'} ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </span>
    </div>
  );
}
