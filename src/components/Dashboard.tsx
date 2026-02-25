import { useMemo } from 'react';
import { useDailyLog } from '../hooks/useDailyLog';
import { useMacroTargets } from '../hooks/useMacroTargets';
import type { FoodItem, MealType } from '../lib/types';
import { MacroHero } from './MacroHero';
import { MealSection } from './MealSection';

const MEAL_SECTIONS: { type: MealType; title: string; emoji: string }[] = [
  { type: 'breakfast', title: 'Breakfast', emoji: '🌅' },
  { type: 'lunch', title: 'Lunch', emoji: '☀️' },
  { type: 'snack', title: 'Snack', emoji: '🍎' },
  { type: 'dinner', title: 'Dinner', emoji: '🌙' },
];

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
  const { log, setDayType, entries, totals, removeEntry, updateEntry, goToToday, date } =
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
      {/* Date + Day type toggle */}
      <div className="py-5 flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={goToToday}
          className="text-left tap-bounce shrink-0"
        >
          <p className="text-2xl font-bold text-[var(--color-text)]">
            {dayLabel}
          </p>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{date}</p>
        </button>
        <div className="flex items-center gap-1.5 shrink-0 pt-0.5" aria-label="NutriBuddy">
          <img src="/icons/chibi.svg" alt="" className="w-8 h-8" aria-hidden />
          <span className="text-sm font-bold text-[var(--color-text)]">NutriBuddy</span>
        </div>
      </div>

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={() => setDayType('rest')}
            className={`flex-1 rounded-full py-3 px-4 font-semibold min-h-[48px] transition-all duration-200 tap-bounce ${
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
            className={`flex-1 rounded-full py-3 px-4 font-semibold min-h-[48px] transition-all duration-200 tap-bounce ${
              log.day_type === 'lift'
                ? 'bg-[var(--color-accent)] text-white shadow-[var(--shadow-soft)]'
                : 'bg-[var(--color-card)] text-[var(--color-text-muted)] shadow-[var(--shadow-card)]'
            }`}
          >
            Lift Day
          </button>
        </div>

      {/* Macro hero: calories ring + protein / carbs / fat bars */}
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

      {/* Meal sections: Breakfast, Lunch, Snack, Dinner */}
      <div className="space-y-4">
        {MEAL_SECTIONS.map(({ type, title, emoji }) => (
          <MealSection
            key={type}
            title={title}
            emoji={emoji}
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
