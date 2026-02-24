import { useState } from 'react';
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

function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
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

  return (
    <>
      <main className="min-h-screen">
        {tab === 'dashboard' && (
          <Dashboard
            dailyLog={dailyLog}
            onAddFood={() => setAddFoodOpen(true)}
          />
        )}
        {tab === 'add' && (
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
        )}
        {tab === 'history' && <WeeklySummary />}
        {tab === 'settings' && <SettingsScreen />}
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
        className="fixed bottom-8 left-4 right-4 max-w-lg mx-auto rounded-3xl bg-[var(--color-card)] shadow-[0_-4px 20px rgba(45,49,66,0.08)] z-40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
        role="navigation"
      >
        <div className="flex items-center justify-around h-20 px-2">
          <button
            type="button"
            onClick={() => setTab('dashboard')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 min-h-[56px] tap-bounce ${
              tab === 'dashboard'
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)]'
            }`}
            aria-current={tab === 'dashboard' ? 'page' : undefined}
          >
            <LayoutDashboard className="w-8 h-8" />
            <span className="text-sm font-semibold">Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('add')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 min-h-[56px] tap-bounce ${
              tab === 'add'
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)]'
            }`}
            aria-current={tab === 'add' ? 'page' : undefined}
          >
            <PlusCircle className="w-8 h-8" />
            <span className="text-sm font-semibold">Add</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('history')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 min-h-[56px] tap-bounce ${
              tab === 'history'
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)]'
            }`}
            aria-current={tab === 'history' ? 'page' : undefined}
          >
            <BarChart3 className="w-8 h-8" />
            <span className="text-sm font-semibold">History</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('settings')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 min-h-[56px] tap-bounce ${
              tab === 'settings'
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)]'
            }`}
            aria-current={tab === 'settings' ? 'page' : undefined}
          >
            <Settings className="w-8 h-8" />
            <span className="text-sm font-semibold">Settings</span>
          </button>
        </div>
      </nav>
    </>
  );
}

export default App;
