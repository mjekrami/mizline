"use client";

import type { AdminCatalog, AdminModifierGroup } from "@mizline/shared";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  createModifierGroup,
  createModifierOption,
  deleteModifierGroup,
  deleteModifierOption,
  parsePriceToCents,
  updateModifierOption,
} from "@/lib/api/admin";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ModifiersPanelProps {
  catalog: AdminCatalog;
  onCatalogChange: (catalog: AdminCatalog) => void;
  onError: (message: string | null) => void;
}

export function ModifiersPanel({
  catalog,
  onCatalogChange,
  onError,
}: ModifiersPanelProps) {
  const [saving, setSaving] = useState(false);
  const [groupForm, setGroupForm] = useState({
    name: "",
    minSelect: "0",
    maxSelect: "1",
  });
  const [optionForms, setOptionForms] = useState<
    Record<string, { name: string; price: string }>
  >({});

  function replaceGroup(updated: AdminModifierGroup) {
    onCatalogChange({
      ...catalog,
      modifierGroups: catalog.modifierGroups.map((group) =>
        group.id === updated.id ? updated : group,
      ),
    });
  }

  async function handleCreateGroup(event: React.FormEvent) {
    event.preventDefault();
    if (!groupForm.name.trim()) {
      onError("Enter a modifier group name.");
      return;
    }

    setSaving(true);
    onError(null);

    try {
      const group = await createModifierGroup({
        name: groupForm.name.trim(),
        minSelect: Number(groupForm.minSelect) || 0,
        maxSelect: Number(groupForm.maxSelect) || 1,
      });

      onCatalogChange({
        ...catalog,
        modifierGroups: [...catalog.modifierGroups, group],
      });
      setGroupForm({ name: "", minSelect: "0", maxSelect: "1" });
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to create group");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteGroup(group: AdminModifierGroup) {
    if (!window.confirm(`Delete "${group.name}" and all its options?`)) return;

    setSaving(true);
    onError(null);

    try {
      await deleteModifierGroup(group.id);
      onCatalogChange({
        ...catalog,
        modifierGroups: catalog.modifierGroups.filter(
          (entry) => entry.id !== group.id,
        ),
        products: catalog.products.map((product) => ({
          ...product,
          modifierGroupIds: product.modifierGroupIds.filter(
            (id) => id !== group.id,
          ),
        })),
      });
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to delete group");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddOption(group: AdminModifierGroup) {
    const form = optionForms[group.id] ?? { name: "", price: "0" };
    const price = parsePriceToCents(form.price);
    if (!form.name.trim() || price === null) {
      onError("Enter an option name and valid price.");
      return;
    }

    setSaving(true);
    onError(null);

    try {
      const option = await createModifierOption(group.id, {
        name: form.name.trim(),
        priceModifier: price,
      });

      replaceGroup({
        ...group,
        options: [...group.options, option],
      });
      setOptionForms((current) => ({
        ...current,
        [group.id]: { name: "", price: "0" },
      }));
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to add option");
    } finally {
      setSaving(false);
    }
  }

  async function toggleOptionAvailability(
    group: AdminModifierGroup,
    optionId: string,
  ) {
    const option = group.options.find((entry) => entry.id === optionId);
    if (!option) return;

    setSaving(true);
    onError(null);

    try {
      const updated = await updateModifierOption(group.id, optionId, {
        available: !option.available,
      });
      replaceGroup({
        ...group,
        options: group.options.map((entry) =>
          entry.id === optionId ? updated : entry,
        ),
      });
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Failed to update option",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteOption(group: AdminModifierGroup, optionId: string) {
    setSaving(true);
    onError(null);

    try {
      await deleteModifierOption(group.id, optionId);
      replaceGroup({
        ...group,
        options: group.options.filter((entry) => entry.id !== optionId),
      });
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to delete option");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={(event) => void handleCreateGroup(event)}
        className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-4"
      >
        <label className="flex flex-col gap-1.5 text-sm md:col-span-2">
          <span className="font-medium">Group name</span>
          <input
            value={groupForm.name}
            onChange={(event) =>
              setGroupForm((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="e.g. Milk"
            className="rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Min select</span>
          <input
            type="number"
            min={0}
            value={groupForm.minSelect}
            onChange={(event) =>
              setGroupForm((current) => ({
                ...current,
                minSelect: event.target.value,
              }))
            }
            className="rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Max select</span>
          <input
            type="number"
            min={1}
            value={groupForm.maxSelect}
            onChange={(event) =>
              setGroupForm((current) => ({
                ...current,
                maxSelect: event.target.value,
              }))
            }
            className="rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <div className="md:col-span-4">
          <button
            type="submit"
            disabled={saving || !groupForm.name.trim()}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            Add modifier group
          </button>
        </div>
      </form>

      {catalog.modifierGroups.length === 0 ? (
        <p className="rounded-lg border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          No modifier groups yet. Create groups for milk, syrups, extra shots, etc.
        </p>
      ) : (
        catalog.modifierGroups.map((group) => {
          const optionForm = optionForms[group.id] ?? { name: "", price: "0" };

          return (
            <article
              key={group.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium">{group.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Select {group.minSelect}–{group.maxSelect}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDeleteGroup(group)}
                  disabled={saving}
                  className="rounded-md p-1 text-muted-foreground hover:bg-error/10 hover:text-error"
                  aria-label={`Delete ${group.name}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <ul className="mb-4 flex flex-col gap-2">
                {group.options.length === 0 ? (
                  <li className="text-sm text-muted-foreground">No options yet.</li>
                ) : (
                  group.options.map((option) => (
                    <li
                      key={option.id}
                      className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
                    >
                      <div>
                        <span className="font-medium">{option.name}</span>
                        <span className="ml-2 text-muted-foreground">
                          {option.priceModifier > 0
                            ? `+${formatPrice(option.priceModifier)}`
                            : "Included"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            void toggleOptionAvailability(group, option.id)
                          }
                          disabled={saving}
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            option.available
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {option.available ? "Available" : "Hidden"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteOption(group, option.id)}
                          disabled={saving}
                          className="rounded-md p-1 text-muted-foreground hover:bg-error/10 hover:text-error"
                          aria-label={`Delete ${option.name}`}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>

              <div className="grid gap-2 sm:grid-cols-[1fr_8rem_auto]">
                <input
                  value={optionForm.name}
                  onChange={(event) =>
                    setOptionForms((current) => ({
                      ...current,
                      [group.id]: {
                        ...optionForm,
                        name: event.target.value,
                      },
                    }))
                  }
                  placeholder="Option name"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
                <input
                  value={optionForm.price}
                  onChange={(event) =>
                    setOptionForms((current) => ({
                      ...current,
                      [group.id]: {
                        ...optionForm,
                        price: event.target.value,
                      },
                    }))
                  }
                  placeholder="0.00"
                  inputMode="decimal"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => void handleAddOption(group)}
                  disabled={saving}
                  className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60"
                >
                  Add option
                </button>
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}
