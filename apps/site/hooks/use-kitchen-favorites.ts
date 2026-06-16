"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "mizline-kitchen-favorites";

function readFavorites(): Set<string> {
  if (typeof window === "undefined") return new Set();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((entry) => typeof entry === "string"));
  } catch {
    return new Set();
  }
}

function writeFavorites(favorites: Set<string>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
}

export function useKitchenFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => readFavorites());

  useEffect(() => {
    setFavorites(readFavorites());
  }, []);

  const toggleFavorite = useCallback((tableId: string) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(tableId)) {
        next.delete(tableId);
      } else {
        next.add(tableId);
      }
      writeFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (tableId: string) => favorites.has(tableId),
    [favorites],
  );

  return { favorites, toggleFavorite, isFavorite };
}
