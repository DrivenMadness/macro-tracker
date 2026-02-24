import { useState } from 'react';
import { X, Camera, Edit3 } from 'lucide-react';
import { FoodSearch } from './FoodSearch';
import { PhotoScan } from './PhotoScan';
import { ManualAdd } from './ManualAdd';
import type { FoodItem } from '../lib/types';
import type { EstimatedFood } from '../lib/types';

interface AddFoodProps {
  onAdd: (entry: {
    food_item_id: string | null;
    custom_name: string | null;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    quantity?: number;
  }) => void;
  onPhotoScanConfirm: (items: EstimatedFood[], saveToDb: boolean) => void;
  onManualAdd: (entry: { custom_name: string; calories: number; protein: number; carbs: number; fat: number }, saveToDb: boolean) => void;
  onClose: () => void;
  foods: FoodItem[];
}

export function AddFood({ onAdd, onPhotoScanConfirm, onManualAdd, onClose, foods }: AddFoodProps) {
  const [view, setView] = useState<'search' | 'photo' | 'manual'>('search');

  const handleSelect = (food: FoodItem, quantity: number) => {
    onAdd({
      food_item_id: food.id,
      custom_name: null,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      quantity,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-bg)] flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-card-soft)] shrink-0 bg-[var(--color-card)] shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2">
          <img src="/icons/chibi.svg" alt="" className="w-8 h-8 shrink-0" aria-hidden />
          <h2 className="text-lg font-bold text-[var(--color-text)]">NutriBuddy · Add food</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-card-soft)] min-h-[44px] min-w-[44px] flex items-center justify-center tap-bounce"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 overflow-auto px-4 py-4">
        {view === 'search' && (
          <>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setView('photo')}
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[var(--color-card)] shadow-[var(--shadow-card)] text-[var(--color-text)] px-4 py-3 min-h-[48px] tap-bounce"
              >
                <Camera className="w-5 h-5" />
                Scan photo
              </button>
              <button
                type="button"
                onClick={() => setView('manual')}
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[var(--color-card)] shadow-[var(--shadow-card)] text-[var(--color-text)] px-4 py-3 min-h-[48px] tap-bounce"
              >
                <Edit3 className="w-5 h-5" />
                Manual Add
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
      </div>
    </div>
  );
}
