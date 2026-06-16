"use client";

import type { MenuCategory, MenuProduct, Store } from "@mizline/shared";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CartBar,
  CartSheet,
  MenuCategorySection,
  MenuSearch,
  ProductCard,
  VariantPicker,
  type VariantPickerSelection,
} from "@/components/menu-ui";
import { MyOrdersBanner, MyOrdersNav, useMyOrders } from "@/components/my-orders";
import { CartProvider, useCart } from "@/hooks/use-cart";
import { createOrder } from "@/lib/api";
import { cartLineKey, computeUnitPrice } from "@/lib/cart";
import { addOrderRef } from "@/lib/orders";

interface TableOrderingProps {
  store: Store;
  menu: MenuCategory[];
  tableId: string;
  tableName?: string;
}

function productNeedsPicker(product: MenuProduct): boolean {
  return product.variants.length > 0 || product.modifierGroups.length > 0;
}

function filterMenu(menu: MenuCategory[], query: string): MenuCategory[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return menu;

  return menu
    .map((category) => ({
      ...category,
      products: category.products.filter((product) => {
        const haystack = `${product.name} ${product.description ?? ""}`.toLowerCase();
        return haystack.includes(normalized);
      }),
    }))
    .filter((category) => category.products.length > 0);
}

function buildAvailableProductIds(menu: MenuCategory[]): Set<string> {
  return new Set(
    menu.flatMap((category) => category.products.map((product) => product.id)),
  );
}

function TableOrderingContent({
  store,
  menu,
  tableId,
  tableName,
}: TableOrderingProps) {
  const router = useRouter();
  const {
    lines,
    itemCount,
    subtotal,
    addLine,
    updateQuantity,
    updateLineNotes,
    removeLine,
    removeLines,
    clear,
  } = useCart();
  const myOrders = useMyOrders(store.id, tableId);
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMenu = useMemo(
    () => filterMenu(menu, searchQuery),
    [menu, searchQuery],
  );

  const availableProductIds = useMemo(
    () => buildAvailableProductIds(menu),
    [menu],
  );

  const cartLines = useMemo(
    () =>
      lines.map((line) => ({
        key: cartLineKey(line),
        productName: line.productName,
        variantName: line.variantName,
        modifierNames: line.modifiers.map((modifier) => modifier.name),
        unitPrice: line.unitPrice,
        quantity: line.quantity,
        notes: line.notes,
      })),
    [lines],
  );

  function handleProductSelect(product: MenuProduct) {
    if (productNeedsPicker(product)) {
      setSelectedProduct(product);
      return;
    }

    addLine({
      productId: product.id,
      productName: product.name,
      modifiers: [],
      unitPrice: product.price,
    });
  }

  function handlePickerAdd(selection: VariantPickerSelection) {
    if (!selectedProduct) return;

    const unitPrice = computeUnitPrice(
      selectedProduct.price,
      selection.variant?.priceModifier ?? 0,
      selection.modifiers,
    );

    addLine({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      variantId: selection.variant?.id,
      variantName: selection.variant?.name,
      modifiers: selection.modifiers,
      unitPrice,
      notes: selection.notes,
    });
    setSelectedProduct(null);
  }

  async function handleCheckout() {
    if (lines.length === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      const order = await createOrder(store.id, tableId, {
        items: lines.map((line) => ({
          productId: line.productId,
          variantId: line.variantId,
          modifierOptionIds: line.modifiers.map((modifier) => modifier.optionId),
          quantity: line.quantity,
          notes: line.notes,
        })),
      });

      addOrderRef(store.id, tableId, order.id, order.createdAt);
      clear();
      setCartOpen(false);
      router.push(
        `/store/${store.id}/table/${tableId}/order/${order.id}`,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not place order";

      if (message.includes("invalid or unavailable")) {
        const staleKeys = lines
          .filter((line) => !availableProductIds.has(line.productId))
          .map((line) => cartLineKey(line));

        if (staleKeys.length > 0) {
          removeLines(staleKeys);
          setError(
            "Some items are no longer available and were removed from your cart.",
          );
        } else {
          setError(
            "One or more items are no longer available. Please review your cart.",
          );
        }
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-4 py-4 pr-16 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {tableName ? `Table ${tableName}` : "Table ordering"}
          </p>
          <MyOrdersNav
            storeId={store.id}
            tableId={tableId}
            orders={myOrders.orders}
            loading={myOrders.loading}
          />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{store.name}</h1>
        <MenuSearch value={searchQuery} onChange={setSearchQuery} />
      </header>

      <MyOrdersBanner
        storeId={store.id}
        tableId={tableId}
        activeOrders={myOrders.activeOrders}
        refreshing={myOrders.refreshing}
      />

      <div className="flex flex-1 flex-col gap-8 px-4 py-6 pb-28">
        {filteredMenu.length === 0 ? (
          <p className="text-center text-muted-foreground">
            {searchQuery.trim()
              ? "No matching items found."
              : "Menu is not available right now."}
          </p>
        ) : (
          filteredMenu.map((category) => (
            <MenuCategorySection key={category.id} name={category.name}>
              {category.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={handleProductSelect}
                />
              ))}
            </MenuCategorySection>
          ))
        )}
      </div>

      <CartBar
        itemCount={itemCount}
        subtotal={subtotal}
        onOpenCart={() => setCartOpen(true)}
      />

      <CartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        lines={cartLines}
        subtotal={subtotal}
        submitting={submitting}
        error={error}
        onUpdateQuantity={updateQuantity}
        onUpdateNotes={updateLineNotes}
        onRemove={removeLine}
        onCheckout={handleCheckout}
      />

      {selectedProduct ? (
        <VariantPicker
          product={selectedProduct}
          open={Boolean(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
          onAdd={handlePickerAdd}
        />
      ) : null}
    </>
  );
}

export function TableOrdering(props: TableOrderingProps) {
  return (
    <CartProvider storeId={props.store.id} tableId={props.tableId}>
      <TableOrderingContent {...props} />
    </CartProvider>
  );
}
