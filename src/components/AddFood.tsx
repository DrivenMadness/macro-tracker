import { useState } from 'react';
import { X, Camera, Edit3, Globe } from 'lucide-react';
import { FoodSearch } from './FoodSearch';
import { PhotoScan } from './PhotoScan';
import { ManualAdd } from './ManualAdd';
import { SearchFood } from './SearchFood';
import type { FoodItem, MealType } from '../lib/types';
import type { EstimatedFood } from '../lib/types';

interface AddFoodProps {
  initialMealType?: MealType | null;
  onAdd: (
    entry: {
      food_item_id: string | null;
      custom_name: string | null;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber?: number;
      quantity?: number;
    },
    mealType?: MealType
  ) => void;
  onPhotoScanConfirm: (items: EstimatedFood[], saveToDb: boolean) => void;
  onManualAdd: (entry: { custom_name: string; calories: number; protein: number; carbs: number; fat: number }, saveToDb: boolean) => void;
  onClose: () => void;
  foods: FoodItem[];
}

export function AddFood({ initialMealType, onAdd, onPhotoScanConfirm, onManualAdd, onClose, foods }: AddFoodProps) {
  const [view, setView] = useState<'search' | 'photo' | 'manual' | 'searchFood'>('search');
  const mealType = initialMealType ?? 'breakfast';

  const handleSelect = (food: FoodItem, quantity: number) => {
    onAdd(
      {
        food_item_id: food.id,
        custom_name: null,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
        quantity,
      },
      mealType
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-bg)] flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-card-soft)] shrink-0 bg-[var(--color-card)] shadow-[var(--shadow-card)]">
        <h2 className="text-lg font-bold text-[var(--color-text)]">Add food</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-card-soft)] min-h-[44px] min-w-[44px] flex items-center justify-center tap-bounce"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-4 py-4">
        {view === 'search' && (
          <>
            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={() => setView('searchFood')}
                className="w-full flex items-center gap-4 rounded-2xl bg-[var(--color-card)] shadow-[var(--shadow-card)] border border-[var(--color-card-soft)] p-4 text-left tap-bounce hover:bg-[var(--color-card-soft)] transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center shrink-0">
                  <Globe className="w-6 h-6 text-[var(--color-accent)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[var(--color-text)]">Web Search</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Describe food, get macro estimates</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setView('photo')}
                className="w-full flex items-center gap-4 rounded-2xl bg-[var(--color-card)] shadow-[var(--shadow-card)] border border-[var(--color-card-soft)] p-4 text-left tap-bounce hover:bg-[var(--color-card-soft)] transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center shrink-0">
                  <Camera className="w-6 h-6 text-[var(--color-accent)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[var(--color-text)]">Scan photo</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Take or upload a photo of your meal</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setView('manual')}
                className="w-full flex items-center gap-4 rounded-2xl bg-[var(--color-card)] shadow-[var(--shadow-card)] border border-[var(--color-card-soft)] p-4 text-left tap-bounce hover:bg-[var(--color-card-soft)] transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center shrink-0">
                  <Edit3 className="w-6 h-6 text-[var(--color-accent)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[var(--color-text)]">Manual Add</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Enter name and macros yourself</p>
                </div>
              </button>
            </div>
            <FoodSearch
              foods={foods}
              onSelect={handleSelect}
              onClose={onClose}
            />
          </>
        )}
        {view === 'photo' && (
          <PhotoScan
            onBack={() => setView('search')}
            onConfirm={onPhotoScanConfirm}
          />
        )}
        {view === 'manual' && (
          <ManualAdd
            onBack={() => setView('search')}
            onSubmit={onManualAdd}
          />
        )}
        {view === 'searchFood' && (
          <SearchFood
            onBack={() => setView('search')}
            onConfirm={onPhotoScanConfirm}
          />
        )}
      </div>
    </div>
  );
}
