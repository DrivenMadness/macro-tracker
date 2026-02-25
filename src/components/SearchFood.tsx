import { useState } from 'react';
import { ArrowLeft, Loader2, Search, Check } from 'lucide-react';
import { estimateFoodFromDescription, getClaudeApiKey } from '../lib/claude';
import type { EstimatedFood } from '../lib/types';

type Step = 'input' | 'loading' | 'edit' | 'error';

interface SearchFoodProps {
  onBack: () => void;
  onConfirm: (items: EstimatedFood[], saveToDb: boolean) => void;
}

const FIELDS: { key: keyof EstimatedFood; label: string }[] = [
  { key: 'calories', label: 'Calories' },
  { key: 'protein', label: 'Protein (g)' },
  { key: 'carbs', label: 'Carbs (g)' },
  { key: 'fat', label: 'Fat (g)' },
  { key: 'fiber', label: 'Fiber (g)' },
];

export function SearchFood({ onBack, onConfirm }: SearchFoodProps) {
  const [step, setStep] = useState<Step>('input');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [estimated, setEstimated] = useState<EstimatedFood[]>([]);
  const [saveToDb, setSaveToDb] = useState(false);

  const apiKey = getClaudeApiKey();
  const useProxy = import.meta.env.PROD;
  const canSearch = useProxy || !!apiKey;

  async function handleSearch() {
    const q = query.trim();
    if (!q) return;
    if (!canSearch) {
      setError('Add your Claude API key in Settings first.');
      setStep('error');
      return;
    }

    setError('');
    setStep('loading');

    try {
      const items = await estimateFoodFromDescription(apiKey, q);
      setEstimated(
        items.length > 0 ? items : [{ name: 'Unknown', calories: 0, protein: 0, carbs: 0, fat: 0 }]
      );
      setStep('edit');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed.');
      setStep('error');
    }
  }

  function updateItem(
    index: number,
    field: keyof EstimatedFood,
    value: string | number | undefined
  ) {
    setEstimated((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }

  function removeItem(index: number) {
    setEstimated((prev) => prev.filter((_, i) => i !== index));
  }

  function handleConfirm() {
    const valid = estimated.filter((e) => e.name.trim());
    if (valid.length) onConfirm(valid, saveToDb);
    onBack();
  }

  if (step === 'error') {
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
        <div className="flex-1 flex flex-col justify-center py-6">
          <p className="text-[var(--color-danger)] font-medium mb-4">{error}</p>
          <button
            type="button"
            onClick={() => {
              setStep('input');
              setError('');
            }}
            className="rounded-full bg-[var(--color-card)] shadow-[var(--shadow-card)] text-[var(--color-text)] px-4 py-3 min-h-[44px] tap-bounce"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (step === 'loading') {
    return (
      <div className="flex flex-col h-full items-center justify-center py-12">
        <Loader2 className="w-10 h-10 text-[var(--color-accent)] animate-spin mb-4" />
        <p className="text-[var(--color-text-muted)]">Estimating macros…</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 text-sm text-[var(--color-text-muted)] min-h-[44px]"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (step === 'edit') {
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
        <p className="text-sm text-[var(--color-text-muted)] mb-3">
          Review and edit, then add to today&apos;s log.
        </p>
        <ul className="space-y-4 mb-4">
          {estimated.map((item, index) => (
            <li
              key={index}
              className="rounded-2xl bg-[var(--color-card)] shadow-[var(--shadow-card)] p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  className="flex-1 rounded-2xl bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] min-h-[44px] border-0 shadow-[var(--shadow-card)]"
                  placeholder="Food name"
                />
                {estimated.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-[var(--color-danger)] text-sm px-2 py-1 min-h-[44px]"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {FIELDS.map(({ key, label }) => (
                  <label key={key} className="text-xs text-[var(--color-text-muted)]">
                    {label}
                    <input
                      type="number"
                      min={0}
                      step={key === 'calories' ? 1 : 0.5}
                      value={item[key] ?? ''}
                      onChange={(e) =>
                        updateItem(
                          index,
                          key,
                          e.target.value === '' ? (key === 'fiber' ? undefined : 0) : Number(e.target.value)
                        )
                      }
                      className="block w-full rounded-2xl bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] mt-0.5 min-h-[44px] border-0 shadow-[var(--shadow-card)]"
                    />
                  </label>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <label className="flex items-center gap-2 mb-4 min-h-[44px] cursor-pointer">
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
          type="button"
          onClick={handleConfirm}
          className="flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] text-white font-semibold px-4 py-3 min-h-[48px] shadow-[var(--shadow-soft)] tap-bounce"
        >
          <Check className="w-5 h-5" />
          Add to today&apos;s log
        </button>
      </div>
    );
  }

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
      {!canSearch && (
        <p className="text-sm text-[var(--color-warning)] mb-3">
          Add your Claude API key in Settings to use Search Food.
        </p>
      )}
      <label className="text-sm font-medium text-[var(--color-text-muted)] mb-1 block">
        Search Food
      </label>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="e.g. medium avocado, 2 eggs and toast"
          className="flex-1 rounded-2xl bg-[var(--color-card)] shadow-[var(--shadow-card)] px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] min-h-[48px] border-0"
          autoFocus
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={!query.trim() || !canSearch}
          className="rounded-full bg-[var(--color-accent)] text-white font-semibold px-4 py-3 min-h-[48px] shadow-[var(--shadow-soft)] tap-bounce disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          Search
        </button>
      </div>
    </div>
  );
}
