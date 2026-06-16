"use client";

import type { Order, OrderStatus } from "@mizline/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fulfillOrderItem,
  updateOrderStatus,
} from "@/lib/kitchen-api";
import { getNextOrderStatus } from "@/lib/order-status";

export type OrderStatusFilter = "all" | OrderStatus;

interface UseAdminOrdersOptions {
  orders: Order[];
  onOrdersChange: (orders: Order[]) => void;
  selectedOrderId: string | null;
  onSelectOrderId: (orderId: string | null) => void;
}

export function useAdminOrders({
  orders,
  onOrdersChange,
  selectedOrderId,
  onSelectOrderId,
}: UseAdminOrdersOptions) {
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("all");
  const [advancingId, setAdvancingId] = useState<string | null>(null);
  const [fulfillingItemId, setFulfillingItemId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selectedOrderId) return;

    const order = orders.find((entry) => entry.id === selectedOrderId);
    if (!order) return;

    setStatusFilter((current) => {
      if (current !== "all" && order.status !== current) {
        return "all";
      }
      return current;
    });
  }, [orders, selectedOrderId]);

  const setStatusFilterAndSelection = useCallback(
    (filter: OrderStatusFilter) => {
      setStatusFilter(filter);

      if (filter !== "all" && selectedOrderId) {
        const order = orders.find((entry) => entry.id === selectedOrderId);
        if (order && order.status !== filter) {
          onSelectOrderId(null);
        }
      }
    },
    [onSelectOrderId, orders, selectedOrderId],
  );

  const updateOrderInList = useCallback(
    (updated: Order) => {
      onOrdersChange(
        orders.map((entry) => (entry.id === updated.id ? updated : entry)),
      );
    },
    [onOrdersChange, orders],
  );

  const advanceOrder = useCallback(async (order: Order) => {
    const nextStatus = getNextOrderStatus(order.status);
    if (!nextStatus) return;

    setAdvancingId(order.id);

    try {
      const updated = await updateOrderStatus(order.id, nextStatus);
      updateOrderInList(updated);
    } finally {
      setAdvancingId(null);
    }
  }, [updateOrderInList]);

  const fulfillItem = useCallback(async (order: Order, itemId: string) => {
    setFulfillingItemId(itemId);

    try {
      const updated = await fulfillOrderItem(order.id, itemId);
      updateOrderInList(updated);
    } finally {
      setFulfillingItemId(null);
    }
  }, [updateOrderInList]);

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      ),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return sortedOrders;
    return sortedOrders.filter((order) => order.status === statusFilter);
  }, [sortedOrders, statusFilter]);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  const statusCounts = useMemo(() => {
    const counts: Record<OrderStatusFilter, number> = {
      all: orders.length,
      new: 0,
      preparing: 0,
      ready: 0,
      fulfilled: 0,
      cancelled: 0,
    };

    for (const order of orders) {
      counts[order.status] += 1;
    }

    return counts;
  }, [orders]);

  return {
    orders: filteredOrders,
    selectedOrder,
    selectedOrderId,
    setSelectedOrderId: onSelectOrderId,
    statusFilter,
    setStatusFilter: setStatusFilterAndSelection,
    statusCounts,
    advancingId,
    fulfillingItemId,
    now,
    advanceOrder,
    fulfillItem,
  };
}
