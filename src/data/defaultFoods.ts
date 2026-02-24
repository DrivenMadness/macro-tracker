import type { FoodItem } from '../lib/types';

export const DEFAULT_FOODS: Omit<FoodItem, 'id'>[] = [
  { name: "Protein Chobani", protein: 20, calories: 140, carbs: 8, fat: 2, fiber: 0 },
  { name: "Regular Chobani", protein: 12, calories: 110, carbs: 12, fat: 2, fiber: 0 },
  { name: "Protein Oikos", protein: 9, calories: 80, carbs: 8, fat: 0, fiber: 0 },
  { name: "Catalina Crunch Cereal + Milk", protein: 19, calories: 210, carbs: 16, fat: 8, fiber: 9 },
  { name: "String Cheese", protein: 6, calories: 80, carbs: 1, fat: 6, fiber: 0 },
  { name: "2 Hard Boiled Eggs", protein: 12.5, calories: 156, carbs: 1, fat: 10.5, fiber: 0 },
  { name: "2 Eggs (whites only)", protein: 8, calories: 34, carbs: 0, fat: 0, fiber: 0 },
  { name: "Banana", protein: 1.5, calories: 103, carbs: 27, fat: 0.5, fiber: 3 },
  { name: "Quest Protein Chips", protein: 19, calories: 140, carbs: 5, fat: 5, fiber: 1 },
  { name: "Turkey Jerky", protein: 12, calories: 70, carbs: 3, fat: 1, fiber: 0 },
  { name: "Gimme Seaweed", protein: 2, calories: 50, carbs: 4, fat: 3, fiber: 1 },
  { name: "Just Iced Tea", protein: 0, calories: 60, carbs: 15, fat: 0, fiber: 0 },
  { name: "Spindrift", protein: 0, calories: 15, carbs: 4, fat: 0, fiber: 0 },
  { name: "Coconut Water", protein: 0, calories: 90, carbs: 22, fat: 0, fiber: 0 },
  { name: "Chameleon Black Coffee", protein: 1, calories: 15, carbs: 2, fat: 0, fiber: 0 },
  { name: "Chameleon Mexican Coffee", protein: 1, calories: 70, carbs: 12, fat: 2, fiber: 0 },
  { name: "Optimum Nutrition + Milk", protein: 32, calories: 220, carbs: 10, fat: 4, fiber: 1 },
  { name: "Nurri Protein", protein: 30, calories: 150, carbs: 2, fat: 2, fiber: 0 },
  { name: "Canto Steamed Chicken Drumstick", protein: 52, calories: 800, carbs: 10, fat: 45, fiber: 0 },
  { name: "One Reeses", protein: 18, calories: 240, carbs: 20, fat: 9, fiber: 1 },
  { name: "Spicy Squid", protein: 0, calories: 18, carbs: 4, fat: 0, fiber: 0 },
  { name: "Black Plum", protein: 0.5, calories: 30, carbs: 8, fat: 0, fiber: 1 },
  { name: "Almonds", protein: 6, calories: 180, carbs: 6, fat: 15, fiber: 3 },
  { name: "Built Puff Bar", protein: 17, calories: 140, carbs: 6, fat: 5, fiber: 2 },
  { name: "Vitamins", protein: 0, calories: 70, carbs: 8, fat: 3, fiber: 0 },
];

function generateId(): string {
  return crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function defaultFoodsWithIds(): FoodItem[] {
  return DEFAULT_FOODS.map((f) => ({ ...f, id: generateId() }));
}
