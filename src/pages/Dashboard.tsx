import { Package, AlertTriangle, TrendingDown, ChefHat, ShoppingCart, ArrowRight, Sparkles, Leaf } from 'lucide-react';
import { RECENT_PURCHASES, RECIPES, CONSUMPTION_HISTORY, MONTHLY_IMPACT } from '../data/mockData';
import { StatCard } from '../components/StatCard';
import { AlertBox } from '../components/AlertBox';
import { ProductCard } from '../components/ProductCard';
import { daysUntilExpiry } from '../components/ExpiryBadge';
import type { PageName, Product, ProductLocation } from '../types';

interface DashboardProps {
  onNavigate: (page: PageName) => void;
  onNavigateToPantry: (filter: ProductLocation | 'all') => void;
  onProductClick: (product: Product) => void;
  products: Product[];
}

export function Dashboard({ onNavigate, onNavigateToPantry, onProductClick, products }: DashboardProps) {
  const total = products.length;
  const expiring = products.filter(p => p.status === 'in_scadenza' || p.status === 'scaduto').length;
  const lowStock = products.filter(p => p.status === 'quasi_finito').length;
  const expired = products.filter(p => p.status === 'scaduto').length;

  const frigoCount = products.filter(p => p.location === 'frigo').length;
  const dispensaCount = products.filter(p => p.location === 'dispensa').length;
  const freezerCount = products.filter(p => p.location === 'freezer').length;

  const readyRecipesCount = RECIPES.filter(
    r => r.availableIngredients === r.totalIngredients
  ).length;

  const urgentProducts = products
    .filter(p => p.status !== 'scaduto')
    .sort((a, b) => daysUntilExpiry(a.expiryDate) - daysUntilExpiry(b.expiryDate))
    .slice(0, 3);

  const mostUrgent = products
    .filter(p => p.status === 'in_scadenza' || p.status === 'quasi_finito')
    .sort((a, b) => daysUntilExpiry(a.expiryDate) - daysUntilExpiry(b.expiryDate));

  const urgentRecipe = RECIPES.find(r => r.isUrgent);
  const smartTip = mostUrgent.length > 0
    ? `Hai ${mostUrgent[0].name.toLowerCase()} ${mostUrgent.length > 1 ? `e ${mostUrgent[1].name.toLowerCase()} ` : ''}in scadenza. ${urgentRecipe ? `Prova "${urgentRecipe.name}" oggi stesso!` : 'Usali prima che scadano.'}`
    : 'La tua dispensa è in ottimo stato. Continua così!';

  const lastPurchase = RECENT_PURCHASES[0];
  const lastPurchaseProducts = lastPurchase
    ? products.filter(p => lastPurchase.products.includes(p.id)).slice(0, 4)
    : [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera';

  return (
    <div className="px-4 py-5 space-y-6">

      {/* Greeting */}
      <div>
        <p className="text-slate-500 text-sm">{greeting},</p>
        <h2 className="text-2xl font-bold text-slate-800">Marco 👋</h2>
        <p className="text-sm text-slate-400 mt-1">
          La tua dispensa ha <strong className="text-slate-600">{total} prodotti</strong> caricati
        </p>
      </div>

      {/* Alert urgente */}
      {expired > 0 && (
        <AlertBox
          type="warning"
          title={`${expired} prodotto${expired > 1 ? 'i' : ''} scadut${expired > 1 ? 'i' : 'o'}!`}
          description="Controlla subito e rimuovi i prodotti scaduti dalla dispensa."
          action={{ label: 'Vai alle scadenze', onClick: () => onNavigate('expiry') }}
        />
      )}
      {expiring > 0 && expired === 0 && (
        <AlertBox
          type="warning"
          title={`${expiring} prodotti in scadenza nei prossimi giorni`}
          description="Pianifica come usarli per evitare sprechi alimentari."
          action={{ label: 'Vedi ricette', onClick: () => onNavigate('recipes') }}
        />
      )}

      {/* Statistiche rapide */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Riepilogo</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Prodotti totali"
            value={total}
            icon={<Package size={18} />}
            color="green"
            onClick={() => onNavigateToPantry('all')}
          />
          <StatCard
            label="In scadenza"
            value={expiring}
            icon={<AlertTriangle size={18} />}
            color={expiring > 0 ? 'amber' : 'slate'}
            onClick={() => onNavigate('expiry')}
          />
          <StatCard
            label="Quasi finiti"
            value={lowStock}
            icon={<TrendingDown size={18} />}
            color={lowStock > 0 ? 'amber' : 'slate'}
            onClick={() => onNavigateToPantry('all')}
          />
          <StatCard
            label="Ricette pronte"
            value={readyRecipesCount}
            icon={<ChefHat size={18} />}
            color="blue"
            onClick={() => onNavigate('recipes')}
            subtitle="con ingredienti già in casa"
          />
        </div>
      </div>

      {/* Dove sono i prodotti — cliccabili con filtro */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Dove sono</h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onNavigateToPantry('frigo')}
            className="bg-sky-50 border border-sky-100 rounded-2xl p-3 text-center hover:bg-sky-100 active:scale-95 transition-all"
          >
            <div className="text-2xl mb-1">🧊</div>
            <p className="text-xs font-semibold text-sky-700">Frigo</p>
            <p className="text-xl font-bold text-sky-700">{frigoCount}</p>
            <p className="text-[10px] text-sky-400 mt-0.5">prodotti</p>
          </button>
          <button
            onClick={() => onNavigateToPantry('dispensa')}
            className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-center hover:bg-amber-100 active:scale-95 transition-all"
          >
            <div className="text-2xl mb-1">🗄️</div>
            <p className="text-xs font-semibold text-amber-700">Dispensa</p>
            <p className="text-xl font-bold text-amber-700">{dispensaCount}</p>
            <p className="text-[10px] text-amber-400 mt-0.5">prodotti</p>
          </button>
          <button
            onClick={() => onNavigateToPantry('freezer')}
            className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3 text-center hover:bg-indigo-100 active:scale-95 transition-all"
          >
            <div className="text-2xl mb-1">❄️</div>
            <p className="text-xs font-semibold text-indigo-700">Freezer</p>
            <p className="text-xl font-bold text-indigo-700">{freezerCount}</p>
            <p className="text-[10px] text-indigo-400 mt-0.5">prodotti</p>
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-300 mt-2">Tocca per filtrare la dispensa</p>
      </div>

      {/* Report settimanale impatto */}
      {(() => {
        const thisMonth = MONTHLY_IMPACT[MONTHLY_IMPACT.length - 1];
        const weekConsumed = CONSUMPTION_HISTORY.filter(c => !c.wasWasted).length;
        const weekWasted = CONSUMPTION_HISTORY.filter(c => c.wasWasted).length;
        return (
          <button
            onClick={() => onNavigate('impatto')}
            className="w-full bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:border-emerald-200 hover:shadow-md active:scale-95 transition-all text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Leaf size={16} className="text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-slate-700">Il tuo impatto</p>
              </div>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
                Dettagli <ArrowRight size={11} />
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
                <p className="text-lg font-bold text-emerald-600">{weekConsumed}</p>
                <p className="text-[10px] text-emerald-500 font-medium leading-tight">prodotti usati</p>
              </div>
              <div className={`${weekWasted > 0 ? 'bg-red-50' : 'bg-emerald-50'} rounded-xl p-2.5 text-center`}>
                <p className={`text-lg font-bold ${weekWasted > 0 ? 'text-red-500' : 'text-emerald-600'}`}>{weekWasted}</p>
                <p className={`text-[10px] font-medium leading-tight ${weekWasted > 0 ? 'text-red-400' : 'text-emerald-500'}`}>sprecati</p>
              </div>
              <div className="bg-sky-50 rounded-xl p-2.5 text-center">
                <p className="text-lg font-bold text-sky-600">€{thisMonth.eurosSaved.toFixed(0)}</p>
                <p className="text-[10px] text-sky-500 font-medium leading-tight">risparmiati</p>
              </div>
            </div>
          </button>
        );
      })()}

      {/* Suggerimento smart dinamico */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">Suggerimento del giorno</p>
            <p className="text-white/85 text-xs mt-0.5 leading-relaxed">{smartTip}</p>
            {urgentRecipe && (
              <button
                onClick={() => onNavigate('recipes')}
                className="mt-2 text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg inline-flex items-center gap-1 transition-colors"
              >
                Vedi ricetta <ArrowRight size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Prossime scadenze */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Scadono presto</h3>
          <button
            onClick={() => onNavigate('expiry')}
            className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5"
          >
            Tutti <ArrowRight size={12} />
          </button>
        </div>
        <div className="space-y-2">
          {urgentProducts.map(p => (
            <ProductCard key={p.id} product={p} compact onClick={() => onProductClick(p)} />
          ))}
        </div>
      </div>

      {/* Ultimi acquisti */}
      {lastPurchase && <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Ultimo acquisto</h3>
          <span className="text-xs text-slate-400">
            {new Date(lastPurchase.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-50 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <ShoppingCart size={18} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">{lastPurchase.store}</p>
              <p className="text-xs text-slate-400">
                {lastPurchase.itemCount} prodotti · €{lastPurchase.total.toFixed(2)}
              </p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-medium">
              Caricato ✓
            </span>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-4 gap-2">
              {lastPurchaseProducts.map(p => (
                <button
                  key={p.id}
                  onClick={() => onProductClick(p)}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition-all"
                >
                  <span className="text-2xl">{p.imageEmoji}</span>
                  <span className="text-[10px] text-slate-500 text-center leading-tight line-clamp-2">{p.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => onNavigateToPantry('all')}
              className="w-full mt-2 py-2 text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1 rounded-xl hover:bg-emerald-50 transition-colors"
            >
              Vedi tutti {lastPurchase.itemCount} prodotti <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>}

      <div className="h-2" />
    </div>
  );
}
