
interface MacroHeroProps {
  calories: number;
  calorieTarget: number;
  protein: number;
  proteinTarget: number;
  carbs: number;
  carbsTarget: number;
  fat: number;
  fatTarget: number;
}

const RING_SIZE = 200;
const RING_STROKE = 14;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_CX = RING_SIZE / 2;
const RING_CY = RING_SIZE / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;

function CalorieRing({
  value,
  target,
}: {
  value: number;
  target: number;
}) {
  const isOver = target > 0 && value > target;
  const pct = target > 0 ? Math.min(value / target, 1) : 0;
  const dash = pct * RING_CIRCUMFERENCE;
  const displayValue = Math.round(value);
  const displayTarget = Math.round(target);
  const overAmount = isOver ? Math.round(value - target) : 0;

  const gradientId = 'calorie-ring-gradient';
  let strokeColor = 'var(--color-accent)';
  if (isOver) strokeColor = 'var(--color-danger)';
  else if (value <= target * 0.9) strokeColor = 'var(--color-accent)';
  else if (value <= target) strokeColor = 'var(--color-warning)';

  const textColor = isOver
    ? 'text-[var(--color-danger)]'
    : value <= target * 0.9
      ? 'text-[var(--color-accent)]'
      : 'text-[var(--color-warning)]';

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={RING_SIZE}
        height={RING_SIZE}
        className="-rotate-90 macro-hero-ring"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={1} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0.75} />
          </linearGradient>
        </defs>
        <circle
          cx={RING_CX}
          cy={RING_CY}
          r={RING_R}
          fill="none"
          stroke="var(--color-card-soft)"
          strokeWidth={RING_STROKE}
        />
        <circle
          cx={RING_CX}
          cy={RING_CY}
          r={RING_R}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={RING_STROKE}
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={RING_CIRCUMFERENCE - dash}
          strokeLinecap="round"
          className="macro-hero-ring-fill"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`text-5xl font-extrabold tabular-nums tracking-tight ${textColor} macro-hero-value`}
        >
          {displayValue.toLocaleString()}
        </span>
        <span className="text-sm font-medium text-[var(--color-text-muted)] mt-0.5">
          {isOver
            ? `${overAmount.toLocaleString()} over target`
            : `of ${displayTarget.toLocaleString()} cal`}
        </span>
      </div>
    </div>
  );
}

function MacroBar({
  label,
  value,
  target,
  gradientFrom,
  gradientTo,
}: {
  label: string;
  value: number;
  target: number;
  gradientFrom: string;
  gradientTo: string;
}) {
  const pct = target > 0 ? Math.min(value / target, 1.5) : 0;
  const displayValue = Math.round(value);
  const displayPct = target > 0 ? Math.round((value / target) * 100) : 0;

  return (
    <div className="flex flex-col gap-1.5 min-w-0 flex-1">
      <div className="flex items-baseline justify-between gap-1">
        <span className="text-xs font-medium text-[var(--color-text-muted)] truncate">
          {label}
        </span>
        <span className="text-xs font-semibold text-[var(--color-text)] tabular-nums shrink-0">
          {displayValue}g
          <span className="font-normal text-[var(--color-text-muted)] ml-0.5">
            {displayPct}%
          </span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--color-card-soft)] overflow-hidden">
        <div
          className="macro-bar-fill h-full rounded-full"
          style={{
            width: `${Math.min(pct * 100, 100)}%`,
            background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
          }}
        />
      </div>
    </div>
  );
}

export function MacroHero({
  calories,
  calorieTarget,
  protein,
  proteinTarget,
  carbs,
  carbsTarget,
  fat,
  fatTarget,
}: MacroHeroProps) {
  return (
    <div className="py-6">
      {/* Hero: calorie ring */}
      <div className="flex justify-center mb-8">
        <CalorieRing value={calories} target={calorieTarget} />
      </div>

      {/* Macro bars: protein, carbs, fat */}
      <div className="flex gap-4">
        <MacroBar
          label="Protein"
          value={protein}
          target={proteinTarget}
          gradientFrom="var(--color-protein)"
          gradientTo="rgba(107, 155, 209, 0.75)"
        />
        <MacroBar
          label="Carbs"
          value={carbs}
          target={carbsTarget}
          gradientFrom="var(--color-carbs)"
          gradientTo="rgba(232, 197, 71, 0.75)"
        />
        <MacroBar
          label="Fat"
          value={fat}
          target={fatTarget}
          gradientFrom="var(--color-fat)"
          gradientTo="rgba(224, 160, 176, 0.75)"
        />
      </div>
    </div>
  );
}
