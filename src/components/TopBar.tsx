import { Bell, ChevronLeft } from 'lucide-react';
import type { PageName } from '../types';

interface TopBarProps {
  page: PageName;
  onBack?: () => void;
  title?: string;
  onProfile?: () => void;
  alertCount?: number;
}

const PAGE_TITLES: Record<PageName, string> = {
  dashboard: 'SmartPantry',
  pantry: 'La mia Dispensa',
  expiry: 'Scadenze',
  recipes: 'Ricette Smart',
  impatto: 'Il mio Impatto',
  profile: 'Profilo',
};

export function TopBar({ page, onBack, title, onProfile, alertCount = 0 }: TopBarProps) {
  const displayTitle = title ?? PAGE_TITLES[page];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100">
      <div className="max-w-lg mx-auto flex items-center h-14 px-4 gap-3">
        {onBack ? (
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">SP</span>
          </div>
        )}
        <h1 className={`flex-1 font-bold text-slate-800 ${page === 'dashboard' ? 'text-xl' : 'text-lg'}`}>
          {displayTitle}
        </h1>
        <div className="flex items-center gap-2">
          <button className="relative w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <Bell size={18} className="text-slate-600" />
            {alertCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>
          <button
            onClick={onProfile}
            className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center hover:bg-emerald-200 transition-colors"
          >
            <span className="text-emerald-700 font-bold text-sm">M</span>
          </button>
        </div>
      </div>
    </header>
  );
}
