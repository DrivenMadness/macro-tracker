import { useMemo } from 'react';
import type { DailyLog } from '../lib/types';
import { useMacroTargets } from './useMacroTargets';

const STORAGE_KEY_PREFIX = 'macrotracker-log-';

function loadLogForDate(date: string): DailyLog | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + date);
    if (raw) return JSON.parse(raw) as DailyLog;
  } catch {
    // ignore
  }
  return null;
}

function getPast7DayKeys(): string[] {
  const keys: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

export interface DayTotals {
  date: string;
  dayLabel: string;
  dayType: 'rest' | 'lift';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  hitTarget: boolean;
}

export interface WeeklyStats {
  days: DayTotals[];
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  streak: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  restDays: DayTotals[];
  liftDays: DayTotals[];
  avgRestCalories: number;
  avgRestProtein: number;
  avgLiftCalories: number;
  avgLiftProtein: number;
}

const DAY_LABELS: Record<string, string> = {
  Mon: 'Mon',
  Tue: 'Tue',
  Wed: 'Wed',
  Thu: 'Thu',
  Fri: 'Fri',
  Sat: 'Sat',
  Sun: 'Sun',
};

export function useWeeklyData(): WeeklyStats {
  const { targets } = useMacroTargets();

  return useMemo(() => {
    const keys = getPast7DayKeys();
    const days: DayTotals[] = keys.map((date) => {
      const log = loadLogForDate(date);
      const dayType = log?.day_type ?? 'lift';
      const t = targets[dayType];
      const totals = log?.entries.reduce(
        (acc, e) => ({
          calories: acc.calories + e.calories * e.quantity,
          protein: acc.protein + e.protein * e.quantity,
          carbs: acc.carbs + e.carbs * e.quantity,
          fat: acc.fat + e.fat * e.quantity,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ) ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
      const d = new Date(date + 'T12:00:00');
      const short = d.toLocaleDateString('en-US', { weekday: 'short' });
      const hitTarget =
        log != null &&
        log.entries.length > 0 &&
        totals.calories >= t.calories * 0.9 &&
        totals.protein >= t.protein * 0.9;

      return {
        date,
        dayLabel: DAY_LABELS[short] ?? short,
        dayType,
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein),
        carbs: Math.round(totals.carbs),
        fat: Math.round(totals.fat),
        hitTarget,
      };
    });

    const n = 7;
    const avgCalories = Math.round(days.reduce((a, d) => a + d.calories, 0) / n);
    const avgProtein = Math.round(days.reduce((a, d) => a + d.protein, 0) / n);
    const avgCarbs = Math.round(days.reduce((a, d) => a + d.carbs, 0) / n);
    const avgFat = Math.round(days.reduce((a, d) => a + d.fat, 0) / n);

    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].hitTarget) streak++;
      else break;
    }

    const totalProtein = days.reduce((a, d) => a + d.protein, 0);
    const totalCarbs = days.reduce((a, d) => a + d.carbs, 0);
    const totalFat = days.reduce((a, d) => a + d.fat, 0);

    const restDays = days.filter((d) => d.dayType === 'rest' && (d.calories > 0 || d.protein > 0));
    const liftDays = days.filter((d) => d.dayType === 'lift' && (d.calories > 0 || d.protein > 0));
    const avgRestCalories =
      restDays.length > 0
        ? Math.round(restDays.reduce((a, d) => a + d.calories, 0) / restDays.length)
        : 0;
    const avgRestProtein =
      restDays.length > 0
        ? Math.round(restDays.reduce((a, d) => a + d.protein, 0) / restDays.length)
        : 0;
    const avgLiftCalories =
      liftDays.length > 0
        ? Math.round(liftDays.reduce((a, d) => a + d.calories, 0) / liftDays.length)
        : 0;
    const avgLiftProtein =
      liftDays.length > 0
        ? Math.round(liftDays.reduce((a, d) => a + d.protein, 0) / liftDays.length)
        : 0;

    return {
      days,
      avgCalories,
      avgProtein,
      avgCarbs,
      avgFat,
      streak,
      totalProtein,
      totalCarbs,
      totalFat,
      restDays,
      liftDays,
      avgRestCalories,
      avgRestProtein,
      avgLiftCalories,
      avgLiftProtein,
    };
  }, [targets]);
}
