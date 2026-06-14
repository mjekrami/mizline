"use client";

import type { AdminCatalog, AdminProduct } from "@mizline/shared";
import { Loader2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductImage } from "@/components/product-image";
import {
  createProduct,
  deleteProduct,
  parsePriceToCents,
  updateProduct,
} from "@/lib/admin-api";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ProductsPanelProps {
  catalog: AdminCatalog;
  onCatalogChange: (catalog: AdminCatalog) => void;
  onError: (message: string | null) => void;
}

export function ProductsPanel({
  catalog,
  onCatalogChange,
  onError,
}: ProductsPanelProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    categoryId: catalog.categories[0]?.id ?? "",
    name: "",
    description: "",
    price: "",
    image: "",
  });

  const filteredProducts = useMemo(() => {
    if (categoryFilter === "all") return catalog.products;
    return catalog.products.filter(
      (product) => product.categoryId === categoryFilter,
    );
  }, [catalog.products, categoryFilter]);

  function replaceProduct(updated: AdminProduct) {
    onCatalogChange({
      ...catalog,
      products: catalog.products.map((product) =>
        product.id === updated.id ? updated : product,
      ),
    });
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();

    const price = parsePriceToCents(form.price);
    if (!form.categoryId || !form.name.trim() || price === null) {
      onError("Enter a category, product name, and valid price.");
      return;
    }

    setSaving(true);
    onError(null);

    try {
      const product = await createProduct({
        categoryId: form.categoryId,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price,
        image: form.image.trim() || undefined,
      });

      onCatalogChange({
        ...catalog,
        products: [...catalog.products, product].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
        categories: catalog.categories.map((category) =>
          category.id === product.categoryId
            ? { ...category, productCount: category.productCount + 1 }
            : category,
        ),
      });

      setForm((current) => ({
        ...current,
        name: "",
        description: "",
        price: "",
        image: "",
      }));
    } catch (createError) {
      onError(
        createError instanceof Error
          ? createError.message
          : "Failed to create product",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability(product: AdminProduct) {
    setSaving(true);
    onError(null);

    try {
      const updated = await updateProduct(product.id, {
        available: !product.available,
      });
      replaceProduct(updated);
    } catch (toggleError) {
      onError(
        toggleError instanceof Error
          ? toggleError.message
          : "Failed to update product availability",
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveImage(product: AdminProduct, image: string) {
    setSaving(true);
    onError(null);

    try {
      const updated = await updateProduct(product.id, {
        image: image.trim() || null,
      });
      replaceProduct(updated);
    } catch (saveError) {
      onError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to update product image",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: AdminProduct) {
    if (!window.confirm(`Delete "${product.name}"?`)) return;

    setSaving(true);
    onError(null);

    try {
      await deleteProduct(product.id);
      onCatalogChange({
        ...catalog,
        products: catalog.products.filter((item) => item.id !== product.id),
        categories: catalog.categories.map((category) =>
          category.id === product.categoryId
            ? {
                ...category,
                productCount: Math.max(0, category.productCount - 1),
              }
            : category,
        ),
      });
    } catch (deleteError) {
      onError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete product",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={(event) => void handleCreate(event)}
        className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-2 xl:grid-cols-6"
      >
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Category</span>
          <select
            value={form.categoryId}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                categoryId: event.target.value,
              }))
            }
            className="rounded-md border border-border bg-background px-3 py-2"
          >
            {catalog.categories.length === 0 ? (
              <option value="">Create a category first</option>
            ) : (
              catalog.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            )}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Name</span>
          <input
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="e.g. Iced matcha"
            className="rounded-md border border-border bg-background px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Description</span>
          <input
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            placeholder="Optional"
            className="rounded-md border border-border bg-background px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Price (USD)</span>
          <input
            value={form.price}
            onChange={(event) =>
              setForm((current) => ({ ...current, price: event.target.value }))
            }
            placeholder="4.50"
            inputMode="decimal"
            className="rounded-md border border-border bg-background px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm xl:col-span-1">
          <span className="font-medium">Image URL</span>
          <input
            value={form.image}
            onChange={(event) =>
              setForm((current) => ({ ...current, image: event.target.value }))
            }
            placeholder="https://…"
            type="url"
            className="rounded-md border border-border bg-background px-3 py-2"
          />
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={
              saving ||
              !form.categoryId ||
              !form.name.trim() ||
              catalog.categories.length === 0
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            Add product
          </button>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium">Filter</span>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-md border border-border bg-background px-3 py-1.5"
          >
            <option value="all">All categories</option>
            {catalog.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredProducts.length === 0 ? (
          <p className="col-span-full rounded-lg border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            No products in this view.
          </p>
        ) : (
          filteredProducts.map((product) => (
            <article
              key={product.id}
              className="flex flex-col overflow-hidden rounded-lg border border-border bg-card"
            >
              <ProductImage
                src={product.image}
                alt={product.name}
                className="aspect-[4/3] w-full"
              />

              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {product.categoryName}
                    </p>
                  </div>
                  <span className="shrink-0 font-medium">
                    {formatPrice(product.price)}
                  </span>
                </div>

                {product.description ? (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                ) : null}

                <label className="flex flex-col gap-1 text-xs">
                  <span className="font-medium text-muted-foreground">
                    Image URL
                  </span>
                  <input
                    key={`${product.id}-${product.image ?? ""}`}
                    defaultValue={product.image ?? ""}
                    placeholder="https://…"
                    type="url"
                    disabled={saving}
                    onBlur={(event) => {
                      const next = event.target.value.trim();
                      const current = product.image?.trim() ?? "";
                      if (next !== current) {
                        void saveImage(product, next);
                      }
                    }}
                    className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                  />
                </label>

                <div className="mt-auto flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleAvailability(product)}
                    disabled={saving}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      product.available
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {product.available ? "Available" : "Hidden"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(product)}
                    disabled={saving}
                    className="rounded-md p-1 text-muted-foreground hover:bg-error/10 hover:text-error"
                    aria-label={`Delete ${product.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
