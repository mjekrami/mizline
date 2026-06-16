"use client";

import type { MenuCategory, MenuProduct, Store } from "@mizline/shared";
import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CartBar,
  CartSheet,
  CategoryTabs,
  MenuCategorySection,
  MenuSearch,
  ProductCard,
  VariantPicker,
  type VariantPickerSelection,
} from "@/components/menu-ui";
import { MyOrdersBanner, useMyOrders } from "@/components/my-orders";
import { CartProvider, useCart } from "@/hooks/use-cart";
import { createOrder } from "@/lib/api/customer";
import { cartLineKey, computeUnitPrice } from "@/lib/cart";
import {
  buildAvailableProductIds,
  filterMenu,
  productNeedsPicker,
} from "@/lib/menu/filter";
import { addOrderRef } from "@/lib/order/storage";

interface TableOrderingProps {
  store: Store;
  menu: MenuCategory[];
  tableId: string;
  tableName?: string;
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const filteredMenu = useMemo(
    () => filterMenu(menu, searchQuery, selectedCategoryId),
    [menu, searchQuery, selectedCategoryId],
  );

  const flatProducts = useMemo(
    () => filteredMenu.flatMap((category) => category.products),
    [filteredMenu],
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

  function handleQuickAdd(product: MenuProduct) {
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

  const showCategorySections =
    selectedCategoryId === null && !searchQuery.trim();

  return (
    <div className="flex flex-col">
      <div className="px-4 pb-2 pt-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {tableName ?? "Your table"}
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {store.name}
            </h1>
          </div>
          {!myOrders.loading && myOrders.orders.length > 0 ? (
            <Link
              href={`/store/${store.id}/table/${tableId}/orders`}
              className="customer-icon-btn flex size-11 items-center justify-center rounded-2xl text-foreground"
              aria-label={`My orders (${myOrders.orders.length})`}
            >
              <ClipboardList className="size-5" />
            </Link>
          ) : null}
        </div>
      </div>

      <div className="customer-category-bar px-4 pb-3 pt-1">
        <MenuSearch value={searchQuery} onChange={setSearchQuery} />

        {menu.length > 0 ? (
          <div className="mt-3">
            <CategoryTabs
              categories={menu.map((category) => ({
                id: category.id,
                name: category.name,
              }))}
              selectedId={selectedCategoryId}
              onSelect={setSelectedCategoryId}
            />
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-6 px-4 pt-4 pb-32">
        <MyOrdersBanner
          storeId={store.id}
          tableId={tableId}
          activeOrders={myOrders.activeOrders}
          refreshing={myOrders.refreshing}
        />
        {!searchQuery.trim() && selectedCategoryId === null ? (
          <div className="customer-hero relative overflow-hidden rounded-3xl px-5 py-6">
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-widest customer-text-accent">
                Welcome
              </p>
              <h2 className="mt-1 text-xl font-extrabold leading-tight">
                Find the best coffee{" "}
                <span className="customer-text-accent">for you</span>
              </h2>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                Browse the menu, customize your order, and pay at the counter.
              </p>
            </div>
          </div>
        ) : null}

        {filteredMenu.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            {searchQuery.trim()
              ? "No matching items found."
              : "Menu is not available right now."}
          </p>
        ) : showCategorySections ? (
          filteredMenu.map((category) => (
            <MenuCategorySection key={category.id} name={category.name}>
              {category.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={handleProductSelect}
                  onQuickAdd={handleQuickAdd}
                />
              ))}
            </MenuCategorySection>
          ))
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {flatProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={handleProductSelect}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </div>
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
    </div>
  );
}

export function TableOrdering(props: TableOrderingProps) {
  return (
    <CartProvider storeId={props.store.id} tableId={props.tableId}>
      <TableOrderingContent {...props} />
    </CartProvider>
  );
}
