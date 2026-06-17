"use client";

import type { Store } from "@mizline/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import { KitchenOrderGrid } from "@/components/kitchen/kitchen-order-grid";
import { KitchenTopBar } from "@/components/kitchen/kitchen-top-bar";
import { useKitchenBoard } from "@/hooks/use-kitchen-board";
import { useKitchenFavorites } from "@/hooks/use-kitchen-favorites";
import { useKitchenNewOrders } from "@/hooks/use-kitchen-new-orders";
import type { KitchenViewMode } from "@/lib/kitchen/display";
import { buildKitchenBoardStats } from "@/lib/kitchen/display";

interface KitchenBoardProps {
  store: Store;
  storeId: string;
  initialOrders: import("@mizline/shared").Order[];
}

export function KitchenBoard({
  store,
  storeId,
  initialOrders,
}: KitchenBoardProps) {
  const {
    visibleOrders,
    loading,
    error,
    advancingId,
    syncingId,
    now,
    connected,
    audioEnabled,
    myOrdersOnly,
    setMyOrdersOnly,
    showMyOrdersFilter,
    refreshOrders,
    syncOrder,
    replaceOrder,
    advanceOrder,
    unlockAudio,
  } = useKitchenBoard({
    storeId,
    initialOrders,
    delayWarningMinutes: store.delayWarningMinutes ?? 5,
    delayCriticalMinutes: store.delayCriticalMinutes ?? 10,
  });

  const { isFavorite, toggleFavorite } = useKitchenFavorites();
  const [fullscreen, setFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<KitchenViewMode>("grid");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await document.documentElement.requestFullscreen();
  }, []);

  const filteredOrders = useMemo(() => {
    if (!favoritesOnly) return visibleOrders;
    return visibleOrders.filter((order) => isFavorite(order.tableId));
  }, [favoritesOnly, isFavorite, visibleOrders]);

  const filteredStats = useMemo(
    () => buildKitchenBoardStats(filteredOrders),
    [filteredOrders],
  );

  const orderIds = useMemo(
    () => filteredOrders.map((order) => order.id),
    [filteredOrders],
  );
  const newOrderIds = useKitchenNewOrders(orderIds);

  return (
    <main className="kitchen-fade-up flex min-h-0 flex-1 flex-col gap-4 p-4 md:overflow-hidden md:p-5">
      <KitchenTopBar
        storeName={store.name}
        stats={filteredStats}
        loading={loading}
        error={error}
        connected={connected}
        audioEnabled={audioEnabled}
        fullscreen={fullscreen}
        viewMode={viewMode}
        favoritesOnly={favoritesOnly}
        showMyOrdersFilter={showMyOrdersFilter}
        myOrdersOnly={myOrdersOnly}
        onRefresh={() => void refreshOrders()}
        onToggleFullscreen={() => void toggleFullscreen()}
        onEnableAudio={unlockAudio}
        onViewModeChange={setViewMode}
        onFavoritesOnlyChange={setFavoritesOnly}
        onMyOrdersOnlyChange={setMyOrdersOnly}
      />

      <KitchenOrderGrid
        orders={filteredOrders}
        storeId={storeId}
        viewMode={viewMode}
        now={now}
        advancingId={advancingId}
        syncingId={syncingId}
        delayWarningMinutes={store.delayWarningMinutes ?? 5}
        delayCriticalMinutes={store.delayCriticalMinutes ?? 10}
        newOrderIds={newOrderIds}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        onAdvance={advanceOrder}
        onSync={(orderId) => void syncOrder(orderId)}
        onOrderUpdated={replaceOrder}
      />
    </main>
  );
}
