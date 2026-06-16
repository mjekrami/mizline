"use client";

import type { AdminCatalog, AdminProduct } from "@mizline/shared";
import { Loader2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductImage } from "@/components/product-image";
import {
  createProduct,
  createVariant,
  deleteProduct,
  deleteVariant,
  parsePriceToCents,
  setProductModifierGroups,
  updateProduct,
} from "@/lib/api/admin";
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
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    categoryId: catalog.categories[0]?.id ?? "",
    name: "",
    description: "",
    price: "",
    image: "",
  });
  const [variantForms, setVariantForms] = useState<
    Record<string, { name: string; price: string }>
  >({});

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

  async function handleAddVariant(product: AdminProduct) {
    const variantForm = variantForms[product.id] ?? { name: "", price: "0" };
    const priceModifier = parsePriceToCents(variantForm.price);
    if (!variantForm.name.trim() || priceModifier === null) {
      onError("Enter a variant name and valid price modifier.");
      return;
    }

    setSaving(true);
    onError(null);

    try {
      const variant = await createVariant(product.id, {
        name: variantForm.name.trim(),
        priceModifier,
      });

      replaceProduct({
        ...product,
        variants: [...product.variants, variant].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      });
      setVariantForms((current) => ({
        ...current,
        [product.id]: { name: "", price: "0" },
      }));
    } catch (createError) {
      onError(
        createError instanceof Error
          ? createError.message
          : "Failed to create variant",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteVariant(product: AdminProduct, variantId: string) {
    setSaving(true);
    onError(null);

    try {
      await deleteVariant(product.id, variantId);
      replaceProduct({
        ...product,
        variants: product.variants.filter((variant) => variant.id !== variantId),
      });
    } catch (deleteError) {
      onError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete variant",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleModifierGroup(
    product: AdminProduct,
    groupId: string,
    checked: boolean,
  ) {
    const nextGroupIds = checked
      ? [...product.modifierGroupIds, groupId]
      : product.modifierGroupIds.filter((id) => id !== groupId);

    setSaving(true);
    onError(null);

    try {
      const updated = await setProductModifierGroups(product.id, nextGroupIds);
      replaceProduct(updated);
    } catch (updateError) {
      onError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to update modifier groups",
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
          filteredProducts.map((product) => {
            const expanded = expandedProductId === product.id;
            const variantForm = variantForms[product.id] ?? {
              name: "",
              price: "0",
            };

            return (
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

                  <p className="text-xs text-muted-foreground">
                    {product.variants.length} variant
                    {product.variants.length === 1 ? "" : "s"} ·{" "}
                    {product.modifierGroupIds.length} modifier group
                    {product.modifierGroupIds.length === 1 ? "" : "s"}
                  </p>

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

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedProductId(expanded ? null : product.id)
                    }
                    className="text-left text-sm font-medium text-primary hover:underline"
                  >
                    {expanded ? "Hide customization" : "Manage sizes & modifiers"}
                  </button>

                  {expanded ? (
                    <div className="flex flex-col gap-4 rounded-md border border-border bg-muted/20 p-3 text-sm">
                      <div>
                        <p className="mb-2 font-medium">Size variants</p>
                        {product.variants.length > 0 ? (
                          <ul className="mb-2 flex flex-col gap-1">
                            {product.variants.map((variant) => (
                              <li
                                key={variant.id}
                                className="flex items-center justify-between gap-2"
                              >
                                <span>
                                  {variant.name} (
                                  {variant.priceModifier >= 0 ? "+" : ""}
                                  {formatPrice(variant.priceModifier)})
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleDeleteVariant(product, variant.id)
                                  }
                                  disabled={saving}
                                  className="text-muted-foreground hover:text-error"
                                  aria-label={`Delete ${variant.name}`}
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mb-2 text-xs text-muted-foreground">
                            No variants yet.
                          </p>
                        )}
                        <div className="grid gap-2 sm:grid-cols-[1fr_6rem_auto]">
                          <input
                            value={variantForm.name}
                            onChange={(event) =>
                              setVariantForms((current) => ({
                                ...current,
                                [product.id]: {
                                  ...variantForm,
                                  name: event.target.value,
                                },
                              }))
                            }
                            placeholder="e.g. Large"
                            className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                          />
                          <input
                            value={variantForm.price}
                            onChange={(event) =>
                              setVariantForms((current) => ({
                                ...current,
                                [product.id]: {
                                  ...variantForm,
                                  price: event.target.value,
                                },
                              }))
                            }
                            placeholder="+1.00"
                            inputMode="decimal"
                            className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => void handleAddVariant(product)}
                            disabled={saving}
                            className="rounded-md bg-background px-2 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-60"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 font-medium">Modifier groups</p>
                        {catalog.modifierGroups.length === 0 ? (
                          <p className="text-xs text-muted-foreground">
                            Create modifier groups on the Modifiers tab first.
                          </p>
                        ) : (
                          <ul className="flex flex-col gap-1">
                            {catalog.modifierGroups.map((group) => (
                              <li key={group.id}>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={product.modifierGroupIds.includes(
                                      group.id,
                                    )}
                                    disabled={saving}
                                    onChange={(event) =>
                                      void toggleModifierGroup(
                                        product,
                                        group.id,
                                        event.target.checked,
                                      )
                                    }
                                  />
                                  <span>{group.name}</span>
                                </label>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ) : null}

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
            );
          })
        )}
      </div>
    </div>
  );
}
