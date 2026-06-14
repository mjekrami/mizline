"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  cartLineKey,
  cartTotals,
  clearCart,
  loadCart,
  saveCart,
  type CartLine,
  type CartState,
} from "@/lib/cart";

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  addLine: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  updateLineNotes: (key: string, notes: string) => void;
  removeLine: (key: string) => void;
  removeLines: (keys: string[]) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  storeId,
  tableId,
  children,
}: {
  storeId: string;
  tableId: string;
  children: ReactNode;
}) {
  const [cart, setCart] = useState<CartState>({ lines: [] });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(loadCart(storeId, tableId));
    setHydrated(true);
  }, [storeId, tableId]);

  useEffect(() => {
    if (!hydrated) return;
    saveCart(storeId, tableId, cart);
  }, [cart, storeId, tableId, hydrated]);

  const addLine = useCallback(
    (line: Omit<CartLine, "quantity">, quantity = 1) => {
      setCart((prev) => {
        const key = cartLineKey({ ...line, quantity: 1 });
        const existing = prev.lines.find(
          (item) => cartLineKey(item) === key,
        );

        if (existing) {
          return {
            lines: prev.lines.map((item) =>
              cartLineKey(item) === key
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            ),
          };
        }

        return {
          lines: [...prev.lines, { ...line, quantity }],
        };
      });
    },
    [],
  );

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return { lines: prev.lines.filter((item) => cartLineKey(item) !== key) };
      }

      return {
        lines: prev.lines.map((item) =>
          cartLineKey(item) === key ? { ...item, quantity } : item,
        ),
      };
    });
  }, []);

  const updateLineNotes = useCallback((key: string, notes: string) => {
    setCart((prev) => ({
      lines: prev.lines.map((item) => {
        if (cartLineKey(item) !== key) return item;
        return { ...item, notes: notes.trim() || undefined };
      }),
    }));
  }, []);

  const removeLine = useCallback((key: string) => {
    setCart((prev) => ({
      lines: prev.lines.filter((item) => cartLineKey(item) !== key),
    }));
  }, []);

  const removeLines = useCallback((keys: string[]) => {
    const keySet = new Set(keys);
    setCart((prev) => ({
      lines: prev.lines.filter((item) => !keySet.has(cartLineKey(item))),
    }));
  }, []);

  const clear = useCallback(() => {
    setCart({ lines: [] });
    clearCart(storeId, tableId);
  }, [storeId, tableId]);

  const { itemCount, subtotal } = useMemo(() => cartTotals(cart), [cart]);

  const value = useMemo(
    () => ({
      lines: cart.lines,
      itemCount,
      subtotal,
      addLine,
      updateQuantity,
      updateLineNotes,
      removeLine,
      removeLines,
      clear,
    }),
    [
      cart.lines,
      itemCount,
      subtotal,
      addLine,
      updateQuantity,
      updateLineNotes,
      removeLine,
      removeLines,
      clear,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
