import React from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'green' | 'amber' | 'red' | 'blue' | 'slate';
  onClick?: () => void;
  subtitle?: string;
}

const colorMap = {
  green: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'bg-emerald-100 text-emerald-600', value: 'text-emerald-700' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'bg-amber-100 text-amber-600', value: 'text-amber-700' },
  red: { bg: 'bg-red-50', text: 'text-red-700', icon: 'bg-red-100 text-red-600', value: 'text-red-700' },
  blue: { bg: 'bg-sky-50', text: 'text-sky-700', icon: 'bg-sky-100 text-sky-600', value: 'text-sky-700' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-700', icon: 'bg-slate-100 text-slate-500', value: 'text-slate-800' },
};

export function StatCard({ label, value, icon, color, onClick, subtitle }: StatCardProps) {
  const c = colorMap[color];
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={`${c.bg} rounded-2xl p-4 flex flex-col gap-2 ${onClick ? 'cursor-pointer hover:opacity-90 active:scale-95 transition-all text-left w-full' : ''}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.icon}`}>
        {icon}
      </div>
      <div>
        <p className={`text-2xl font-bold leading-none ${c.value}`}>{value}</p>
        <p className={`text-xs font-medium mt-1 ${c.text}`}>{label}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </Tag>
  );
}
