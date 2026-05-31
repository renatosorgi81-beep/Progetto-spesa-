import { Package, Clock, ShoppingCart } from 'lucide-react';
import type { PageName } from '../types';

interface BottomNavProps {
  current: PageName;
  onChange: (p: PageName) => void;
  expiryUrgent?: number;
  cartPending?: number;
}

const TABS: { id: PageName; label: string; Icon: typeof Package }[] = [
  { id: 'dispensa', label: 'Dispensa', Icon: Package },
  { id: 'scadenze', label: 'Scadenze', Icon: Clock },
  { id: 'spesa', label: 'Lista Spesa', Icon: ShoppingCart },
];

export function BottomNav({ current, onChange, expiryUrgent = 0, cartPending = 0 }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-100 safe-bottom">
      <div className="max-w-lg mx-auto flex">
        {TABS.map(({ id, label, Icon }) => {
          const active = current === id;
          const badge = id === 'scadenze' ? expiryUrgent : id === 'spesa' ? cartPending : 0;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors relative ${
                active ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold ${active ? 'text-emerald-600' : 'text-slate-400'}`}>
                {label}
              </span>
              {active && (
                <span className="absolute top-0 inset-x-1/4 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
