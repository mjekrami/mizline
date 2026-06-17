"use client";

import type { StoreSettings } from "@mizline/shared";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  fetchStoreSettings,
  updateStoreSettings,
} from "@/lib/api/reports";

export function StoreSettingsPanel() {
  const [settings, setSettings] = useState<StoreSettings>({
    delayWarningMinutes: 5,
    delayCriticalMinutes: 10,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void fetchStoreSettings()
      .then(setSettings)
      .catch((loadError) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load store settings",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const updated = await updateStoreSettings(settings);
      setSettings(updated);
      setSaved(true);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Failed to save settings",
      );
    } finally {
      setSaving(false);
    }
  }, [settings]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading store settings…
      </div>
    );
  }

  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold">Delay alert thresholds</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Kitchen cards and beeps escalate when orders wait longer than these limits.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Warning (minutes)</span>
          <input
            type="number"
            min={1}
            value={settings.delayWarningMinutes}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                delayWarningMinutes: Number(event.target.value),
              }))
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Critical (minutes)</span>
          <input
            type="number"
            min={2}
            value={settings.delayCriticalMinutes}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                delayCriticalMinutes: Number(event.target.value),
              }))
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          />
        </label>
      </div>

      {error ? (
        <p className="mt-3 rounded-md border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
          {error}
        </p>
      ) : null}

      {saved ? (
        <p className="mt-3 text-sm text-success">Settings saved.</p>
      ) : null}

      <button
        type="button"
        disabled={saving}
        onClick={() => void save()}
        className="mt-4 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save settings"}
      </button>
    </section>
  );
}
