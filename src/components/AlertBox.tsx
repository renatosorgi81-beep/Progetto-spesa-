import { AlertTriangle, Lightbulb, CheckCircle, Info, type LucideProps } from 'lucide-react';
import type { FC } from 'react';

type AlertType = 'warning' | 'tip' | 'success' | 'info';

interface AlertBoxProps {
  type: AlertType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const configs: Record<AlertType, {
  bg: string;
  border: string;
  title: string;
  desc: string;
  Icon: FC<LucideProps>;
  iconColor: string;
}> = {
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    title: 'text-amber-800',
    desc: 'text-amber-700',
    Icon: AlertTriangle,
    iconColor: 'text-amber-500',
  },
  tip: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    title: 'text-emerald-800',
    desc: 'text-emerald-700',
    Icon: Lightbulb,
    iconColor: 'text-emerald-500',
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    title: 'text-green-800',
    desc: 'text-green-700',
    Icon: CheckCircle,
    iconColor: 'text-green-500',
  },
  info: {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    title: 'text-sky-800',
    desc: 'text-sky-700',
    Icon: Info,
    iconColor: 'text-sky-500',
  },
};

export function AlertBox({ type, title, description, action }: AlertBoxProps) {
  const cfg = configs[type];

  return (
    <div className={`${cfg.bg} border ${cfg.border} rounded-2xl p-4`}>
      <div className="flex gap-3">
        <cfg.Icon size={18} className={`${cfg.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className={`text-sm font-semibold ${cfg.title}`}>{title}</p>
          {description && <p className={`text-xs mt-0.5 ${cfg.desc}`}>{description}</p>}
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-2 text-xs font-semibold underline underline-offset-2 ${cfg.title}`}
            >
              {action.label} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
