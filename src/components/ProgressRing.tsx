import type { ReactNode } from 'react';

interface ProgressRingProps {
  value: number;
  target: number;
  label: string;
  unit?: string;
  colorClass?: string;
  variant?: 'default' | 'calories';
  children?: ReactNode;
}

export function ProgressRing({
  value,
  target,
  label,
  unit = 'g',
  colorClass = 'text-[var(--color-accent)]',
  variant = 'default',
  children,
}: ProgressRingProps) {
  const pct = target > 0 ? Math.min(value / target, 1.5) : 0;
  const displayPct = target > 0 ? Math.round((value / target) * 100) : 0;
  const displayValue = Math.trunc(value);
  const displayTarget = Math.trunc(target);
  const stroke = 10;
  const r = 38;
  const circumference = 2 * Math.PI * r;
  const dash = pct * circumference;

  let strokeColor = 'var(--color-accent)';
  if (variant === 'calories') {
    if (value <= target * 0.9) strokeColor = 'var(--color-accent)';
    else if (value <= target) strokeColor = 'var(--color-warning)';
    else strokeColor = 'var(--color-danger)';
  }

  return (
    <div className="flex flex-col items-center gap-1.5 animate-pop-in">
      <div className="relative inline-flex items-center justify-center">
        <svg width="96" height="96" className="-rotate-90" aria-hidden>
          <circle
            cx="48"
            cy="48"
            r={r}
            fill="none"
            stroke="var(--color-card-soft)"
            strokeWidth={stroke}
          />
          <circle
            cx="48"
            cy="48"
            r={r}
            fill="none"
            stroke={strokeColor}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - dash}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-500 ease-out"
          />
        </svg>
        <span className="absolute text-sm font-bold text-[var(--color-text)]">
          {children ?? `${displayPct}%`}
        </span>
      </div>
      <span className="text-xs font-medium text-[var(--color-text-muted)]">{label}</span>
      <span className={`text-xs font-semibold ${colorClass}`}>
        {displayValue} / {displayTarget} {unit}
      </span>
    </div>
  );
}
