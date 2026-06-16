"use client";

import type { AdminTable } from "@mizline/shared";
import { Check, Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  createTable,
  slugifyQrCode,
  updateTable,
} from "@/lib/api/admin";
import { cn } from "@/lib/utils";

interface TablesPanelProps {
  storeId: string;
  tables: AdminTable[];
  customerBaseUrl: string;
  onTablesChange: (tables: AdminTable[]) => void;
  onError: (message: string | null) => void;
}

export function TablesPanel({
  storeId,
  tables,
  customerBaseUrl,
  onTablesChange,
  onError,
}: TablesPanelProps) {
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", qrCode: "" });

  function tableUrl(tableId: string) {
    return `${customerBaseUrl.replace(/\/$/, "")}/store/${storeId}/table/${tableId}`;
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();

    const name = form.name.trim();
    const qrCode = form.qrCode.trim() || slugifyQrCode(name);

    if (!name || !qrCode) {
      onError("Enter a table name.");
      return;
    }

    setSaving(true);
    onError(null);

    try {
      const table = await createTable({ name, qrCode });
      onTablesChange(
        [...tables, table].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setForm({ name: "", qrCode: "" });
    } catch (createError) {
      onError(
        createError instanceof Error
          ? createError.message
          : "Failed to create table",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(table: AdminTable) {
    setSaving(true);
    onError(null);

    try {
      const updated = await updateTable(table.id, { active: !table.active });
      onTablesChange(
        tables.map((item) => (item.id === table.id ? updated : item)),
      );
    } catch (toggleError) {
      onError(
        toggleError instanceof Error
          ? toggleError.message
          : "Failed to update table",
      );
    } finally {
      setSaving(false);
    }
  }

  async function copyLink(table: AdminTable) {
    try {
      await navigator.clipboard.writeText(tableUrl(table.id));
      setCopiedId(table.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      onError("Could not copy link to clipboard.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={(event) => void handleCreate(event)}
        className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-3"
      >
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Table name</span>
          <input
            value={form.name}
            onChange={(event) => {
              const name = event.target.value;
              setForm((current) => ({
                name,
                qrCode: current.qrCode || slugifyQrCode(name),
              }));
            }}
            placeholder="e.g. Bar seating"
            className="rounded-md border border-border bg-background px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">QR code slug</span>
          <input
            value={form.qrCode}
            onChange={(event) =>
              setForm((current) => ({ ...current, qrCode: event.target.value }))
            }
            placeholder="bar-seating"
            className="rounded-md border border-border bg-background px-3 py-2"
          />
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={saving || !form.name.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            Add table
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Table</th>
              <th className="px-4 py-3 font-medium">QR slug</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Customer link</th>
            </tr>
          </thead>
          <tbody>
            {tables.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No tables yet.
                </td>
              </tr>
            ) : (
              tables.map((table) => (
                <tr key={table.id} className="border-b border-border/70">
                  <td className="px-4 py-3 font-medium">{table.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {table.qrCode}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void toggleActive(table)}
                      disabled={saving}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        table.active
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {table.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={tableUrl(table.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="max-w-xs truncate text-primary underline-offset-4 hover:underline"
                      >
                        {tableUrl(table.id)}
                      </a>
                      <button
                        type="button"
                        onClick={() => void copyLink(table)}
                        className="rounded-md border border-border p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={`Copy link for ${table.name}`}
                      >
                        {copiedId === table.id ? (
                          <Check className="size-4 text-success" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
