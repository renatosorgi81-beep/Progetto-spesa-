import type { ProductStatus } from '../types';

interface ExpiryBadgeProps {
  status: ProductStatus;
  expiryDate: string;
  size?: 'sm' | 'md';
}

function daysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function ExpiryBadge({ status, expiryDate, size = 'md' }: ExpiryBadgeProps) {
  const days = daysUntilExpiry(expiryDate);

  const configs = {
    scaduto: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      dot: 'bg-red-500',
      label: 'Scaduto',
    },
    in_scadenza: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
      label: days === 0 ? 'Scade oggi' : `Scade in ${days}g`,
    },
    quasi_finito: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      dot: 'bg-orange-500',
      label: 'Quasi finito',
    },
    ok: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
      label: days > 30 ? 'Ottimo' : `${days}g`,
    },
  };

  const cfg = configs[status];
  const textSize = size === 'sm' ? 'text-xs' : 'text-xs';
  const padSize = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${cfg.bg} ${cfg.text} ${textSize} ${padSize}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export { daysUntilExpiry };
