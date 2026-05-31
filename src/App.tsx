import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Layout } from './components/Layout';
import { ReceiptScanner } from './components/ReceiptScanner';
import { Dispensa } from './pages/Dispensa';
import { Scadenze } from './pages/Scadenze';
import { ListaSpesa } from './pages/ListaSpesa';
import { useLocalStorage, guessEmoji, computeStatus, defaultExpiry, daysUntilExpiry } from './utils';
import type { PageName, Product, ShoppingItem, ProductLocation } from './types';

// ── AddProductForm ────────────────────────────────────────────────────────────

function AddProductForm({ onAdd, onClose }: { onAdd: (p: Product) => void; onClose: () => void }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState<ProductLocation>('dispensa');
  const [expiryDate, setExpiryDate] = useState(defaultExpiry(7));
  const [qty, setQty] = useState('1');
  const [unit, setUnit] = useState('pz');

  const emoji = name ? guessEmoji(name.toLowerCase()) : '🛒';

  function submit() {
    if (!name.trim()) return;
    const today = new Date().toISOString();
    const product: Product = {
      id: `p-${Date.now()}`,
      name: name.trim(),
      emoji,
      location,
      expiryDate,
      qty: parseFloat(qty) || 1,
      unit,
      addedAt: today,
      status: computeStatus(expiryDate),
    };
    onAdd(product);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-t-3xl p-5 space-y-5 max-w-lg w-full mx-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xl text-slate-800">Aggiungi prodotto</h3>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-5xl">{emoji}</span>
          <input
            autoFocus
            className="flex-1 text-xl font-semibold border-b-2 border-emerald-400 pb-1 outline-none bg-transparent placeholder:text-slate-300"
            placeholder="Nome prodotto…"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
        </div>

        {/* Location */}
        <div className="flex gap-2">
          {(['frigo', 'dispensa', 'freezer'] as const).map(loc => (
            <button
              key={loc}
              onClick={() => setLocation(loc)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                location === loc ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {loc === 'frigo' ? '🧊 Frigo' : loc === 'dispensa' ? '🗄️ Dispensa' : '❄️ Freezer'}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          {/* Expiry */}
          <div className="flex-1">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Scade il</label>
            <input
              type="date"
              value={expiryDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setExpiryDate(e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          {/* Qty */}
          <div className="w-28">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Quantità</label>
            <div className="flex gap-1 mt-1">
              <input
                type="number"
                min="0"
                step="0.5"
                value={qty}
                onChange={e => setQty(e.target.value)}
                className="flex-1 min-w-0 border border-slate-200 rounded-xl px-2 py-2.5 text-sm outline-none focus:border-emerald-400 text-center"
              />
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-14 border border-slate-200 rounded-xl px-1 py-2.5 text-xs outline-none focus:border-emerald-400 bg-white"
              >
                <option>pz</option>
                <option>kg</option>
                <option>g</option>
                <option>L</option>
                <option>ml</option>
                <option>cf</option>
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={submit}
          disabled={!name.trim()}
          className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl text-base disabled:bg-slate-200 disabled:text-slate-400 transition-all"
        >
          Aggiungi
        </button>
      </div>
    </div>
  );
}

// ── ProductSheet ──────────────────────────────────────────────────────────────

function ProductSheet({
  product,
  onUpdate,
  onDelete,
  onClose,
}: {
  product: Product;
  onUpdate: (p: Product) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [location, setLocation] = useState(product.location);
  const [expiryDate, setExpiryDate] = useState(product.expiryDate);
  const days = daysUntilExpiry(expiryDate);

  function save(patch: Partial<Product>) {
    const next = { ...product, location, expiryDate, ...patch };
    onUpdate({ ...next, status: computeStatus(next.expiryDate) });
  }

  function handleLocationChange(loc: ProductLocation) {
    setLocation(loc);
    save({ location: loc });
  }

  function handleExpiryChange(d: string) {
    setExpiryDate(d);
    save({ expiryDate: d });
  }

  const expiryColor = product.status === 'scaduto'
    ? 'text-red-600'
    : product.status === 'in_scadenza'
    ? 'text-amber-600'
    : 'text-emerald-600';

  return (
    <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose}>
      <div
        className="absolute bottom-0 inset-x-0 max-w-lg mx-auto bg-white rounded-t-3xl pb-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-5" />

        <div className="px-5 space-y-5">
          {/* Identity */}
          <div className="flex items-center gap-4">
            <span className="text-6xl">{product.emoji}</span>
            <div>
              <h3 className="text-xl font-bold text-slate-800 leading-tight">{product.name}</h3>
              <p className={`text-sm font-semibold mt-0.5 ${expiryColor}`}>
                {product.status === 'scaduto'
                  ? 'Scaduto!'
                  : product.status === 'in_scadenza'
                  ? days === 0 ? 'Scade oggi!' : `Scade in ${days} giorni`
                  : `Scade in ${days} giorni`}
              </p>
            </div>
          </div>

          {/* Location */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Dove</p>
            <div className="flex gap-2">
              {(['frigo', 'dispensa', 'freezer'] as const).map(loc => (
                <button
                  key={loc}
                  onClick={() => handleLocationChange(loc)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                    location === loc ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {loc === 'frigo' ? '🧊 Frigo' : loc === 'dispensa' ? '🗄️ Dispensa' : '❄️ Freezer'}
                </button>
              ))}
            </div>
          </div>

          {/* Expiry */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Scadenza</p>
            <input
              type="date"
              value={expiryDate}
              onChange={e => handleExpiryChange(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Qty info */}
          <p className="text-sm text-slate-400">
            Quantità: <strong className="text-slate-700">{product.qty} {product.unit}</strong>
            {product.price && <> · <strong className="text-slate-700">€{product.price.toFixed(2)}</strong></>}
          </p>

          {/* Delete */}
          <button
            onClick={onDelete}
            className="w-full py-4 bg-red-50 border border-red-200 text-red-500 font-bold rounded-2xl flex items-center justify-center gap-2"
          >
            <Trash2 size={18} /> Rimuovi prodotto
          </button>
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<PageName>('dispensa');
  const [products, setProducts] = useLocalStorage<Product[]>('sp_products', []);
  const [shoppingItems, setShoppingItems] = useLocalStorage<ShoppingItem[]>('sp_shopping', []);
  const [showScanner, setShowScanner] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const expiryUrgent = products.filter(p => p.status === 'scaduto' || p.status === 'in_scadenza').length;
  const cartPending = shoppingItems.filter(i => !i.purchased).length;

  function handleAddProducts(newProducts: Product[]) {
    setProducts(prev => [...newProducts, ...prev]);
  }

  function handleAddProduct(p: Product) {
    setProducts(prev => [p, ...prev]);
  }

  function handleUpdateProduct(updated: Product) {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    setSelectedProduct(updated);
  }

  function handleDeleteProduct(id: string) {
    setProducts(prev => prev.filter(p => p.id !== id));
    setSelectedProduct(null);
  }

  function handleAddShoppingItem(item: Omit<ShoppingItem, 'id' | 'addedAt'>) {
    const newItem: ShoppingItem = { ...item, id: `si-${Date.now()}`, addedAt: new Date().toISOString() };
    setShoppingItems(prev => [newItem, ...prev]);
  }

  function handleToggleShoppingItem(id: string) {
    setShoppingItems(prev => prev.map(i => i.id === id ? { ...i, purchased: !i.purchased } : i));
  }

  function handleDeleteShoppingItem(id: string) {
    setShoppingItems(prev => prev.filter(i => i.id !== id));
  }

  return (
    <>
      <Layout page={page} onNavigate={setPage} expiryUrgent={expiryUrgent} cartPending={cartPending}>
        {page === 'dispensa' && (
          <Dispensa
            products={products}
            onProductClick={setSelectedProduct}
            onOpenScanner={() => setShowScanner(true)}
            onOpenAddForm={() => setShowAddForm(true)}
          />
        )}
        {page === 'scadenze' && (
          <Scadenze products={products} onProductClick={setSelectedProduct} />
        )}
        {page === 'spesa' && (
          <ListaSpesa
            items={shoppingItems}
            onAdd={handleAddShoppingItem}
            onToggle={handleToggleShoppingItem}
            onDelete={handleDeleteShoppingItem}
          />
        )}
      </Layout>

      {/* Overlays */}
      {showScanner && (
        <ReceiptScanner
          onAddProducts={handleAddProducts}
          onClose={() => setShowScanner(false)}
        />
      )}
      {showAddForm && (
        <AddProductForm
          onAdd={handleAddProduct}
          onClose={() => setShowAddForm(false)}
        />
      )}
      {selectedProduct && (
        <ProductSheet
          product={selectedProduct}
          onUpdate={handleUpdateProduct}
          onDelete={() => handleDeleteProduct(selectedProduct.id)}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
