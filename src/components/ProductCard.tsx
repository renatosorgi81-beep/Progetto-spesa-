import type { Product } from '../types';
import { ExpiryBadge } from './ExpiryBadge';
import { QuantityBar } from './QuantityBar';
import { LocationBadge } from './LocationBadge';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  compact?: boolean;
}

export function ProductCard({ product, onClick, compact = false }: ProductCardProps) {
  if (compact) {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 transition-all text-left active:scale-98"
      >
        <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-2xl flex-shrink-0">
          {product.imageEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{product.name}</p>
          <p className="text-xs text-slate-400">{product.brand} · {product.format}</p>
          <div className="mt-1">
            <QuantityBar
              purchased={product.purchasedQty}
              remaining={product.remainingQty}
              unit={product.unit}
              showLabel={false}
            />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <ExpiryBadge status={product.status} expiryDate={product.expiryDate} size="sm" />
          <LocationBadge location={product.location} size="sm" />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 transition-all text-left active:scale-98"
    >
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center text-3xl flex-shrink-0">
          {product.imageEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-800 leading-tight">{product.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{product.brand} · {product.format}</p>
            </div>
            <ExpiryBadge status={product.status} expiryDate={product.expiryDate} />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <LocationBadge location={product.location} />
          </div>
          <div className="mt-3">
            <QuantityBar
              purchased={product.purchasedQty}
              remaining={product.remainingQty}
              unit={product.unit}
            />
          </div>
        </div>
      </div>
    </button>
  );
}
