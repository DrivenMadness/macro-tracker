import { useState, useCallback, useEffect } from 'react';
import type { FoodItem } from '../lib/types';
import { defaultFoodsWithIds } from '../data/defaultFoods';

const STORAGE_KEY = 'macrotracker-foods';

function generateId(): string {
  return crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function loadFoods(): FoodItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FoodItem[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return defaultFoodsWithIds();
}

function saveFoods(foods: FoodItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(foods));
}

/** Simple fuzzy search: name includes query (case-insensitive) or words match */
export function fuzzySearchFoods(foods: FoodItem[], query: string): FoodItem[] {
  if (!query.trim()) return foods;
  const q = query.trim().toLowerCase();
  const words = q.split(/\s+/);
  return foods.filter((f) => {
    const name = f.name.toLowerCase();
    if (name.includes(q)) return true;
    return words.every((w) => name.includes(w));
  });
}

/** Food list and search are fully local (in-memory + localStorage). No Supabase/network on search. */
export function useFoodDatabase() {
  const [foods, setFoodsState] = useState<FoodItem[]>(loadFoods);

  useEffect(() => {
    const t = setTimeout(() => saveFoods(foods), 0);
    return () => clearTimeout(t);
  }, [foods]);

  const addFood = useCallback((item: Omit<FoodItem, 'id'>) => {
    const newItem: FoodItem = { ...item, id: generateId() };
    setFoodsState((prev) => [...prev, newItem]);
    return newItem;
  }, []);

  const updateFood = useCallback((id: string, updates: Partial<FoodItem>) => {
    setFoodsState((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  }, []);

  const deleteFood = useCallback((id: string) => {
    setFoodsState((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const search = useCallback(
    (query: string) => fuzzySearchFoods(foods, query),
    [foods]
  );

  return { foods, addFood, updateFood, deleteFood, search };
}
