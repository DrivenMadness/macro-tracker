import { useState, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { LayoutDashboard, PlusCircle, BarChart3, Settings } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { AddFood } from './components/AddFood';
import { WeeklySummary } from './components/WeeklySummary';
import { Settings as SettingsScreen } from './components/Settings';
import { useDailyLog } from './hooks/useDailyLog';
import { useFoodDatabase } from './hooks/useFoodDatabase';
import type { EstimatedFood } from './lib/types';

type Tab = 'dashboard' | 'add' | 'history' | 'settings';

const TABS: Tab[] = ['dashboard', 'add', 'history', 'settings'];

const SWIPE_THRESHOLD_PX = 50;

function App() {
  const [tabIndex, setTabIndex] = useState(0);
  const [dragPx, setDragPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStart = useRef({ x: 0, y: 0 });
  const swipeLock = useRef(false);
  const mainRef = useRef<HTMLElement>(null);

  const [addFoodOpen, setAddFoodOpen] = useState(false);

  const dailyLog = useDailyLog();
  const { addEntry, addEntries } = dailyLog;
  const { foods, addFood } = useFoodDatabase();

  const handleFoodAdded = (
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
    flushSync(() => {
      addEntry(entry);
    });
    setAddFoodOpen(false);
  };

  const handlePhotoScanConfirm = (items: EstimatedFood[], saveToDb: boolean) => {
    addEntries(
      items.map((item) => ({
        food_item_id: null,
        custom_name: item.name.trim() || 'Unknown',
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        fiber: item.fiber,
        quantity: 1,
      }))
    );
    items.forEach((item) => {
      if (saveToDb && item.name.trim()) {
        addFood({
          name: item.name.trim(),
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          fiber: item.fiber,
        });
      }
    });
    setAddFoodOpen(false);
  };

  const handleManualAdd = (
    entry: { custom_name: string; calories: number; protein: number; carbs: number; fat: number },
    saveToDb: boolean
  ) => {
    addEntry({
      food_item_id: null,
      custom_name: entry.custom_name,
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
      quantity: 1,
    });
    if (saveToDb && entry.custom_name.trim()) {
      addFood({
        name: entry.custom_name.trim(),
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
      });
    }
    setAddFoodOpen(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    swipeLock.current = false;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    const deltaX = x - touchStart.current.x;
    const deltaY = y - touchStart.current.y;

    if (!swipeLock.current && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      swipeLock.current = Math.abs(deltaX) > Math.abs(deltaY);
    }
    if (!swipeLock.current) return;

    let clamped = deltaX;
    if (tabIndex <= 0 && deltaX > 0) clamped = 0;
    else if (tabIndex >= TABS.length - 1 && deltaX < 0) clamped = 0;
    setDragPx(clamped);
    if (Math.abs(deltaX) > 5) e.preventDefault();
  };

  const handleTouchEnd = () => {
    if (swipeLock.current) {
      if (dragPx > SWIPE_THRESHOLD_PX && tabIndex > 0) {
        setTabIndex((i) => i - 1);
      } else if (dragPx < -SWIPE_THRESHOLD_PX && tabIndex < TABS.length - 1) {
        setTabIndex((i) => i + 1);
      }
    }
    setDragPx(0);
    swipeLock.current = false;
    setIsDragging(false);
  };

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const onTouchMove = (e: TouchEvent) => {
      if (swipeLock.current) e.preventDefault();
    };
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', onTouchMove);
  }, []);

  const slideStyle = {
    transform: `translateX(calc(-${tabIndex * (100 / TABS.length)}% + ${dragPx}px))`,
    transition: isDragging ? 'none' : 'transform 0.25s ease-out',
  };

  return (
    <>
      <main
        ref={mainRef}
        className="min-h-screen overflow-x-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div
          className="flex min-h-screen"
          style={{ width: `${TABS.length * 100}%`, ...slideStyle }}
        >
          <section className="shrink-0 overflow-y-auto" style={{ width: `${100 / TABS.length}%` }} aria-label="Dashboard">
            <Dashboard
              dailyLog={dailyLog}
              onAddFood={() => setAddFoodOpen(true)}
            />
          </section>
          <section className="shrink-0 overflow-y-auto" style={{ width: `${100 / TABS.length}%` }} aria-label="Add food">
            <div className="max-w-lg mx-auto px-4 py-8">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-text)]">Add food</h2>
                </div>
                <div className="flex items-center gap-1.5 shrink-0" aria-label="NutriBuddy">
                  <img src="/icons/chibi.svg" alt="" className="w-8 h-8" aria-hidden />
                  <span className="text-sm font-bold text-[var(--color-text)]">NutriBuddy</span>
                </div>
              </div>
              <p className="text-[var(--color-text-muted)] mb-4">
                Tap the button below to search and add food to today&apos;s log.
              </p>
              <button
                type="button"
                onClick={() => setAddFoodOpen(true)}
                className="rounded-full bg-[var(--color-accent)] text-white px-5 py-3 font-semibold min-h-[48px] shadow-[var(--shadow-soft)] tap-bounce"
              >
                Add food
              </button>
            </div>
          </section>
          <section className="shrink-0 overflow-y-auto" style={{ width: `${100 / TABS.length}%` }} aria-label="History">
            <WeeklySummary />
          </section>
          <section className="shrink-0 overflow-y-auto" style={{ width: `${100 / TABS.length}%` }} aria-label="Settings">
            <SettingsScreen />
          </section>
        </div>
      </main>

      {addFoodOpen && (
        <AddFood
          onAdd={handleFoodAdded}
          onPhotoScanConfirm={handlePhotoScanConfirm}
          onManualAdd={handleManualAdd}
          onClose={() => setAddFoodOpen(false)}
          foods={foods}
        />
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 bg-[var(--color-card)] shadow-[0_-4px 20px rgba(45,49,66,0.08)] z-40 min-h-[88px] flex flex-col justify-end"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
        role="navigation"
      >
        <div className="max-w-lg mx-auto flex items-center justify-around w-full min-h-[88px] py-2">
          {(['dashboard', 'add', 'history', 'settings'] as const).map((t, i) => (
            <button
              key={t}
              type="button"
              onClick={() => setTabIndex(i)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 min-h-[56px] tap-bounce ${
                tabIndex === i ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'
              }`}
              aria-current={tabIndex === i ? 'page' : undefined}
              aria-label={t === 'dashboard' ? 'Dashboard' : t === 'add' ? 'Add' : t === 'history' ? 'History' : 'Settings'}
            >
              {t === 'dashboard' && <LayoutDashboard className="w-8 h-8" />}
              {t === 'add' && <PlusCircle className="w-8 h-8" />}
              {t === 'history' && <BarChart3 className="w-8 h-8" />}
              {t === 'settings' && <Settings className="w-8 h-8" />}
              <span className="text-sm font-semibold">
                {t === 'dashboard' ? 'Dashboard' : t === 'add' ? 'Add' : t === 'history' ? 'History' : 'Settings'}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}

export default App;
