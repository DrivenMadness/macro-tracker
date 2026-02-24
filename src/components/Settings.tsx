import { useState, useEffect } from 'react';
import { getClaudeApiKey, setClaudeApiKey } from '../lib/claude';

export function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setApiKey(getClaudeApiKey());
  }, []);

  const handleSaveKey = () => {
    setClaudeApiKey(apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-[var(--color-text)] mb-6">
        Settings
      </h1>

      <section className="mb-8">
        <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-2">
          Claude API key (for photo scan)
        </h2>
        <p className="text-xs text-[var(--color-text-muted)] mb-2">
          Stored only on this device. Get a key at console.anthropic.com.
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            className="flex-1 rounded-xl bg-[var(--color-card)] border border-white/10 px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] min-h-[44px]"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={handleSaveKey}
            className="rounded-xl bg-[var(--color-accent)] text-[var(--color-bg)] font-medium px-4 py-3 min-h-[44px] shrink-0"
          >
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </section>

      <p className="text-[var(--color-text-muted)] text-sm">
        Edit targets and manage food database coming in a later update.
      </p>
    </div>
  );
}
