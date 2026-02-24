import { useState, useEffect } from 'react';
import { getClaudeApiKey, setClaudeApiKey } from '../lib/claude';
import { useMacroTargets } from '../hooks/useMacroTargets';
import type { DayType } from '../lib/types';

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

      <p className="text-[var(--color-text-muted)] text-sm">
        Manage food database coming in a later update.
      </p>
    </div>
  );
}
