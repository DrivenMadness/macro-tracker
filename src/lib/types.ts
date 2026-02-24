export type DayType = 'rest' | 'lift';

export interface MacroTargets {
  rest: { protein: number; calories: number };
  lift: { protein: number; calories: number };
}

export interface FoodItem {
  id: string;
  name: string;
  protein: number;
  calories: number;
  carbs: number;
  fat: number;
  fiber?: number;
  serving_description?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export interface MealEntry {
  id: string;
  meal_type: MealType;
  food_item_id: string | null;
  custom_name: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  quantity: number;
  created_at: string;
}

export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  day_type: DayType;
  entries: MealEntry[];
  created_at: string;
}

export const DEFAULT_TARGETS: MacroTargets = {
  rest: { protein: 200, calories: 1800 },
  lift: { protein: 200, calories: 2200 },
};

/** Result from Claude photo analysis — editable before adding to log */
export interface EstimatedFood {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}
