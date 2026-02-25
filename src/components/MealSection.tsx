import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import type { MealEntry, MealType } from '../lib/types';
import type { FoodItem } from '../lib/types';

const PORTION_OPTIONS = [
  { value: 0.25, label: '¼' },
  { value: 0.5, label: '½' },
  { value: 0.75, label: '¾' },
  { value: 1, label: '1' },
  { value: 1.5, label: '1.5' },
  { value: 2, label: '2' },
] as const;

function formatPortionSuffix(quantity: number): string {
  if (quantity === 1) return '';
  const option = PORTION_OPTIONS.find((o) => o.value === quantity);
  if (option) return ` (${option.label})`;
  return ` (${quantity})`;
}

interface MealSectionProps {
  title: string;
  emoji?: string;
  mealType?: MealType;
  entries: MealEntry[];
  foodById: (id: string | null) => FoodItem | undefined;
  onAdd: (mealType?: MealType) => void;
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
  mealType,
  entries,
  foodById,
  onAdd,
  onRemove,
  onUpdateEntry,
}: MealSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [portionEntryId, setPortionEntryId] = useState<string | null>(null);

  const subtotal = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories * e.quantity,
      protein: acc.protein + e.protein * e.quantity,
      carbs: acc.carbs + e.carbs * e.quantity,
      fat: acc.fat + e.fat * e.quantity,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleAdd = () => onAdd(mealType);
  const toggleExpanded = () => setExpanded((e) => !e);

  const isEmpty = entries.length === 0;

  return (
    <section className="rounded-3xl bg-[var(--color-card)] overflow-hidden shadow-[var(--shadow-card)]">
      {/* Header: toggle button (left) + add or item count (right) */}
      <div className="w-full flex items-center gap-2 px-5 py-3.5 min-h-[48px]">
        <button
          type="button"
          onClick={toggleExpanded}
          className="flex items-center gap-2 min-w-0 flex-1 text-left tap-bounce"
          aria-expanded={expanded}
          aria-label={expanded ? `Collapse ${title}` : `Expand ${title}`}
        >
          {expanded ? (
            <ChevronDown className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" />
          ) : (
            <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" />
          )}
          {emoji && <span className="text-xl shrink-0" role="img" aria-hidden>{emoji}</span>}
          <span className="font-semibold text-[var(--color-text)] truncate">{title}</span>
        </button>
        {isEmpty ? (
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center justify-center rounded-full bg-[var(--color-accent)] text-white p-2.5 min-h-[44px] min-w-[44px] shrink-0 shadow-[var(--shadow-soft)] tap-bounce"
            aria-label={`Add food to ${title}`}
          >
            <Plus className="w-5 h-5" />
          </button>
        ) : (
          <span className="text-sm font-medium text-[var(--color-text-muted)] shrink-0">
            {entries.length} item{entries.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {expanded && (
        <div className="border-t border-[var(--color-card-soft)]">
          {isEmpty ? (
            <div className="px-5 py-6 flex flex-col items-center gap-3">
              <p className="text-sm text-[var(--color-text-muted)]">No items yet</p>
              <button
                type="button"
                onClick={handleAdd}
                className="flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] text-white font-semibold px-5 py-3 min-h-[48px] shadow-[var(--shadow-soft)] tap-bounce"
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
                const portionSuffix = formatPortionSuffix(entry.quantity);
                const cal = Math.round(entry.calories * entry.quantity);
                const pro = Math.round(entry.protein * entry.quantity);
                const isEditing = editingId === entry.id;
                const showPortionSelector = portionEntryId === entry.id;

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
                      <>
                        <div className="group flex items-center gap-2 px-5 py-3">
                          <button
                            type="button"
                            onClick={() => setPortionEntryId((current) => (current === entry.id ? null : entry.id))}
                            className="tap-row min-w-0 flex-1 flex items-center justify-between gap-2 text-left min-h-[52px] rounded-2xl hover:bg-[var(--color-card-soft)] transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-[var(--color-text)] truncate">
                                {displayName}
                                {portionSuffix && (
                                  <span className="text-[var(--color-text-muted)]">
                                    {portionSuffix}
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-[var(--color-text-muted)]">
                                {cal} cal · {pro}g protein
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setPortionEntryId(null);
                                setEditingId(entry.id);
                              }}
                              className="p-2 -m-2 rounded-xl shrink-0 opacity-0 group-hover:opacity-100 hover:bg-[var(--color-card-soft)] transition-opacity tap-bounce"
                              aria-label="Edit entry"
                            >
                              <Pencil className="w-4 h-4 text-[var(--color-text-muted)]" />
                            </button>
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
                        {showPortionSelector && (
                          <PortionSelector
                            currentQuantity={entry.quantity}
                            onSelect={(quantity) => {
                              onUpdateEntry(entry.id, { quantity });
                              setPortionEntryId(null);
                            }}
                            onEdit={() => {
                              setPortionEntryId(null);
                              setEditingId(entry.id);
                            }}
                            onClose={() => setPortionEntryId(null)}
                          />
                        )}
                      </>
                    )}
                  </li>
                );
              })}
            </ul>

          <div className="px-5 py-3 flex items-center justify-between border-t border-[var(--color-card-soft)] bg-[var(--color-card-soft)]">
            <span className="text-sm font-medium text-[var(--color-text-muted)]">
              Subtotal: {subtotal.calories} cal, {subtotal.protein}g protein
            </span>
            <button
              type="button"
              onClick={handleAdd}
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

interface PortionSelectorProps {
  currentQuantity: number;
  onSelect: (quantity: number) => void;
  onEdit: () => void;
  onClose: () => void;
}

function PortionSelector({
  currentQuantity,
  onSelect,
  onEdit,
  onClose,
}: PortionSelectorProps) {
  return (
    <div className="px-5 pb-3 pt-0 flex flex-col gap-2">
      <p className="text-xs font-medium text-[var(--color-text-muted)]">Portion</p>
      <div className="flex flex-wrap gap-2">
        {PORTION_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className={`tap-row rounded-full px-4 py-2.5 font-semibold min-h-[44px] transition-all ${
              currentQuantity === value
                ? 'bg-[var(--color-accent)] text-white shadow-[var(--shadow-soft)]'
                : 'bg-[var(--color-card-soft)] text-[var(--color-text)] shadow-[var(--shadow-card)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mt-1">
        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-medium text-[var(--color-accent)] min-h-[44px] tap-bounce"
        >
          Edit details
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-medium text-[var(--color-text-muted)] min-h-[44px] tap-bounce"
        >
          Done
        </button>
      </div>
    </div>
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
