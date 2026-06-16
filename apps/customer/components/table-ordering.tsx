"use client";

import type { MenuCategory, MenuProduct, Store } from "@mizline/shared";
import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BottomTabBar, type BottomTab } from "@/components/customer/bottom-tab-bar";
import { CallWaiterButton } from "@/components/customer/call-waiter-button";
import { HeroBanner } from "@/components/customer/hero-banner";
import {
  getHomeGreeting,
  HomeHeader,
  SectionHeader,
} from "@/components/customer/home-header";
import { PopularCarousel } from "@/components/customer/popular-carousel";
import { SplashScreen } from "@/components/customer/splash-screen";
import {
  CartBar,
  CartSheet,
  CategoryTabs,
  MenuCategorySection,
  ProductCard,
  VariantPicker,
  type VariantPickerSelection,
} from "@/components/menu-ui";
import { MyOrdersBanner, useMyOrders } from "@/components/my-orders";
import { CartProvider, useCart } from "@/hooks/use-cart";
import { createOrder } from "@/lib/api/customer";
import { cartLineKey, computeUnitPrice } from "@/lib/cart";
import { hasSeenSplash } from "@/lib/splash-storage";
import {
  buildAvailableProductIds,
  filterMenu,
  productNeedsPicker,
} from "@mizline/shared";
import { addOrderRef } from "@/lib/order/storage";

interface TableOrderingProps {
  store: Store;
  menu: MenuCategory[];
  popularProducts: MenuProduct[];
  tableId: string;
  tableName?: string;
}

function TableOrderingContent({
  store,
  menu,
  popularProducts,
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
  const [showSplash, setShowSplash] = useState(false);
  const [activeTab, setActiveTab] = useState<BottomTab>("home");
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    menu[0]?.id ?? null,
  );

  useEffect(() => {
    setShowSplash(!hasSeenSplash(store.id, tableId));
  }, [store.id, tableId]);

  const allMenuProducts = useMemo(
    () => menu.flatMap((category) => category.products),
    [menu],
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

  const showCategorySections =
    selectedCategoryId === null && !searchQuery.trim();

  function addSimpleProduct(product: MenuProduct) {
    addLine({
      productId: product.id,
      productName: product.name,
      modifiers: [],
      unitPrice: product.price,
    });
  }

  function handleProductSelect(product: MenuProduct) {
    if (productNeedsPicker(product)) {
      setSelectedProduct(product);
      return;
    }

    addSimpleProduct(product);
  }

  function handleQuickAdd(product: MenuProduct) {
    addSimpleProduct(product);
  }

  function handlePickerAdd(selection: VariantPickerSelection) {
    if (!selectedProduct) return;

    const unitPrice = computeUnitPrice(
      selectedProduct.price,
      selection.variant?.priceModifier ?? 0,
      selection.modifiers,
    );

    addLine(
      {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        variantId: selection.variant?.id,
        variantName: selection.variant?.name,
        modifiers: selection.modifiers,
        unitPrice,
        notes: selection.notes,
      },
      selection.quantity ?? 1,
    );
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
      router.push(`/store/${store.id}/table/${tableId}/order/${order.id}`);
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

  function handleViewAllMenu() {
    setSelectedCategoryId(null);
    setSearchQuery("");
    setSearchOpen(false);
  }

  if (showSplash) {
    return (
      <SplashScreen
        storeId={store.id}
        tableId={tableId}
        storeName={store.name}
        onContinue={() => setShowSplash(false)}
      />
    );
  }

  return (
    <div className="flex min-h-dvh flex-col pb-36">
      {activeTab === "home" ? (
        <>
          <div className="customer-home-gradient">
            <HomeHeader
              greeting={getHomeGreeting()}
              title={store.name}
              subtitle={tableName ? `Table ${tableName}` : undefined}
              searchOpen={searchOpen}
              searchQuery={searchQuery}
              onSearchToggle={() => {
                setSearchOpen((open) => !open);
                if (searchOpen) setSearchQuery("");
              }}
              onSearchChange={setSearchQuery}
              trailing={
                !myOrders.loading && myOrders.orders.length > 0 ? (
                  <Link
                    href={`/store/${store.id}/table/${tableId}/orders`}
                    className="customer-icon-btn flex size-11 items-center justify-center rounded-full"
                    aria-label={`My orders (${myOrders.orders.length})`}
                  >
                    <ClipboardList className="size-5" />
                  </Link>
                ) : null
              }
            />

            <HeroBanner
              headline="Sip the Sweetness of"
              subheadline={
                store.name.split(" ").slice(-2).join(" ") || store.name
              }
              products={
                popularProducts.length > 0
                  ? popularProducts.slice(0, 4)
                  : allMenuProducts.slice(0, 4)
              }
            />
          </div>

          {menu.length > 0 ? (
            <div className="customer-category-bar px-5 py-4">
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

          <div className="flex flex-col gap-8 px-5 pt-2">
            <MyOrdersBanner
              storeId={store.id}
              tableId={tableId}
              activeOrders={myOrders.activeOrders}
              refreshing={myOrders.refreshing}
            />

            <CallWaiterButton storeId={store.id} tableId={tableId} />

            {!searchQuery.trim() && popularProducts.length > 0 ? (
              <section className="flex flex-col gap-3">
                <SectionHeader title="Popular" onAction={handleViewAllMenu} />
                <PopularCarousel
                  products={popularProducts}
                  onSelect={handleProductSelect}
                  onQuickAdd={handleQuickAdd}
                />
              </section>
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
              <section className="flex flex-col gap-3">
                <SectionHeader
                  title={
                    menu.find((category) => category.id === selectedCategoryId)
                      ?.name ?? "Menu"
                  }
                />
                <div className="grid grid-cols-2 items-start gap-3">
                  {flatProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={handleProductSelect}
                      onQuickAdd={handleQuickAdd}
                    />
                  ))}
                </div>
              </section>
            )}

          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 py-24 text-center">
          <p className="text-lg font-extrabold">Favorites</p>
          <p className="text-sm text-muted-foreground">
            Tap the heart on a menu item to save it here.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab("home")}
            className="customer-btn-primary mt-2 rounded-full px-6 py-3 text-sm font-bold"
          >
            Browse menu
          </button>
        </div>
      )}

      <CartBar
        itemCount={itemCount}
        subtotal={subtotal}
        onOpenCart={() => setCartOpen(true)}
      />

      <BottomTabBar
        active={activeTab}
        storeId={store.id}
        tableId={tableId}
        onTabChange={setActiveTab}
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
