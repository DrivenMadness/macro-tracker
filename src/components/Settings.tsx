import { useState, useEffect } from 'react';
import { getClaudeApiKey, setClaudeApiKey } from '../lib/claude';
import { useMacroTargets } from '../hooks/useMacroTargets';
import { useFoodDatabase } from '../hooks/useFoodDatabase';
import { useGoalWeight } from '../hooks/useGoalWeight';
import { useWeightLog } from '../hooks/useWeightLog';
import type { DayType } from '../lib/types';
import type { FoodItem } from '../lib/types';

const DAY_LABELS: Record<DayType, string> = {
  rest: 'Rest Day',
  lift: 'Lift Day',
};

const FIELDS: { key: keyof import('../lib/types').DayTarget; label: string; unit: string }[] = [
  { key: 'calories', label: 'Calories', unit: 'cal' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbs', label: 'Carbs', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
];

function formatProjectedDate(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  const { targets, updateDayTypeTarget } = useMacroTargets();
  const { foods, updateFood, deleteFood } = useFoodDatabase();
  const { goalLbs, setGoalLbs } = useGoalWeight();
  const { getProjectedDate, current7DayAvg, ratePerWeek } = useWeightLog();
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [goalInput, setGoalInput] = useState(goalLbs != null ? String(goalLbs) : '');

  useEffect(() => {
    setApiKey(getClaudeApiKey());
  }, []);

  useEffect(() => {
    setGoalInput(goalLbs != null ? String(goalLbs) : '');
  }, [goalLbs]);

  const projectedIso = goalLbs != null ? getProjectedDate(goalLbs) : null;

  const handleSaveKey = () => {
    setClaudeApiKey(apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-24">
      <div className="flex items-start justify-between gap-3 mb-6">
        <h2 className="text-xl font-bold text-[var(--color-text)]">Settings</h2>
        <div className="flex items-center gap-1.5 shrink-0" aria-label="NutriBuddy">
          <img src="/icons/chibi.svg" alt="" className="w-8 h-8" aria-hidden />
          <span className="text-sm font-bold text-[var(--color-text)]">NutriBuddy</span>
        </div>
      </div>

      {/* Goal weight */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-[var(--color-text-muted)] mb-3">
          Goal weight
        </h2>
        <p className="text-xs text-[var(--color-text-muted)] mb-3">
          Set a target weight to see a projected date based on your current trend.
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex-1 min-w-[80px]">
            <span className="sr-only">Goal weight (lbs)</span>
            <input
              type="number"
              min={50}
              max={999}
              step={0.5}
              placeholder="lbs"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onBlur={() => {
                const n = Number(goalInput);
                if (goalInput.trim() === '') setGoalLbs(null);
                else if (Number.isFinite(n) && n > 0) setGoalLbs(n);
              }}
              className="w-full rounded-2xl bg-[var(--color-card)] shadow-[var(--shadow-card)] px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] min-h-[48px] border-0"
            />
          </label>
          <span className="text-sm text-[var(--color-text-muted)] pb-2">lbs</span>
        </div>
        {projectedIso != null && ratePerWeek != null && ratePerWeek < 0 && (
          <p className="text-sm text-[var(--color-text-muted)] mt-2">
            At current rate (~{ratePerWeek} lbs/week), projected:{' '}
            <span className="font-medium text-[var(--color-text)]">
              {formatProjectedDate(projectedIso)}
            </span>
          </p>
        )}
      </section>

      {/* Macro targets */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-[var(--color-text-muted)] mb-3">
          Macro targets
        </h2>
        <p className="text-xs text-[var(--color-text-muted)] mb-4">
          Set your daily targets for Rest Day and Lift Day. Saved automatically.
        </p>
        <div className="space-y-6">
          {(['rest', 'lift'] as DayType[]).map((dayType) => (
            <div
              key={dayType}
              className="rounded-3xl bg-[var(--color-card)] p-4 shadow-[var(--shadow-card)]"
            >
              <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">
                {DAY_LABELS[dayType]}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {FIELDS.map(({ key, label, unit }) => (
                  <label key={key} className="block">
                    <span className="text-xs font-medium text-[var(--color-text-muted)]">
                      {label}
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={key === 'calories' ? 50 : 5}
                      value={targets[dayType][key]}
                      onChange={(e) =>
                        updateDayTypeTarget(dayType, key, Number(e.target.value) || 0)
                      }
                      className="block w-full rounded-2xl bg-[var(--color-bg)] px-3 py-2.5 text-[var(--color-text)] mt-1 min-h-[44px] border-0 shadow-[var(--shadow-card)]"
                    />
                    <span className="text-xs text-[var(--color-text-muted)] ml-1">
                      {unit}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {import.meta.env.DEV && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-2">
            Claude API key (for photo scan)
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mb-2">
            Dev only. In production, the key is set on the server.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="flex-1 rounded-2xl bg-[var(--color-card)] shadow-[var(--shadow-card)] px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] min-h-[44px] border-0"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={handleSaveKey}
              className="rounded-full bg-[var(--color-accent)] text-white font-semibold px-4 py-3 min-h-[44px] shrink-0 tap-bounce"
            >
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </section>
      )}

      {/* Manage Food Database */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-3">
          Manage Food Database
        </h2>
        <p className="text-xs text-[var(--color-text-muted)] mb-3">
          Tap a food to edit or delete it.
        </p>
        <div className="rounded-3xl bg-[var(--color-card)] shadow-[var(--shadow-card)] max-h-[320px] overflow-y-auto">
          {foods.length === 0 ? (
            <p className="p-4 text-center text-[var(--color-text-muted)] text-sm">
              No saved foods yet.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--color-card-soft)]">
              {foods.map((food) =>
                editingFoodId === food.id ? (
                  <li key={food.id}>
                    <FoodEditForm
                      food={food}
                      onSave={(updates) => {
                        updateFood(food.id, updates);
                        setEditingFoodId(null);
                      }}
                      onDelete={() => {
                        deleteFood(food.id);
                        setEditingFoodId(null);
                      }}
                      onCancel={() => setEditingFoodId(null)}
                    />
                  </li>
                ) : (
                  <li key={food.id}>
                    <button
                      type="button"
                      onClick={() => setEditingFoodId(food.id)}
                      className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left min-h-[48px] hover:bg-[var(--color-card-soft)] tap-bounce"
                    >
                      <span className="font-medium text-[var(--color-text)] truncate">
                        {food.name}
                      </span>
                      <span className="text-sm text-[var(--color-text-muted)] shrink-0">
                        {food.calories} cal · {food.protein}g P
                      </span>
                    </button>
                  </li>
                )
              )}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

interface FoodEditFormProps {
  food: FoodItem;
  onSave: (updates: Partial<FoodItem>) => void;
  onDelete: () => void;
  onCancel: () => void;
}

function FoodEditForm({
  food,
  onSave,
  onDelete,
  onCancel,
}: FoodEditFormProps) {
  const [name, setName] = useState(food.name);
  const [calories, setCalories] = useState(String(food.calories));
  const [protein, setProtein] = useState(String(food.protein));
  const [carbs, setCarbs] = useState(String(food.carbs));
  const [fat, setFat] = useState(String(food.fat));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim() || food.name,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="px-4 py-3 space-y-3 bg-[var(--color-card-soft)] border-t border-[var(--color-card-soft)]"
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Food name"
        className="w-full rounded-2xl bg-[var(--color-card)] shadow-[var(--shadow-card)] px-3 py-2 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] min-h-[44px] border-0"
      />
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-[var(--color-text-muted)]">
          Calories
          <input
            type="number"
            min={0}
            step={1}
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="block w-full rounded-2xl bg-[var(--color-card)] shadow-[var(--shadow-card)] px-3 py-2 text-[var(--color-text)] min-h-[44px] mt-0.5 border-0"
          />
        </label>
        <label className="text-xs text-[var(--color-text-muted)]">
          Protein (g)
          <input
            type="number"
            min={0}
            step={0.5}
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            className="block w-full rounded-2xl bg-[var(--color-card)] shadow-[var(--shadow-card)] px-3 py-2 text-[var(--color-text)] min-h-[44px] mt-0.5 border-0"
          />
        </label>
        <label className="text-xs text-[var(--color-text-muted)]">
          Carbs (g)
          <input
            type="number"
            min={0}
            step={0.5}
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            className="block w-full rounded-2xl bg-[var(--color-card)] shadow-[var(--shadow-card)] px-3 py-2 text-[var(--color-text)] min-h-[44px] mt-0.5 border-0"
          />
        </label>
        <label className="text-xs text-[var(--color-text-muted)]">
          Fat (g)
          <input
            type="number"
            min={0}
            step={0.5}
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            className="block w-full rounded-2xl bg-[var(--color-card)] shadow-[var(--shadow-card)] px-3 py-2 text-[var(--color-text)] min-h-[44px] mt-0.5 border-0"
          />
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-full bg-[var(--color-accent)] text-white font-semibold py-2 min-h-[44px] tap-bounce"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-card)] min-h-[44px] min-w-[44px] tap-bounce"
          aria-label="Cancel"
        >
          ×
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-full border-2 border-[var(--color-danger)] text-[var(--color-danger)] font-semibold px-3 py-2 min-h-[44px] tap-bounce"
        >
          Delete
        </button>
      </div>
    </form>
  );
}
