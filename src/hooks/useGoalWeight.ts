import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'macrotracker-goal-weight';

function loadGoalWeight(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null && raw !== '') {
      const n = Number(raw);
      if (Number.isFinite(n) && n > 0) return n;
    }
  } catch {
    // ignore
  }
  return null;
}

function saveGoalWeight(lbs: number | null) {
  if (lbs == null) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, String(lbs));
  }
}

export function useGoalWeight() {
  const [goalLbs, setGoalLbsState] = useState<number | null>(loadGoalWeight);

  useEffect(() => {
    saveGoalWeight(goalLbs);
  }, [goalLbs]);

  const setGoalLbs = useCallback((value: number | null) => {
    setGoalLbsState(value);
  }, []);

  return { goalLbs, setGoalLbs };
}
