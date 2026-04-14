import { Home, Package, Clock, ChefHat, Users, type LucideProps } from 'lucide-react';
import type { FC } from 'react';
import type { PageName } from '../types';

interface BottomNavProps {
  current: PageName;
  onChange: (page: PageName) => void;
  expiryCount: number;
}

const tabs: { id: PageName; label: string; Icon: FC<LucideProps> }[] = [
  { id: 'dashboard', label: 'Home', Icon: Home },
  { id: 'pantry', label: 'Dispensa', Icon: Package },
  { id: 'expiry', label: 'Scadenze', Icon: Clock },
  { id: 'recipes', label: 'Ricette', Icon: ChefHat },
  { id: 'family', label: 'Famiglia', Icon: Users },
];

export function BottomNav({ current, onChange, expiryCount }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-100 z-50 pb-safe">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 h-16">
        {tabs.map(({ id, label, Icon }) => {
          const active = current === id;
          const showBadge = id === 'expiry' && expiryCount > 0;

          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                active
                  ? 'text-emerald-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
                {showBadge && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                    {expiryCount > 9 ? '9+' : expiryCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium leading-none ${active ? 'text-emerald-600' : ''}`}>
                {label}
              </span>
              {active && <span className="w-1 h-1 bg-emerald-500 rounded-full" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
