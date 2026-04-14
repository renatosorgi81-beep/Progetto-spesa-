import type { ProductLocation } from '../types';
import { Refrigerator, Package, Snowflake, type LucideProps } from 'lucide-react';
import type { FC } from 'react';

interface LocationBadgeProps {
  location: ProductLocation;
  size?: 'sm' | 'md';
}

const configs: Record<ProductLocation, { label: string; bg: string; text: string; Icon: FC<LucideProps> }> = {
  frigo: { label: 'Frigo', bg: 'bg-sky-100', text: 'text-sky-600', Icon: Refrigerator },
  dispensa: { label: 'Dispensa', bg: 'bg-amber-100', text: 'text-amber-600', Icon: Package },
  freezer: { label: 'Freezer', bg: 'bg-indigo-100', text: 'text-indigo-600', Icon: Snowflake },
};

export function LocationBadge({ location, size = 'md' }: LocationBadgeProps) {
  const cfg = configs[location];
  const iconSize = size === 'sm' ? 10 : 12;
  const pad = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-0.5';

  return (
    <span className={`inline-flex items-center gap-1 rounded-md text-xs font-medium ${cfg.bg} ${cfg.text} ${pad}`}>
      <cfg.Icon size={iconSize} />
      {cfg.label}
    </span>
  );
}
