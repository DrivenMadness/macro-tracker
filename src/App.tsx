import { useState } from 'react';
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
  const { addEntry } = dailyLog;
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
    addEntry(entry);
    setAddFoodOpen(false);
  };

  const handlePhotoScanConfirm = (items: EstimatedFood[], saveToDb: boolean) => {
    items.forEach((item) => {
      addEntry({
        food_item_id: null,
        custom_name: item.name.trim() || 'Unknown',
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        fiber: item.fiber,
        quantity: 1,
      });
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
            <h1 className="text-xl font-semibold text-[var(--color-text)] mb-2">
              Add food
            </h1>
            <p className="text-[var(--color-text-muted)] mb-4">
              Tap the button below to search and add food to today&apos;s log.
            </p>
            <button
              type="button"
              onClick={() => setAddFoodOpen(true)}
              className="rounded-xl bg-[var(--color-accent)] text-[var(--color-bg)] px-4 py-3 font-medium min-h-[44px]"
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
        className="fixed bottom-0 left-0 right-0 bg-[var(--color-card)] border-t border-white/10 safe-area-pb z-40"
        role="navigation"
      >
        <div className="max-w-lg mx-auto flex items-center justify-around h-16">
          <button
            type="button"
            onClick={() => setTab('dashboard')}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[44px] ${
              tab === 'dashboard'
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)]'
            }`}
            aria-current={tab === 'dashboard' ? 'page' : undefined}
          >
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-xs">Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('add')}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[44px] ${
              tab === 'add'
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)]'
            }`}
            aria-current={tab === 'add' ? 'page' : undefined}
          >
            <PlusCircle className="w-6 h-6" />
            <span className="text-xs">Add</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('history')}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[44px] ${
              tab === 'history'
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)]'
            }`}
            aria-current={tab === 'history' ? 'page' : undefined}
          >
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs">History</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('settings')}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[44px] ${
              tab === 'settings'
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)]'
            }`}
            aria-current={tab === 'settings' ? 'page' : undefined}
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </nav>
    </>
  );
}

export default App;
