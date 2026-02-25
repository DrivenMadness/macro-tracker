import { useState, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'macrotracker-weights';

function loadWeights(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, number>;
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {
    // ignore
  }
  return {};
}

function saveWeights(weights: Record<string, number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(weights));
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getPast30DayKeys(): string[] {
  const keys: string[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    keys.push(dateKey(d));
  }
  return keys;
}

/** 7-day rolling average ending on the given date (inclusive). Needs at least 1 weight in that window. */
function rolling7Avg(weights: Record<string, number>, endDate: string): number | null {
  const end = new Date(endDate + 'T12:00:00');
  let sum = 0;
  let count = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const k = dateKey(d);
    const w = weights[k];
    if (w != null && !Number.isNaN(w)) {
      sum += w;
      count++;
    }
  }
  return count > 0 ? sum / count : null;
}

/** Rate in lbs per week: slope of 7-day rolling avg over last 2 weeks (14 days). */
function rateLbsPerWeek(weights: Record<string, number>): number | null {
  const today = new Date();
  const cur = dateKey(today);
  const curAvg = rolling7Avg(weights, cur);
  const past = new Date(today);
  past.setDate(past.getDate() - 14);
  const pastAvg = rolling7Avg(weights, dateKey(past));
  if (curAvg == null || pastAvg == null) return null;
  const diff = curAvg - pastAvg;
  return diff / 2; // per 2 weeks -> per week
}

/** Status message based on rate (lbs/week) and current weight for % body weight. */
export function getWeightStatusMessage(
  rateLbsPerWeek: number | null,
  current7DayAvgLbs: number | null
): string {
  if (rateLbsPerWeek == null) {
    return 'Log weight for a few days to see your trend.';
  }
  const pctPerWeek =
    current7DayAvgLbs != null && current7DayAvgLbs > 0
      ? (Math.abs(rateLbsPerWeek) / current7DayAvgLbs) * 100
      : null;

  if (rateLbsPerWeek > 0.2) return 'Gaining — check your intake.';
  if (rateLbsPerWeek >= -0.15) return 'Maintaining — reduce by 100–200 cal if you want to lose.';
  if (pctPerWeek != null && pctPerWeek > 1) {
    return 'Losing too fast (over 1% body weight/week) — consider adding calories.';
  }
  if (pctPerWeek != null && pctPerWeek >= 0.5) return 'On track (0.5–1%/week).';
  if (rateLbsPerWeek < -0.5) return 'On track (0.5–1%/week).';
  return 'Maintaining — reduce by 100–200 cal if you want to lose.';
}

export function useWeightLog() {
  const [weights, setWeights] = useState<Record<string, number>>(loadWeights);

  const persist = useCallback((next: Record<string, number>) => {
    setWeights(next);
    saveWeights(next);
  }, []);

  const logWeight = useCallback(
    (date: string, weightLbs: number) => {
      const w = Number(weightLbs);
      if (!Number.isFinite(w) || w <= 0) return;
      persist({ ...weights, [date]: w });
    },
    [weights, persist]
  );

  const getWeightForDate = useCallback(
    (date: string): number | undefined => {
      const w = weights[date];
      return w != null && Number.isFinite(w) ? w : undefined;
    },
    [weights]
  );

  const last30 = useMemo(() => {
    const keys = getPast30DayKeys();
    return keys.map((date) => {
      const d = new Date(date + 'T12:00:00');
      const short = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const weight = weights[date];
      const rolling7 = rolling7Avg(weights, date);
      return {
        date,
        label: short,
        weight: weight != null && Number.isFinite(weight) ? weight : null,
        rolling7: rolling7 != null ? Math.round(rolling7 * 10) / 10 : null,
      };
    });
  }, [weights]);

  const current7DayAvg = useMemo(() => {
    const today = dateKey(new Date());
    return rolling7Avg(weights, today);
  }, [weights]);

  const prev7DayAvg = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return rolling7Avg(weights, dateKey(d));
  }, [weights]);

  const weekOverWeekChange = useMemo(() => {
    const cur = current7DayAvg;
    const prev = prev7DayAvg;
    if (cur == null || prev == null) return null;
    return Math.round((cur - prev) * 10) / 10;
  }, [current7DayAvg, prev7DayAvg]);

  const ratePerWeek = useMemo(() => {
    const r = rateLbsPerWeek(weights);
    return r != null ? Math.round(r * 100) / 100 : null;
  }, [weights]);

  const statusMessage = useMemo(
    () => getWeightStatusMessage(ratePerWeek, current7DayAvg ?? null),
    [ratePerWeek, current7DayAvg]
  );

  const getProjectedDate = useCallback(
    (goalLbs: number | null): string | null => {
      if (goalLbs == null || !Number.isFinite(goalLbs) || ratePerWeek == null || ratePerWeek >= 0) return null;
      const cur = current7DayAvg;
      if (cur == null || cur <= goalLbs) return null;
      const lbsToLose = cur - goalLbs;
      const weeks = lbsToLose / Math.abs(ratePerWeek);
      const d = new Date();
      d.setDate(d.getDate() + Math.round(weeks * 7));
      return dateKey(d);
    },
    [current7DayAvg, ratePerWeek]
  );

  return {
    weights,
    logWeight,
    getWeightForDate,
    last30,
    current7DayAvg,
    prev7DayAvg,
    weekOverWeekChange,
    ratePerWeek,
    statusMessage,
    getProjectedDate,
  };
}
