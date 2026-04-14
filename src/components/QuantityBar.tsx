interface QuantityBarProps {
  purchased: number;
  remaining: number;
  unit: string;
  showLabel?: boolean;
}

export function QuantityBar({ purchased, remaining, unit, showLabel = true }: QuantityBarProps) {
  const pct = purchased > 0 ? Math.round((remaining / purchased) * 100) : 0;

  const color =
    pct > 50
      ? 'bg-emerald-500'
      : pct > 25
      ? 'bg-amber-400'
      : 'bg-red-400';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-500">Rimasto</span>
          <span className="text-xs font-semibold text-slate-700">
            {remaining} / {purchased} {unit}
          </span>
        </div>
      )}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
