import { useState } from 'react';
import { X, Camera } from 'lucide-react';
import { FoodSearch } from './FoodSearch';
import { PhotoScan } from './PhotoScan';
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
  onClose: () => void;
  foods: FoodItem[];
}

export function AddFood({ onAdd, onPhotoScanConfirm, onClose, foods }: AddFoodProps) {
  const [view, setView] = useState<'search' | 'photo'>('search');

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
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">
          Add food
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 overflow-auto px-4 py-4">
        {view === 'search' && (
          <>
            <button
              type="button"
              onClick={() => setView('photo')}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--color-card)] border border-white/10 text-[var(--color-text)] px-4 py-3 mb-4 min-h-[44px]"
            >
              <Camera className="w-5 h-5" />
              Scan photo
            </button>
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
      </div>
    </div>
  );
}
