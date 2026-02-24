import { useMemo } from 'react';
import { useDailyLog } from '../hooks/useDailyLog';
import { useMacroTargets } from '../hooks/useMacroTargets';
import { useFoodDatabase } from '../hooks/useFoodDatabase';
import { ProgressRing } from './ProgressRing';
import { MealSection } from './MealSection';

const DAY_LABELS: Record<string, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

interface DashboardProps {
  dailyLog: ReturnType<typeof useDailyLog>;
  onAddFood: () => void;
}

export function Dashboard({ dailyLog, onAddFood }: DashboardProps) {
  const { log, setDayType, entries, totals, removeEntry, goToToday, date } =
    dailyLog;
  const { targets } = useMacroTargets();
  const { foods } = useFoodDatabase();

  const dayLabel = useMemo(() => {
    if (!date) return '';
    const d = new Date(date + 'T12:00:00');
    const short = d.toLocaleDateString('en-US', { weekday: 'short' });
    return DAY_LABELS[short] ?? short;
  }, [date]);

  const foodById = useMemo(() => {
    const map = new Map(foods.map((f) => [f.id, f]));
    return (id: string | null) => (id ? map.get(id) : undefined);
  }, [foods]);

  if (!log) return null;

  const t = targets[log.day_type];
  const calorieColor =
    totals.calories <= t.calories * 0.9
      ? 'text-[var(--color-accent)]'
      : totals.calories <= t.calories
        ? 'text-[var(--color-warning)]'
        : 'text-[var(--color-danger)]';

  return (
    <div className="max-w-lg mx-auto px-4 pb-6">
      {/* Date + Day type toggle */}
      <div className="py-4">
        <button
          type="button"
          onClick={goToToday}
          className="text-left"
        >
          <p className="text-2xl font-semibold text-[var(--color-text)]">
            {dayLabel}
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">{date}</p>
        </button>

        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => setDayType('rest')}
            className={`flex-1 rounded-xl py-3 px-4 font-medium min-h-[44px] transition-colors ${
              log.day_type === 'rest'
                ? 'bg-[var(--color-accent)] text-[var(--color-bg)]'
                : 'bg-[var(--color-card)] text-[var(--color-text-muted)]'
            }`}
          >
            Rest Day
          </button>
          <button
            type="button"
            onClick={() => setDayType('lift')}
            className={`flex-1 rounded-xl py-3 px-4 font-medium min-h-[44px] transition-colors ${
              log.day_type === 'lift'
                ? 'bg-[var(--color-accent)] text-[var(--color-bg)]'
                : 'bg-[var(--color-card)] text-[var(--color-text-muted)]'
            }`}
          >
            Lift Day
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
        <ProgressRing
          value={totals.calories}
          target={t.calories}
          label="Calories"
          unit="cal"
          variant="calories"
          colorClass={calorieColor}
        />
        <ProgressRing
          value={totals.protein}
          target={t.protein}
          label="Protein"
          colorClass="text-[var(--color-protein)]"
        />
        <ProgressRing
          value={totals.carbs}
          target={t.calories / 4}
          label="Carbs"
          colorClass="text-[var(--color-carbs)]"
        />
        <ProgressRing
          value={totals.fat}
          target={t.calories / 9}
          label="Fat"
          colorClass="text-[var(--color-fat)]"
        />
      </div>

      {/* Today's log */}
      <div className="space-y-3">
        <MealSection
          title="Today"
          entries={entries}
          foodById={foodById}
          onAdd={onAddFood}
          onRemove={removeEntry}
        />
      </div>
    </div>
  );
}
