"use client";

import type { MenuCategory, MenuProduct, MenuVariant, Store } from "@mizline/shared";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CartBar,
  CartSheet,
  MenuCategorySection,
  ProductCard,
  VariantPicker,
} from "@/components/menu-ui";
import { MyOrdersBanner, MyOrdersNav, useMyOrders } from "@/components/my-orders";
import { CartProvider, useCart } from "@/hooks/use-cart";
import { createOrder } from "@/lib/api";
import { cartLineKey } from "@/lib/cart";
import { addOrderRef } from "@/lib/orders";

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
  const { lines, itemCount, subtotal, addLine, updateQuantity, removeLine, clear } =
    useCart();
  const myOrders = useMyOrders(store.id, tableId);
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cartLines = useMemo(
    () =>
      lines.map((line) => ({
        key: cartLineKey(line),
        productName: line.productName,
        variantName: line.variantName,
        unitPrice: line.unitPrice,
        quantity: line.quantity,
      })),
    [lines],
  );

  function handleProductSelect(product: MenuProduct) {
    if (product.variants.length > 0) {
      setSelectedProduct(product);
      return;
    }

    addLine({
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
    });
  }

  function handleVariantAdd(variant?: MenuVariant) {
    if (!selectedProduct) return;

    const unitPrice = selectedProduct.price + (variant?.priceModifier ?? 0);
    addLine({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      variantId: variant?.id,
      variantName: variant?.name,
      unitPrice,
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
      setError(err instanceof Error ? err.message : "Could not place order");
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
      </header>

      <MyOrdersBanner
        storeId={store.id}
        tableId={tableId}
        activeOrders={myOrders.activeOrders}
        refreshing={myOrders.refreshing}
      />

      <div className="flex flex-1 flex-col gap-8 px-4 py-6 pb-28">
        {menu.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Menu is not available right now.
          </p>
        ) : (
          menu.map((category) => (
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
        onRemove={removeLine}
        onCheckout={handleCheckout}
      />

      {selectedProduct ? (
        <VariantPicker
          product={selectedProduct}
          open={Boolean(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
          onAdd={handleVariantAdd}
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
