import { useState, useEffect } from 'react';
import { getClaudeApiKey, setClaudeApiKey } from '../lib/claude';
import { useMacroTargets } from '../hooks/useMacroTargets';
import { useFoodDatabase } from '../hooks/useFoodDatabase';
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

export function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  const { targets, updateDayTypeTarget } = useMacroTargets();
  const { foods, updateFood, deleteFood } = useFoodDatabase();
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);

  useEffect(() => {
    setApiKey(getClaudeApiKey());
  }, []);

  const handleSaveKey = () => {
    setClaudeApiKey(apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-24">
      <h1 className="text-xl font-semibold text-[var(--color-text)] mb-6">
        Settings
      </h1>

      {/* Macro targets */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-3">
          Macro targets
        </h2>
        <p className="text-xs text-[var(--color-text-muted)] mb-4">
          Set your daily targets for Rest Day and Lift Day. Saved automatically.
        </p>
        <div className="space-y-6">
          {(['rest', 'lift'] as DayType[]).map((dayType) => (
            <div
              key={dayType}
              className="rounded-xl bg-[var(--color-card)] p-4 border border-white/10"
            >
              <h3 className="text-sm font-medium text-[var(--color-text)] mb-3">
                {DAY_LABELS[dayType]}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {FIELDS.map(({ key, label, unit }) => (
                  <label key={key} className="block">
                    <span className="text-xs text-[var(--color-text-muted)]">
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
                      className="block w-full rounded-lg bg-[var(--color-bg)] border border-white/10 px-3 py-2.5 text-[var(--color-text)] mt-1 min-h-[44px]"
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
              className="flex-1 rounded-xl bg-[var(--color-card)] border border-white/10 px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] min-h-[44px]"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={handleSaveKey}
              className="rounded-xl bg-[var(--color-accent)] text-[var(--color-bg)] font-medium px-4 py-3 min-h-[44px] shrink-0"
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
        <div className="rounded-xl bg-[var(--color-card)] border border-white/10 max-h-[320px] overflow-y-auto">
          {foods.length === 0 ? (
            <p className="p-4 text-center text-[var(--color-text-muted)] text-sm">
              No saved foods yet.
            </p>
          ) : (
            <ul className="divide-y divide-white/10">
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
                      className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left min-h-[44px] hover:bg-white/5"
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
      className="px-4 py-3 space-y-3 bg-white/5 border-t border-white/10"
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Food name"
        className="w-full rounded-lg bg-[var(--color-card)] border border-white/10 px-3 py-2 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] min-h-[44px]"
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
            className="block w-full rounded-lg bg-[var(--color-card)] border border-white/10 px-3 py-2 text-[var(--color-text)] min-h-[44px] mt-0.5"
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
            className="block w-full rounded-lg bg-[var(--color-card)] border border-white/10 px-3 py-2 text-[var(--color-text)] min-h-[44px] mt-0.5"
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
            className="block w-full rounded-lg bg-[var(--color-card)] border border-white/10 px-3 py-2 text-[var(--color-text)] min-h-[44px] mt-0.5"
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
            className="block w-full rounded-lg bg-[var(--color-card)] border border-white/10 px-3 py-2 text-[var(--color-text)] min-h-[44px] mt-0.5"
          />
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-[var(--color-accent)] text-[var(--color-bg)] font-medium py-2 min-h-[44px]"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-white/10 min-h-[44px] min-w-[44px]"
          aria-label="Cancel"
        >
          ×
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg border border-[var(--color-danger)] text-[var(--color-danger)] font-medium px-3 py-2 min-h-[44px]"
        >
          Delete
        </button>
      </div>
    </form>
  );
}
