"use client";

import { useEffect, useRef, useState } from "react";

/** Matches `.kitchen-new-order` glow duration in globals.css (2s × 3 iterations). */
const NEW_ORDER_HIGHLIGHT_MS = 6_000;

/** Tracks order IDs that arrived since mount for a short highlight window. */
export function useKitchenNewOrders(orderIds: string[]) {
  const knownIdsRef = useRef(new Set(orderIds));
  const highlightTimersRef = useRef(new Map<string, number>());
  const [highlightIds, setHighlightIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const fresh = orderIds.filter((id) => !knownIdsRef.current.has(id));
    if (fresh.length === 0) return;

    for (const id of fresh) {
      knownIdsRef.current.add(id);
    }

    setHighlightIds((current) => {
      const next = new Set(current);
      for (const id of fresh) next.add(id);
      return next;
    });

    for (const id of fresh) {
      const timer = window.setTimeout(() => {
        highlightTimersRef.current.delete(id);
        setHighlightIds((current) => {
          if (!current.has(id)) return current;
          const next = new Set(current);
          next.delete(id);
          return next;
        });
      }, NEW_ORDER_HIGHLIGHT_MS);
      highlightTimersRef.current.set(id, timer);
    }
  }, [orderIds]);

  useEffect(() => {
    const timers = highlightTimersRef.current;
    return () => {
      for (const timer of timers.values()) {
        window.clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  return highlightIds;
}
