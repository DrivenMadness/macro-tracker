import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';

interface ManualAddProps {
  onBack: () => void;
  onSubmit: (entry: {
    custom_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }, saveToDb: boolean) => void;
}

export function ManualAdd({ onBack, onSubmit }: ManualAddProps) {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [saveToDb, setSaveToDb] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim() || 'Unknown';
    const c = Number(calories) || 0;
    const p = Number(protein) || 0;
    const cb = Number(carbs) || 0;
    const f = Number(fat) || 0;
    onSubmit({ custom_name: n, calories: c, protein: p, carbs: cb, fat: f }, saveToDb);
  };

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-[var(--color-text-muted)] py-2 -ml-1 min-h-[44px] tap-bounce"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <label className="block">
          <span className="text-sm font-medium text-[var(--color-text-muted)]">Food name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Grilled chicken breast"
            className="block w-full rounded-2xl bg-[var(--color-card)] shadow-[var(--shadow-card)] px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] mt-1 min-h-[48px] border-0"
            autoFocus
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          {[
            { value: calories, set: setCalories, label: 'Calories', placeholder: '0' },
            { value: protein, set: setProtein, label: 'Protein (g)', placeholder: '0' },
            { value: carbs, set: setCarbs, label: 'Carbs (g)', placeholder: '0' },
            { value: fat, set: setFat, label: 'Fat (g)', placeholder: '0' },
          ].map(({ value, set, label, placeholder }) => (
            <label key={label} className="block">
              <span className="text-sm font-medium text-[var(--color-text-muted)]">{label}</span>
              <input
                type="number"
                min={0}
                step={label === 'Calories' ? 1 : 0.5}
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                className="block w-full rounded-2xl bg-[var(--color-card)] shadow-[var(--shadow-card)] px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] mt-1 min-h-[48px] border-0"
              />
            </label>
          ))}
        </div>

        <label className="flex items-center gap-2 min-h-[48px] cursor-pointer">
          <input
            type="checkbox"
            checked={saveToDb}
            onChange={(e) => setSaveToDb(e.target.checked)}
            className="rounded border-2 border-[var(--color-text-muted)]"
          />
          <span className="text-sm text-[var(--color-text-muted)]">
            Save to food database for future search
          </span>
        </label>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] text-white font-semibold px-4 py-3 min-h-[48px] shadow-[var(--shadow-soft)] tap-bounce"
        >
          <Check className="w-5 h-5" />
          Add to today&apos;s log
        </button>
      </form>
    </div>
  );
}
