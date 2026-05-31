import type { PageName } from '../types';

const PAGE_TITLES: Record<PageName, string> = {
  dispensa: 'SmartPantry',
  scadenze: 'Scadenze',
  spesa: 'Lista della Spesa',
};

interface TopBarProps {
  page: PageName;
}

export function TopBar({ page }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100">
      <div className="max-w-lg mx-auto flex items-center h-14 px-4">
        <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xs">SP</span>
        </div>
        <h1 className="ml-3 font-bold text-slate-800 text-lg flex-1">{PAGE_TITLES[page]}</h1>
      </div>
    </header>
  );
}
