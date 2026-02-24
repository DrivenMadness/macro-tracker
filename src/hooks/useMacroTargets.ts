import { useState, useCallback, useEffect } from 'react';
import type { MacroTargets, DayType } from '../lib/types';
import { DEFAULT_TARGETS } from '../lib/types';

const STORAGE_KEY = 'macrotracker-targets';

function loadTargets(): MacroTargets {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MacroTargets;
      if (parsed.rest && parsed.lift) {
        return {
          rest: { ...DEFAULT_TARGETS.rest, ...parsed.rest },
          lift: { ...DEFAULT_TARGETS.lift, ...parsed.lift },
        };
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_TARGETS;
}

function saveTargets(targets: MacroTargets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(targets));
}

export function useMacroTargets() {
  const [targets, setTargetsState] = useState<MacroTargets>(loadTargets);

  useEffect(() => {
    saveTargets(targets);
  }, [targets]);

  const setTargets = useCallback((next: MacroTargets | ((prev: MacroTargets) => MacroTargets)) => {
    setTargetsState((prev) => (typeof next === 'function' ? next(prev) : next));
  }, []);

  const updateDayTypeTarget = useCallback(
    (dayType: DayType, key: keyof import('../lib/types').DayTarget, value: number) => {
      setTargetsState((prev) => ({
        ...prev,
        [dayType]: { ...prev[dayType], [key]: value },
      }));
    },
    []
  );

  return { targets, setTargets, updateDayTypeTarget };
}
