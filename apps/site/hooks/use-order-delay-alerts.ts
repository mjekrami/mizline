"use client";

import type { Order } from "@mizline/shared";
import { getWaitUrgency, type WaitUrgencyThresholds } from "@mizline/shared";
import { useEffect, useRef } from "react";
import { playDelayAlert } from "@/lib/order-alert";

type AlertTier = "warning" | "critical";

interface UseOrderDelayAlertsOptions {
  orders: Order[];
  now: number;
  thresholds: WaitUrgencyThresholds;
  audioEnabled: boolean;
}

export function useOrderDelayAlerts({
  orders,
  now,
  thresholds,
  audioEnabled,
}: UseOrderDelayAlertsOptions) {
  const alertedTiers = useRef(new Map<string, Set<AlertTier>>());

  useEffect(() => {
    if (!audioEnabled) return;

    for (const order of orders) {
      if (order.status === "fulfilled" || order.status === "cancelled") {
        alertedTiers.current.delete(order.id);
        continue;
      }

      const urgency = getWaitUrgency(order.createdAt, now, thresholds);
      const tiers = alertedTiers.current.get(order.id) ?? new Set<AlertTier>();

      if (urgency === "warning" && !tiers.has("warning")) {
        tiers.add("warning");
        playDelayAlert();
      }

      if (urgency === "critical" && !tiers.has("critical")) {
        tiers.add("critical");
        playDelayAlert();
      }

      alertedTiers.current.set(order.id, tiers);
    }
  }, [audioEnabled, now, orders, thresholds]);
}
