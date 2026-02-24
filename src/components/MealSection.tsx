import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import type { MealEntry } from '../lib/types';
import type { FoodItem } from '../lib/types';

interface MealSectionProps {
  title: string;
  entries: MealEntry[];
  foodById: (id: string | null) => FoodItem | undefined;
  onAdd: () => void;
  onRemove: (entryId: string) => void;
}

export function MealSection({
  title,
  entries,
  foodById,
  onAdd,
  onRemove,
}: MealSectionProps) {
  const [expanded, setExpanded] = useState(true);

  const subtotal = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories * e.quantity,
      protein: acc.protein + e.protein * e.quantity,
      carbs: acc.carbs + e.carbs * e.quantity,
      fat: acc.fat + e.fat * e.quantity,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <section className="rounded-xl bg-[var(--color-card)] overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 min-h-[44px] text-left"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="w-5 h-5 text-[var(--color-text-muted)]" />
          ) : (
            <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)]" />
          )}
          <span className="font-medium text-[var(--color-text)]">{title}</span>
        </span>
        <span className="text-sm text-[var(--color-text-muted)]">
          {entries.length} item{entries.length !== 1 ? 's' : ''}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-white/10">
          {entries.length === 0 ? (
            <div className="px-4 py-6 flex flex-col items-center gap-2">
              <p className="text-sm text-[var(--color-text-muted)]">No items yet</p>
              <button
                type="button"
                onClick={onAdd}
                className="flex items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] text-[var(--color-bg)] font-medium px-4 py-3 min-h-[44px]"
              >
                <Plus className="w-5 h-5" />
                Add food
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-white/10">
              {entries.map((entry) => {
                const food = entry.food_item_id ? foodById(entry.food_item_id) : null;
                const name = entry.custom_name ?? food?.name ?? 'Unknown';
                const cal = Math.round(entry.calories * entry.quantity);
                const pro = Math.round(entry.protein * entry.quantity);
                return (
                  <li
                    key={entry.id}
                    className="group flex items-center justify-between gap-2 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[var(--color-text)] truncate">
                        {name}
                        {entry.quantity !== 1 && (
                          <span className="text-[var(--color-text-muted)] ml-1">
                            ×{entry.quantity}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {cal} cal · {pro}g protein
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(entry.id)}
                      className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-white/5 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {expanded && entries.length > 0 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-white/10 bg-black/20">
              <span className="text-sm text-[var(--color-text-muted)]">
                Subtotal: {subtotal.calories} cal, {subtotal.protein}g protein
              </span>
              <button
                type="button"
                onClick={onAdd}
                className="flex items-center justify-center gap-1 rounded-lg border border-[var(--color-accent)] text-[var(--color-accent)] font-medium px-3 py-2 min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
