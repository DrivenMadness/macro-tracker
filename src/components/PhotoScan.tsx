import { useState, useRef } from 'react';
import { ArrowLeft, Camera, Loader2, Check, ImagePlus } from 'lucide-react';
import { analyzeFoodPhoto, getClaudeApiKey } from '../lib/claude';
import { compressImageForApi } from '../lib/imageCompress';
import type { EstimatedFood } from '../lib/types';

type Step = 'capture' | 'analyzing' | 'edit' | 'error';

interface PhotoScanProps {
  onBack: () => void;
  onConfirm: (items: EstimatedFood[], saveToDb: boolean) => void;
}

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

export function PhotoScan({ onBack, onConfirm }: PhotoScanProps) {
  const [step, setStep] = useState<Step>('capture');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [estimated, setEstimated] = useState<EstimatedFood[]>([]);
  const [saveToDb, setSaveToDb] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiKey = getClaudeApiKey();
  const useProxy = import.meta.env.PROD;
  const canScan = useProxy || apiKey;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!canScan) {
      setError('Add your Claude API key in Settings first.');
      setStep('error');
      return;
    }

    setError('');
    setStep('analyzing');

    if (!ACCEPT.includes(file.type)) {
      setError('Use JPEG, PNG, WebP, or GIF.');
      setStep('error');
      return;
    }

    try {
      const { base64 } = await compressImageForApi(file);
      const items = await analyzeFoodPhoto(apiKey, base64, 'image/jpeg', description || undefined);
      setEstimated(items.length > 0 ? items : [{ name: 'Unknown', calories: 0, protein: 0, carbs: 0, fat: 0 }]);
      setStep('edit');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed.');
      setStep('error');
    }

    e.target.value = '';
  }

  function updateItem(index: number, field: keyof EstimatedFood, value: string | number) {
    setEstimated((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function removeItem(index: number) {
    setEstimated((prev) => prev.filter((_, i) => i !== index));
  }

  function handleConfirm() {
    const valid = estimated.filter((e) => e.name.trim());
    if (valid.length) onConfirm(valid, saveToDb);
    onBack();
  }

  if (step === 'error') {
    return (
      <div className="flex flex-col h-full">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--color-text-muted)] py-2 -ml-1 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex-1 flex flex-col justify-center py-6">
          <p className="text-[var(--color-danger)] mb-4">{error}</p>
          <button
            type="button"
            onClick={() => { setStep('capture'); setError(''); }}
            className="rounded-xl bg-[var(--color-card)] text-[var(--color-text)] px-4 py-3 min-h-[44px]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (step === 'analyzing') {
    return (
      <div className="flex flex-col h-full items-center justify-center py-12">
        <Loader2 className="w-10 h-10 text-[var(--color-accent)] animate-spin mb-4" />
        <p className="text-[var(--color-text-muted)]">Analyzing photo…</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 text-sm text-[var(--color-text-muted)] min-h-[44px]"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (step === 'edit') {
    return (
      <div className="flex flex-col">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--color-text-muted)] py-2 -ml-1 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <p className="text-sm text-[var(--color-text-muted)] mb-3">
          Edit estimates, then confirm to add to today&apos;s log.
        </p>
        <ul className="space-y-4 mb-4">
          {estimated.map((item, index) => (
            <li
              key={index}
              className="rounded-xl bg-[var(--color-card)] p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  className="flex-1 rounded-lg bg-[var(--color-bg)] border border-white/10 px-3 py-2 text-[var(--color-text)] min-h-[44px]"
                  placeholder="Food name"
                />
                {estimated.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-[var(--color-danger)] text-sm px-2 py-1 min-h-[44px]"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['calories', 'protein', 'carbs', 'fat'] as const).map((field) => (
                  <label key={field} className="text-xs text-[var(--color-text-muted)]">
                    {field}
                    <input
                      type="number"
                      min={0}
                      step={field === 'calories' ? 1 : 0.5}
                      value={item[field]}
                      onChange={(e) => updateItem(index, field, e.target.value === '' ? 0 : Number(e.target.value))}
                      className="block w-full rounded-lg bg-[var(--color-bg)] border border-white/10 px-3 py-2 text-[var(--color-text)] mt-0.5 min-h-[44px]"
                    />
                  </label>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <label className="flex items-center gap-2 mb-4 min-h-[44px] cursor-pointer">
          <input
            type="checkbox"
            checked={saveToDb}
            onChange={(e) => setSaveToDb(e.target.checked)}
            className="rounded border-white/20"
          />
          <span className="text-sm text-[var(--color-text-muted)]">
            Save to food database for future search
          </span>
        </label>
        <button
          type="button"
          onClick={handleConfirm}
          className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] text-[var(--color-bg)] font-medium px-4 py-3 min-h-[44px]"
        >
          <Check className="w-5 h-5" />
          Add to today&apos;s log
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-[var(--color-text-muted)] py-2 -ml-1 min-h-[44px]"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>
      {!canScan && (
        <p className="text-sm text-[var(--color-warning)] mb-3">
          Add your Claude API key in Settings to use photo scan.
        </p>
      )}
      <label className="text-sm text-[var(--color-text-muted)] mb-1">
        Optional description (helps accuracy)
      </label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="e.g. homemade chicken stir fry with rice, about 2 cups"
        rows={2}
        className="rounded-xl bg-[var(--color-card)] border border-white/10 px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] mb-4 resize-none min-h-[44px]"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={!canScan}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[var(--color-card)] border border-white/10 text-[var(--color-text)] px-4 py-4 min-h-[44px] disabled:opacity-50"
        >
          <Camera className="w-6 h-6" />
          Take photo
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={!canScan}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[var(--color-card)] border border-white/10 text-[var(--color-text)] px-4 py-4 min-h-[44px] disabled:opacity-50"
        >
          <ImagePlus className="w-6 h-6" />
          Choose photo
        </button>
      </div>
    </div>
  );
}

