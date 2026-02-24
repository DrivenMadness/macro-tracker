import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import type { MealEntry } from '../lib/types';
import type { FoodItem } from '../lib/types';

interface MealSectionProps {
  title: string;
  emoji?: string;
  entries: MealEntry[];
  foodById: (id: string | null) => FoodItem | undefined;
  onAdd: () => void;
  onRemove: (entryId: string) => void;
  onUpdateEntry: (
    entryId: string,
    updates: Partial<{
      custom_name: string | null;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      quantity: number;
    }>
  ) => void;
}

export function MealSection({
  title,
  emoji,
  entries,
  foodById,
  onAdd,
  onRemove,
  onUpdateEntry,
}: MealSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

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
    <section className="rounded-3xl bg-[var(--color-card)] overflow-hidden shadow-[var(--shadow-card)] tap-bounce">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between gap-2 px-5 py-3.5 min-h-[48px] text-left"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="w-5 h-5 text-[var(--color-text-muted)]" />
          ) : (
            <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)]" />
          )}
          {emoji && <span className="text-xl" role="img" aria-hidden>{emoji}</span>}
          <span className="font-semibold text-[var(--color-text)]">{title}</span>
        </span>
        <span className="text-sm font-medium text-[var(--color-text-muted)]">
          {entries.length} item{entries.length !== 1 ? 's' : ''}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-[var(--color-card-soft)]">
          {entries.length === 0 ? (
            <div className="px-5 py-6 flex flex-col items-center gap-3">
              <p className="text-sm text-[var(--color-text-muted)]">No items yet</p>
              <button
                type="button"
                onClick={onAdd}
                className="flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] text-white font-semibold px-5 py-3 min-h-[48px] shadow-[var(--shadow-soft)] tap-bounce animate-pop-in"
              >
                <Plus className="w-5 h-5" />
                Add food
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--color-card-soft)]">
              {entries.map((entry) => {
                const food = entry.food_item_id ? foodById(entry.food_item_id) : null;
                const displayName = entry.custom_name ?? food?.name ?? 'Unknown';
                const cal = Math.round(entry.calories * entry.quantity);
                const pro = Math.round(entry.protein * entry.quantity);
                const isEditing = editingId === entry.id;

                return (
                  <li key={entry.id}>
                    {isEditing ? (
                      <EntryEditForm
                        entry={entry}
                        displayName={displayName}
                        onSave={(updates) => {
                          onUpdateEntry(entry.id, updates);
                          setEditingId(null);
                        }}
                        onDelete={() => {
                          onRemove(entry.id);
                          setEditingId(null);
                        }}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <div className="group flex items-center gap-2 px-5 py-3">
                        <button
                          type="button"
                          onClick={() => setEditingId(entry.id)}
                          className="min-w-0 flex-1 flex items-center justify-between gap-2 text-left min-h-[48px] rounded-2xl hover:bg-[var(--color-card-soft)] transition-colors tap-bounce"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-[var(--color-text)] truncate">
                              {displayName}
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
                          <Pencil className="w-4 h-4 text-[var(--color-text-muted)] shrink-0 opacity-0 group-hover:opacity-100" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove(entry.id);
                          }}
                          className="p-2 rounded-2xl text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-card-soft)] min-h-[48px] min-w-[48px] flex items-center justify-center transition-colors tap-bounce"
                          aria-label="Remove"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {expanded && entries.length > 0 && (
            <div className="px-5 py-3 flex items-center justify-between border-t border-[var(--color-card-soft)] bg-[var(--color-card-soft)]">
              <span className="text-sm font-medium text-[var(--color-text-muted)]">
                Subtotal: {subtotal.calories} cal, {subtotal.protein}g protein
              </span>
              <button
                type="button"
                onClick={onAdd}
                className="flex items-center justify-center gap-1 rounded-full border-2 border-[var(--color-accent)] text-[var(--color-accent)] font-semibold px-4 py-2 min-h-[44px] tap-bounce"
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

interface EntryEditFormProps {
  entry: MealEntry;
  displayName: string;
  onSave: (updates: {
    custom_name: string | null;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    quantity: number;
  }) => void;
  onDelete: () => void;
  onCancel: () => void;
}

function EntryEditForm({
  entry,
  displayName,
  onSave,
  onDelete,
  onCancel,
}: EntryEditFormProps) {
  const [name, setName] = useState(displayName);
  const [calories, setCalories] = useState(String(entry.calories));
  const [protein, setProtein] = useState(String(entry.protein));
  const [carbs, setCarbs] = useState(String(entry.carbs));
  const [fat, setFat] = useState(String(entry.fat));
  const [quantity, setQuantity] = useState(String(entry.quantity));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      custom_name: name.trim() || null,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      quantity: Number(quantity) || 1,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="px-5 py-3 space-y-3 bg-[var(--color-card-soft)] border-y border-[var(--color-card-soft)] rounded-b-2xl">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Food name"
        className="w-full rounded-2xl bg-[var(--color-card)] shadow-[var(--shadow-card)] border-0 px-4 py-2.5 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] min-h-[48px]"
      />
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs font-medium text-[var(--color-text-muted)]">
          Cal
          <input
            type="number"
            min={0}
            step={1}
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="block w-full rounded-2xl bg-[var(--color-card)] shadow-[var(--shadow-card)] border-0 px-3 py-2 text-[var(--color-text)] min-h-[44px] mt-0.5"
          />
        </label>
        <label className="text-xs font-medium text-[var(--color-text-muted)]">
          Protein (g)
          <input
            type="number"
            min={0}
            step={0.5}
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            className="block w-full rounded-2xl bg-[var(--color-card)] shadow-[var(--shadow-card)] border-0 px-3 py-2 text-[var(--color-text)] min-h-[44px] mt-0.5"
          />
        </label>
        <label className="text-xs font-medium text-[var(--color-text-muted)]">
          Carbs (g)
          <input
            type="number"
            min={0}
            step={0.5}
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            className="block w-full rounded-2xl bg-[var(--color-card)] shadow-[var(--shadow-card)] border-0 px-3 py-2 text-[var(--color-text)] min-h-[44px] mt-0.5"
          />
        </label>
        <label className="text-xs font-medium text-[var(--color-text-muted)]">
          Fat (g)
          <input
            type="number"
            min={0}
            step={0.5}
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            className="block w-full rounded-2xl bg-[var(--color-card)] shadow-[var(--shadow-card)] border-0 px-3 py-2 text-[var(--color-text)] min-h-[44px] mt-0.5"
          />
        </label>
        <label className="text-xs font-medium text-[var(--color-text-muted)] col-span-2">
          Quantity
          <input
            type="number"
            min={0.25}
            step={0.25}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="block w-full rounded-2xl bg-[var(--color-card)] shadow-[var(--shadow-card)] border-0 px-3 py-2 text-[var(--color-text)] min-h-[44px] mt-0.5"
          />
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 flex items-center justify-center gap-1 rounded-full bg-[var(--color-accent)] text-white font-semibold py-2.5 min-h-[48px] shadow-[var(--shadow-soft)] tap-bounce"
        >
          <Check className="w-4 h-4" />
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-card)] min-h-[48px] min-w-[48px] flex items-center justify-center tap-bounce"
          aria-label="Cancel"
        >
          <X className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex items-center justify-center gap-1 rounded-full border-2 border-[var(--color-danger)] text-[var(--color-danger)] font-semibold px-3 py-2 min-h-[48px] tap-bounce"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </form>
  );
}
