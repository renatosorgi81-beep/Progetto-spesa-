import { useState } from 'react';
import { ShoppingCart, Plus, CheckCircle2, Circle, Trash2, X } from 'lucide-react';
import type { ShoppingItem, ProductCategory } from '../types';
import { FAMILY_MEMBERS } from '../data/mockData';

const EMOJI_OPTIONS = [
  '🥛','🧀','🥚','🍗','🥩','🐟','🍅','🥦','🥕','🍋',
  '🍎','🍌','🧄','🧅','🌿','🫙','🥫','🍞','🧈','🥜',
  '🍝','🍚','🫒','🧂','🥤','☕','🍵','🧃','🧻','🧹',
];

const CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: 'latticini', label: 'Latticini' },
  { value: 'carne', label: 'Carne' },
  { value: 'pesce', label: 'Pesce' },
  { value: 'verdura', label: 'Verdura' },
  { value: 'frutta', label: 'Frutta' },
  { value: 'pane', label: 'Pane' },
  { value: 'pasta_riso', label: 'Pasta & Riso' },
  { value: 'conserve', label: 'Conserve' },
  { value: 'bevande', label: 'Bevande' },
  { value: 'dolci', label: 'Dolci' },
  { value: 'surgelati', label: 'Surgelati' },
  { value: 'salumi', label: 'Salumi' },
  { value: 'condimenti', label: 'Condimenti' },
];

interface AddItemFormProps {
  onAdd: (item: Omit<ShoppingItem, 'id' | 'addedAt' | 'purchased'>) => void;
  onClose: () => void;
}

function AddItemForm({ onAdd, onClose }: AddItemFormProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🛒');
  const [qty, setQty] = useState('');
  const [category, setCategory] = useState<ProductCategory>('verdura');
  const [addedBy, setAddedBy] = useState(FAMILY_MEMBERS[0]?.name ?? 'Marco');
  const [note, setNote] = useState('');

  function handleSubmit() {
    if (!name.trim() || !qty.trim()) return;
    onAdd({
      name: name.trim(),
      emoji,
      qty: qty.trim(),
      category,
      addedBy,
      note: note.trim() || undefined,
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl p-5 space-y-4 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-lg">Aggiungi prodotto</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
          >
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        {/* Emoji picker */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Icona</p>
          <div className="flex gap-2 flex-wrap">
            {EMOJI_OPTIONS.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                  emoji === e
                    ? 'bg-emerald-100 ring-2 ring-emerald-400'
                    : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Nome prodotto
          </label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Es. Latte, Mele, Petto di pollo…"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </div>

        {/* Qty */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Quantità
          </label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Es. 1 kg, 2 bottiglie, 500g…"
            value={qty}
            onChange={e => setQty(e.target.value)}
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Categoria
          </label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
            value={category}
            onChange={e => setCategory(e.target.value as ProductCategory)}
          >
            {CATEGORY_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Added by */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Aggiunto da
          </label>
          <div className="flex gap-2 mt-2 flex-wrap">
            {FAMILY_MEMBERS.map(m => (
              <button
                key={m.id}
                onClick={() => setAddedBy(m.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  addedBy === m.name
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m.avatar} {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Nota (opzionale)
          </label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Es. Solo biologico, marca preferita…"
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name.trim() || !qty.trim()}
          className="w-full py-3.5 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 transition-all"
        >
          Aggiungi alla lista
        </button>
      </div>
    </div>
  );
}

interface ShoppingItemRowProps {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function ShoppingItemRow({ item, onToggle, onDelete }: ShoppingItemRowProps) {
  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm p-3 flex items-center gap-3 transition-all ${
        item.purchased ? 'border-emerald-100' : 'border-slate-100'
      }`}
    >
      <button onClick={() => onToggle(item.id)} className="flex-shrink-0">
        {item.purchased ? (
          <CheckCircle2 size={24} className="text-emerald-500" />
        ) : (
          <Circle size={24} className="text-slate-300 hover:text-emerald-400 transition-colors" />
        )}
      </button>
      <span className="text-2xl flex-shrink-0">{item.emoji}</span>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold leading-tight ${
            item.purchased ? 'line-through text-slate-400' : 'text-slate-800'
          }`}
        >
          {item.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-slate-400">{item.qty}</span>
          <span className="text-slate-200">·</span>
          <span className="text-xs text-slate-400">da {item.addedBy}</span>
        </div>
        {item.note && (
          <p className="text-xs text-slate-400 italic mt-0.5">{item.note}</p>
        )}
      </div>
      <button
        onClick={() => onDelete(item.id)}
        className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-red-50 text-slate-300 hover:text-red-400 transition-all"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

interface ShoppingListProps {
  items: ShoppingItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (item: Omit<ShoppingItem, 'id' | 'addedAt' | 'purchased'>) => void;
}

export function ShoppingList({ items, onToggle, onDelete, onAdd }: ShoppingListProps) {
  const [showForm, setShowForm] = useState(false);

  const toDo = items.filter(i => !i.purchased);
  const done = items.filter(i => i.purchased);
  const pct = items.length > 0 ? Math.round((done.length / items.length) * 100) : 0;

  return (
    <div className="px-4 py-5 space-y-5 pb-8">
      {/* Header card */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart size={24} className="text-white/90" />
            <div>
              <p className="font-bold text-base">Lista della Spesa</p>
              <p className="text-white/80 text-xs mt-0.5">
                {toDo.length} da comprare · {done.length} acquistati
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Plus size={20} className="text-white" />
          </button>
        </div>
        {items.length > 0 && (
          <div className="mt-3">
            <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-white/70 text-xs mt-1">{pct}% completato</p>
          </div>
        )}
      </div>

      {/* To-do */}
      {toDo.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
            Da comprare ({toDo.length})
          </h3>
          <div className="space-y-2">
            {toDo.map(item => (
              <ShoppingItemRow
                key={item.id}
                item={item}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Done */}
      {done.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Acquistati ({done.length})
          </h3>
          <div className="space-y-2 opacity-60">
            {done.map(item => (
              <ShoppingItemRow
                key={item.id}
                item={item}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <div className="text-6xl">🛒</div>
          <p className="text-slate-600 font-semibold text-lg">Lista vuota!</p>
          <p className="text-slate-400 text-sm">Aggiungi i prodotti da comprare</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-2xl hover:bg-emerald-600 transition-colors"
          >
            + Aggiungi prodotto
          </button>
        </div>
      )}

      {/* Add button */}
      {items.length > 0 && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3.5 border-2 border-dashed border-emerald-300 text-emerald-600 font-semibold rounded-2xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Aggiungi prodotto
        </button>
      )}

      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <p className="text-blue-700 text-xs">
          💡 <strong>Suggerimento:</strong> Tutti i membri della famiglia possono vedere e
          aggiornare questa lista. Spunta i prodotti mentre fai la spesa!
        </p>
      </div>

      {showForm && (
        <AddItemForm onAdd={onAdd} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
