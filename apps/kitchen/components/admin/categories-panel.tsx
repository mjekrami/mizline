"use client";

import type { AdminCategory } from "@mizline/shared";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/admin-api";

interface CategoriesPanelProps {
  categories: AdminCategory[];
  onCategoriesChange: (categories: AdminCategory[]) => void;
  onError: (message: string | null) => void;
}

export function CategoriesPanel({
  categories,
  onCategoriesChange,
  onError,
}: CategoriesPanelProps) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    onError(null);

    try {
      const category = await createCategory(name.trim());
      onCategoriesChange(
        [...categories, category].sort((a, b) => a.sortOrder - b.sortOrder),
      );
      setName("");
    } catch (createError) {
      onError(
        createError instanceof Error
          ? createError.message
          : "Failed to create category",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(categoryId: string) {
    if (!editingName.trim()) return;

    setSaving(true);
    onError(null);

    try {
      const updated = await updateCategory(categoryId, {
        name: editingName.trim(),
      });
      onCategoriesChange(
        categories
          .map((category) => (category.id === categoryId ? updated : category))
          .sort((a, b) => a.sortOrder - b.sortOrder),
      );
      setEditingId(null);
      setEditingName("");
    } catch (saveError) {
      onError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to update category",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: AdminCategory) {
    if (
      !window.confirm(
        `Delete "${category.name}"? This only works when the category has no products.`,
      )
    ) {
      return;
    }

    setSaving(true);
    onError(null);

    try {
      await deleteCategory(category.id);
      onCategoriesChange(categories.filter((item) => item.id !== category.id));
    } catch (deleteError) {
      onError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete category",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={(event) => void handleCreate(event)}
        className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 md:flex-row md:items-end"
      >
        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="font-medium">New category</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Seasonal drinks"
            className="rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          Add category
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Products</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No categories yet.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="border-b border-border/70">
                  <td className="px-4 py-3">
                    {editingId === category.id ? (
                      <input
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        className="w-full rounded-md border border-border bg-background px-3 py-1.5"
                      />
                    ) : (
                      category.name
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {category.productCount}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {category.sortOrder}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {editingId === category.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => void handleSave(category.id)}
                            disabled={saving}
                            className="rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-muted"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              setEditingName("");
                            }}
                            className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(category.id);
                              setEditingName(category.name);
                            }}
                            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label={`Edit ${category.name}`}
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(category)}
                            disabled={saving}
                            className="rounded-md p-1 text-muted-foreground hover:bg-error/10 hover:text-error"
                            aria-label={`Delete ${category.name}`}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </>
                      )}
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
