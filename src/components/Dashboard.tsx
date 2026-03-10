import { useMemo } from 'react';
import { useDailyLog } from '../hooks/useDailyLog';
import { useMacroTargets } from '../hooks/useMacroTargets';
import type { FoodItem, MealType } from '../lib/types';
import { MacroHero } from './MacroHero';
import { MealSection } from './MealSection';

const MEAL_SECTIONS: { type: MealType; title: string }[] = [
  { type: 'breakfast', title: 'Breakfast' },
  { type: 'lunch', title: 'Lunch' },
  { type: 'snack', title: 'Snack' },
  { type: 'dinner', title: 'Dinner' },
];

function formatShortDate(date: string): string {
  const d = new Date(date + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

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
  onAddFood: (mealType?: MealType) => void;
  foods: FoodItem[];
}

export function Dashboard({ dailyLog, onAddFood, foods }: DashboardProps) {
  const { log, setDayType, entries, totals, removeEntry, updateEntry, goToToday, goToPrevDay, goToNextDay, isToday, date } =
    dailyLog;
  const { targets } = useMacroTargets();

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

  return (
    <div className="max-w-lg mx-auto px-4 pb-32">
      {/* Date nav */}
      <div className="py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPrevDay}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--color-card)] shadow-[var(--shadow-card)] tap-bounce text-[var(--color-text)]"
            aria-label="Previous day"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="text-left">
            <p className="text-2xl font-bold text-[var(--color-text)]">
              {isToday ? 'Today' : dayLabel}
            </p>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{formatShortDate(date)}</p>
          </div>
          <button
            type="button"
            onClick={goToNextDay}
            disabled={isToday}
            className={`w-9 h-9 flex items-center justify-center rounded-full bg-[var(--color-card)] shadow-[var(--shadow-card)] tap-bounce ${isToday ? 'opacity-30 cursor-default' : 'text-[var(--color-text)]'}`}
            aria-label="Next day"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
        {!isToday && (
          <button
            type="button"
            onClick={goToToday}
            className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--color-accent)] text-white tap-bounce"
          >
            Today
          </button>
        )}
      </div>

      {/* Day type toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setDayType('rest')}
          className={`flex-1 rounded-full py-2.5 px-4 font-semibold text-sm min-h-[44px] transition-all duration-200 tap-bounce ${
            log.day_type === 'rest'
              ? 'bg-[var(--color-accent)] text-white shadow-[var(--shadow-soft)]'
              : 'bg-[var(--color-card)] text-[var(--color-text-muted)] shadow-[var(--shadow-card)]'
          }`}
        >
          Rest Day
        </button>
        <button
          type="button"
          onClick={() => setDayType('lift')}
          className={`flex-1 rounded-full py-2.5 px-4 font-semibold text-sm min-h-[44px] transition-all duration-200 tap-bounce ${
            log.day_type === 'lift'
              ? 'bg-[var(--color-accent)] text-white shadow-[var(--shadow-soft)]'
              : 'bg-[var(--color-card)] text-[var(--color-text-muted)] shadow-[var(--shadow-card)]'
          }`}
        >
          Lift Day
        </button>
      </div>

      {/* Macro hero */}
      <MacroHero
        calories={totals.calories}
        calorieTarget={t.calories}
        protein={totals.protein}
        proteinTarget={t.protein}
        carbs={totals.carbs}
        carbsTarget={t.carbs}
        fat={totals.fat}
        fatTarget={t.fat}
      />

      {/* Meal sections */}
      <div className="space-y-4">
        {MEAL_SECTIONS.map(({ type, title }) => (
          <MealSection
            key={type}
            title={title}
            mealType={type}
            entries={entries.filter((e) => e.meal_type === type)}
            foodById={foodById}
            onAdd={onAddFood}
            onRemove={removeEntry}
            onUpdateEntry={updateEntry}
          />
        ))}
      </div>
    </div>
  );
}
