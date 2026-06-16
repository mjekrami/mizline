"use client";

import type { MenuCategory, MenuProduct, Order } from "@mizline/shared";
import {
  filterMenu,
  formatPrice,
  getProductFromPrice,
  isOrderModifiable,
} from "@mizline/shared";
import { Loader2, Minus, Plus, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  VariantPicker,
  type VariantPickerSelection,
} from "@/components/menu-ui";
import { useOrderModifications } from "@/hooks/use-order-modifications";
import type { OrderModificationAction } from "@/hooks/use-order-modifications";
import { getMenu } from "@/lib/api/menu";
import { cn } from "@/lib/utils";

interface OrderModifySheetProps {
  order: Order;
  storeId: string;
  open: boolean;
  onClose: () => void;
  onOrderUpdated: (order: Order) => void;
}

export function OrderModifySheet({
  order,
  storeId,
  open,
  onClose,
  onOrderUpdated,
}: OrderModifySheetProps) {
  const [mounted, setMounted] = useState(false);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const canModify = isOrderModifiable(order.status);

  const handleOrderUpdated = useCallback(
    (updated: Order, action: OrderModificationAction) => {
      onOrderUpdated(updated);
      if (action === "add" || action === "remove") {
        setSelectedProduct(null);
        onClose();
      }
    },
    [onClose, onOrderUpdated],
  );

  const { busyKey, addItems, changeItemQuantity, removeItem } =
    useOrderModifications({
      onOrderUpdated: handleOrderUpdated,
      onError: setError,
    });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setSelectedProduct(null);
      setError(null);
      return;
    }

    setSearchQuery("");
    setMenuLoading(true);

    void getMenu(storeId)
      .then(setMenu)
      .catch(() => setError("Could not load menu"))
      .finally(() => setMenuLoading(false));
  }, [open, storeId]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !selectedProduct) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, open, selectedProduct]);

  const filteredMenu = useMemo(
    () => filterMenu(menu, searchQuery),
    [menu, searchQuery],
  );

  const handleAddSelection = useCallback(
    async (selection: VariantPickerSelection) => {
      if (!selectedProduct) return;

      try {
        await addItems(order.id, {
          items: [
            {
              productId: selectedProduct.id,
              variantId: selection.variant?.id,
              modifierOptionIds: selection.modifiers.map(
                (modifier) => modifier.optionId,
              ),
              quantity: 1,
              notes: selection.notes,
            },
          ],
        });
      } catch {
        // Error surfaced via hook.
      }
    },
    [addItems, order.id, selectedProduct],
  );

  if (!mounted || !open) {
    return null;
  }

  const sheet = createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modify-title"
        className="relative flex max-h-[min(92dvh,48rem)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-xl sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Modify order
            </p>
            <h2 id="order-modify-title" className="text-lg font-semibold">
              Table {order.tableName} · {formatPrice(order.total)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </header>

        {!canModify ? (
          <div className="flex flex-1 items-center justify-center px-6 py-12 text-center text-sm text-muted-foreground">
            This order can no longer be changed.
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
            {error ? (
              <p className="rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
                {error}
              </p>
            ) : null}

            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Current items
              </h3>
              <ul className="flex flex-col gap-2">
                {order.items.map((item) => {
                  const busy = busyKey?.includes(item.id) ?? false;

                  return (
                    <li
                      key={item.id}
                      className="rounded-lg border border-border bg-background/60 px-3 py-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {item.productName}
                          </p>
                          {item.variantName ? (
                            <p className="text-xs text-muted-foreground">
                              {item.variantName}
                            </p>
                          ) : null}
                          {item.fulfilled ? (
                            <p className="text-xs text-success">Delivered</p>
                          ) : null}
                        </div>
                        <span className="shrink-0 text-sm font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>

                      {!item.fulfilled ? (
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="inline-flex items-center rounded-md border border-border">
                            <button
                              type="button"
                              disabled={busy || item.quantity <= 1}
                              onClick={() =>
                                void changeItemQuantity(
                                  order.id,
                                  item.id,
                                  item.quantity - 1,
                                )
                              }
                              className="rounded-l-md p-1.5 hover:bg-muted disabled:opacity-40"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="size-3.5" />
                            </button>
                            <span className="min-w-8 px-2 text-center text-sm font-semibold tabular-nums">
                              {busy ? (
                                <Loader2 className="mx-auto size-3.5 animate-spin" />
                              ) : (
                                item.quantity
                              )}
                            </span>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                void changeItemQuantity(
                                  order.id,
                                  item.id,
                                  item.quantity + 1,
                                )
                              }
                              className="rounded-r-md p-1.5 hover:bg-muted disabled:opacity-40"
                              aria-label="Increase quantity"
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            disabled={busy || order.items.length <= 1}
                            onClick={() => void removeItem(order.id, item.id)}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-error hover:bg-error/10 disabled:opacity-40"
                          >
                            <Trash2 className="size-3.5" />
                            Remove
                          </button>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="flex flex-col gap-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Add items
                </h3>
                <p className="text-xs text-muted-foreground">
                  Search and tap a product to add it.
                </p>
              </div>

              <StaffOrderAddMenu
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                menu={filteredMenu}
                loading={menuLoading}
                onSelectProduct={setSelectedProduct}
              />
            </section>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );

  return (
    <>
      {sheet}
      {selectedProduct ? (
        <VariantPicker
          product={selectedProduct}
          open
          onClose={() => setSelectedProduct(null)}
          onAdd={(selection) => {
            void handleAddSelection(selection);
          }}
        />
      ) : null}
    </>
  );
}

interface StaffOrderAddMenuProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  menu: MenuCategory[];
  loading: boolean;
  onSelectProduct: (product: MenuProduct) => void;
}

function StaffOrderAddMenu({
  searchQuery,
  onSearchChange,
  menu,
  loading,
  onSelectProduct,
}: StaffOrderAddMenuProps) {
  return (
    <>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search products…"
          className="w-full rounded-lg border border-border bg-background py-2 pr-3 pl-9 text-sm placeholder:text-muted-foreground focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
          aria-label="Search products"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : menu.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No products match your search.
        </p>
      ) : (
        <div className="flex flex-col gap-4 pb-1">
          {menu.map((category) => (
            <div key={category.id} className="flex flex-col gap-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {category.name}
              </p>
              <ul className="flex flex-col gap-1">
                {category.products.map((product) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => onSelectProduct(product)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-left text-sm transition hover:border-accent/40 hover:bg-muted/40"
                    >
                      <span className="min-w-0 truncate font-medium">
                        {product.name}
                      </span>
                      <span className="shrink-0 text-xs font-medium text-muted-foreground">
                        {formatPrice(getProductFromPrice(product))}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

interface OrderModifyTriggerProps {
  order: Order;
  className?: string;
  onClick: () => void;
}

export function OrderModifyTrigger({
  order,
  className,
  onClick,
}: OrderModifyTriggerProps) {
  if (!isOrderModifiable(order.status)) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition hover:bg-muted",
        className,
      )}
    >
      Modify
    </button>
  );
}
