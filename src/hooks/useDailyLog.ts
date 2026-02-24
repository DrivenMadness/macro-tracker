import { useState, useCallback, useEffect } from 'react';
import type { DailyLog, MealEntry, DayType } from '../lib/types';

const STORAGE_KEY_PREFIX = 'macrotracker-log-';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function generateId(): string {
  return crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function loadLogForDate(date: string): DailyLog | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + date);
    if (raw) return JSON.parse(raw) as DailyLog;
  } catch {
    // ignore
  }
  return null;
}

function saveLog(log: DailyLog) {
  localStorage.setItem(STORAGE_KEY_PREFIX + log.date, JSON.stringify(log));
}

function createEmptyLog(date: string, dayType: DayType): DailyLog {
  return {
    id: generateId(),
    date,
    day_type: dayType,
    entries: [],
    created_at: new Date().toISOString(),
  };
}

export function useDailyLog() {
  const [date, setDate] = useState(todayKey());
  const [log, setLog] = useState<DailyLog | null>(() => {
    const key = todayKey();
    const existing = loadLogForDate(key);
    if (existing) return existing;
    const newLog = createEmptyLog(key, 'lift');
    saveLog(newLog);
    return newLog;
  });

  const refreshLog = useCallback((d: string) => {
    const existing = loadLogForDate(d);
    if (existing) {
      setLog(existing);
    } else {
      setLog(createEmptyLog(d, 'lift'));
    }
  }, []);

  useEffect(() => {
    refreshLog(date);
  }, [date, refreshLog]);

  const persistLog = useCallback((next: DailyLog) => {
    setLog(next);
    // Defer localStorage write so UI updates instantly (optimistic)
    setTimeout(() => saveLog(next), 0);
  }, []);

  const setDayType = useCallback(
    (dayType: DayType) => {
      if (!log) return;
      persistLog({ ...log, day_type: dayType });
    },
    [log, persistLog]
  );

  const addEntry = useCallback(
    (
      entry: {
        food_item_id: string | null;
        custom_name: string | null;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber?: number;
        quantity?: number;
      }
    ) => {
      if (!log) return;
      const newEntry: MealEntry = {
        id: generateId(),
        meal_type: 'breakfast', // single day log; stored for schema compatibility
        food_item_id: entry.food_item_id,
        custom_name: entry.custom_name,
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
        fiber: entry.fiber ?? 0,
        quantity: entry.quantity ?? 1,
        created_at: new Date().toISOString(),
      };
      persistLog({
        ...log,
        entries: [...log.entries, newEntry],
      });
    },
    [log, persistLog]
  );

  const updateEntryQuantity = useCallback(
    (entryId: string, quantity: number) => {
      if (!log) return;
      persistLog({
        ...log,
        entries: log.entries.map((e) =>
          e.id === entryId ? { ...e, quantity } : e
        ),
      });
    },
    [log, persistLog]
  );

  const removeEntry = useCallback(
    (entryId: string) => {
      if (!log) return;
      persistLog({
        ...log,
        entries: log.entries.filter((e) => e.id !== entryId),
      });
    },
    [log, persistLog]
  );

  const goToToday = useCallback(() => {
    setDate(todayKey());
  }, []);

  const entries = log ? log.entries : [];

  const totals = log
    ? log.entries.reduce(
        (acc, e) => ({
          calories: acc.calories + e.calories * e.quantity,
          protein: acc.protein + e.protein * e.quantity,
          carbs: acc.carbs + e.carbs * e.quantity,
          fat: acc.fat + e.fat * e.quantity,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      )
    : { calories: 0, protein: 0, carbs: 0, fat: 0 };

  return {
    date,
    log,
    setDate,
    setDayType,
    addEntry,
    updateEntryQuantity,
    removeEntry,
    goToToday,
    entries,
    totals,
    refreshLog,
  };
}
