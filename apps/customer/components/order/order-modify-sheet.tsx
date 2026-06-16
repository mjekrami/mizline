"use client";

import type { MenuCategory, MenuProduct, Order } from "@mizline/shared";
import { canCustomerAddItems, filterMenu, formatPrice } from "@mizline/shared";
import { Loader2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  MenuCategorySection,
  MenuSearch,
  ProductCard,
  VariantPicker,
  type VariantPickerSelection,
} from "@/components/menu-ui";
import { useOrderModifications } from "@/hooks/use-order-modifications";
import type { OrderModificationAction } from "@/hooks/use-order-modifications";
import { getMenu } from "@/lib/api/customer";
import { cn } from "@/lib/utils";

interface OrderModifySheetProps {
  order: Order;
  storeId: string;
  tableId: string;
  open: boolean;
  onClose: () => void;
  onOrderUpdated: (order: Order) => void;
}

export function OrderModifySheet({
  order,
  storeId,
  tableId,
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

  const canModify = canCustomerAddItems(order.status);

  const handleOrderUpdated = useCallback(
    (updated: Order, action: OrderModificationAction) => {
      onOrderUpdated(updated);
      if (action === "add") {
        setSelectedProduct(null);
        onClose();
      }
    },
    [onClose, onOrderUpdated],
  );

  const { busyKey, addItems } = useOrderModifications({
    storeId,
    tableId,
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
        // Error surfaced via onError in useOrderModifications.
      }
    },
    [addItems, order.id, selectedProduct],
  );

  if (!mounted || !open) {
    return null;
  }

  const sheet = createPortal(
    <div className="customer-overlay-view fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
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
              Add items
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

            <section className="flex flex-col gap-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Add items
                </h3>
                <p className="text-xs text-muted-foreground">
                  Choose from the menu to add to this order.
                </p>
              </div>

              <MenuSearch value={searchQuery} onChange={setSearchQuery} />

              {menuLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredMenu.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No menu items available.
                </p>
              ) : (
                <div className="flex flex-col gap-6 pb-2">
                  {filteredMenu.map((category) => (
                    <MenuCategorySection key={category.id} name={category.name}>
                      {category.products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onSelect={setSelectedProduct}
                        />
                      ))}
                    </MenuCategorySection>
                  ))}
                </div>
              )}
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
  if (!canCustomerAddItems(order.status)) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition hover:bg-muted",
        className,
      )}
    >
      Add items
    </button>
  );
}
