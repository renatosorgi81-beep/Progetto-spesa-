import { useState } from 'react';
import { CheckCircle2, Circle, Trash2, Plus, X } from 'lucide-react';
import type { ShoppingItem } from '../types';
import { guessEmoji } from '../utils';

interface ListaSpesaProps {
  items: ShoppingItem[];
  onAdd: (item: Omit<ShoppingItem, 'id' | 'addedAt'>) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function ItemRow({ item, onToggle, onDelete }: { item: ShoppingItem; onToggle: () => void; onDelete: () => void }) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm flex items-center gap-3 px-4 py-3.5 transition-all ${
      item.purchased ? 'border-emerald-100 opacity-60' : 'border-slate-100'
    }`}>
      <button onClick={onToggle} className="flex-shrink-0">
        {item.purchased
          ? <CheckCircle2 size={24} className="text-emerald-500" />
          : <Circle size={24} className="text-slate-300" />}
      </button>
      <span className="text-2xl flex-shrink-0">{item.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${item.purchased ? 'line-through text-slate-400' : 'text-slate-800'}`}>
          {item.name}
        </p>
        <p className="text-xs text-slate-400">{item.qty}</p>
      </div>
      <button
        onClick={onDelete}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all flex-shrink-0"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function AddItemForm({ onAdd, onClose }: { onAdd: ListaSpesaProps['onAdd']; onClose: () => void }) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('1 pz');

  function submit() {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), emoji: guessEmoji(name.toLowerCase()), qty: qty.trim(), purchased: false });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-t-3xl p-5 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-800">Aggiungi alla lista</h3>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-4xl">{guessEmoji(name.toLowerCase()) || '🛒'}</span>
          <input
            autoFocus
            className="flex-1 text-lg font-semibold border-b-2 border-emerald-400 pb-1 outline-none bg-transparent"
            placeholder="Prodotto..."
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Quantità</label>
          <input
            className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            placeholder="Es. 2 kg, 1 bottiglia, 500g..."
            value={qty}
            onChange={e => setQty(e.target.value)}
          />
        </div>

        <button
          onClick={submit}
          disabled={!name.trim()}
          className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl disabled:bg-slate-200 disabled:text-slate-400 transition-all"
        >
          Aggiungi
        </button>
      </div>
    </div>
  );
}

export function ListaSpesa({ items, onAdd, onToggle, onDelete }: ListaSpesaProps) {
  const [showForm, setShowForm] = useState(false);

  const toDo = items.filter(i => !i.purchased);
  const done = items.filter(i => i.purchased);
  const pct = items.length > 0 ? Math.round((done.length / items.length) * 100) : 0;

  return (
    <div className="px-4 pt-4 pb-24 space-y-5">
      {/* Header card */}
      {items.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold text-base">
              {toDo.length} prodotti da comprare
            </p>
            <span className="text-white/80 text-sm">{pct}%</span>
          </div>
          <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* To-do */}
      {toDo.length > 0 && (
        <div className="space-y-2">
          {toDo.map(item => (
            <ItemRow key={item.id} item={item} onToggle={() => onToggle(item.id)} onDelete={() => onDelete(item.id)} />
          ))}
        </div>
      )}

      {/* Done */}
      {done.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Già presi ({done.length})</p>
          {done.map(item => (
            <ItemRow key={item.id} item={item} onToggle={() => onToggle(item.id)} onDelete={() => onDelete(item.id)} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
          <div className="text-7xl">🛒</div>
          <p className="text-xl font-bold text-slate-700">Lista vuota</p>
          <p className="text-sm text-slate-400">Aggiungi i prodotti da comprare</p>
        </div>
      )}

      {/* Add button (FAB) */}
      <div className="fixed bottom-20 right-4 z-30">
        <button
          onClick={() => setShowForm(true)}
          className="w-14 h-14 bg-emerald-500 text-white rounded-full shadow-xl flex items-center justify-center text-2xl hover:bg-emerald-600 active:scale-95 transition-all"
        >
          <Plus size={26} />
        </button>
      </div>

      {showForm && <AddItemForm onAdd={onAdd} onClose={() => setShowForm(false)} />}
    </div>
  );
}
