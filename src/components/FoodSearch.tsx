import { useState, useMemo, useCallback } from 'react';
import { Search } from 'lucide-react';
import type { FoodItem } from '../lib/types';
import { fuzzySearchFoods } from '../hooks/useFoodDatabase';

interface FoodSearchProps {
  foods: FoodItem[];
  onSelect: (food: FoodItem, quantity: number) => void;
  onClose?: () => void;
}

const QUANTITIES = [0.5, 1, 1.5, 2];

export function FoodSearch({ foods, onSelect, onClose }: FoodSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Local filter only — no API/Supabase calls on keystroke
  const results = useMemo(
    () => fuzzySearchFoods(foods, query),
    [foods, query]
  );

  const handleSelect = useCallback(
    (food: FoodItem) => {
      onSelect(food, selectedQuantity);
      onClose?.();
    },
    [onSelect, onClose, selectedQuantity]
  );

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <div className="flex items-center gap-2 rounded-2xl bg-[var(--color-card)] shadow-[var(--shadow-card)] px-4 py-2.5 mb-3">
        <Search className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" />
        <input
          type="search"
          placeholder="Search foods..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none min-h-[44px]"
          autoFocus
          autoComplete="off"
        />
      </div>

      <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2">
        Quantity
      </p>
      <div className="flex gap-2 mb-4 flex-wrap">
        {QUANTITIES.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setSelectedQuantity(q)}
            className={`rounded-full px-4 py-2.5 font-semibold min-h-[44px] transition-all tap-bounce ${
              selectedQuantity === q
                ? 'bg-[var(--color-accent)] text-white shadow-[var(--shadow-soft)]'
                : 'bg-[var(--color-card)] text-[var(--color-text-muted)] shadow-[var(--shadow-card)]'
            }`}
          >
            {q === 1 ? '1×' : `${q}×`}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto rounded-2xl bg-[var(--color-card)] shadow-[var(--shadow-card)]">
        {results.length === 0 ? (
          <p className="p-4 text-center text-[var(--color-text-muted)]">
            {query.trim() ? 'No foods match your search.' : 'Type to search foods.'}
          </p>
        ) : (
          <ul className="divide-y divide-[var(--color-card-soft)]">
            {results.map((food) => (
              <li key={food.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(food)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left min-h-[48px] hover:bg-[var(--color-card-soft)] transition-colors rounded-xl tap-bounce animate-pop-in"
                >
                  <span className="font-semibold text-[var(--color-text)] truncate">
                    {food.name}
                  </span>
                  <span className="text-sm text-[var(--color-text-muted)] shrink-0">
                    {food.calories} cal · {food.protein}g P
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
